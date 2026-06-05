import { listDir, getBytesBase64, putBase64, deleteFile } from '@/lib/github';

// Soft-delete model: instead of removing a repo file, we MOVE it into a
// RecycleBin/ folder (copy + delete original). Items are kept RETENTION_DAYS
// then a daily cron purges anything past its window. Everything needed to
// restore (the original path) + the deletion time is encoded in the filename:
//
//   RecycleBin/<deletedAtMs>__<hex(origPath)>__<basename>
//
// hex(origPath) is 0-9a-f only, so it never collides with the "__" delimiter.
// The trailing basename is purely cosmetic (nice to read in the GitHub UI).

export const RECYCLE_DIR = 'RecycleBin';
export const RETENTION_DAYS = 10;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

function basename(p: string): string {
  const i = p.lastIndexOf('/');
  return i >= 0 ? p.slice(i + 1) : p;
}

function encodeRecycleName(origPath: string, deletedAtMs: number): string {
  const hex = Buffer.from(origPath, 'utf8').toString('hex');
  return `${deletedAtMs}__${hex}__${basename(origPath)}`;
}

export type RecycleItem = {
  recyclePath: string; // RecycleBin/<name>
  origPath: string; // e.g. photos/photo_123.jpg
  basename: string;
  kind: 'photo' | 'recording' | 'file';
  deletedAtMs: number;
  expiresAtMs: number;
  expired: boolean;
};

function parseRecycleName(name: string, nowMs: number): RecycleItem | null {
  const parts = name.split('__');
  if (parts.length < 2) return null;
  const deletedAtMs = Number(parts[0]);
  if (!Number.isFinite(deletedAtMs)) return null;
  let origPath: string;
  try {
    origPath = Buffer.from(parts[1], 'hex').toString('utf8');
  } catch {
    return null;
  }
  if (!origPath || origPath.includes('..')) return null;
  const top = origPath.split('/')[0];
  const kind = top === 'photos' ? 'photo' : top === 'recordings' ? 'recording' : 'file';
  const expiresAtMs = deletedAtMs + RETENTION_MS;
  return {
    recyclePath: `${RECYCLE_DIR}/${name}`,
    origPath,
    basename: basename(origPath),
    kind,
    deletedAtMs,
    expiresAtMs,
    expired: nowMs >= expiresAtMs,
  };
}

// Move a repo file into the Recycle Bin. Returns false if the file is missing
// or the copy/delete failed.
export async function moveToRecycleBin(origPath: string, nowMs: number): Promise<boolean> {
  if (!origPath || origPath.includes('..') || origPath.startsWith(`${RECYCLE_DIR}/`)) return false;
  const b64 = await getBytesBase64(origPath);
  if (b64 === null) return false;
  const recyclePath = `${RECYCLE_DIR}/${encodeRecycleName(origPath, nowMs)}`;
  if (!(await putBase64(recyclePath, b64, `recycle: ${origPath} -> ${recyclePath}`))) return false;
  return deleteFile(origPath, `recycle: remove original ${origPath}`);
}

// Put a recycled file back where it came from.
export async function restoreFromRecycleBin(recyclePath: string, nowMs: number): Promise<boolean> {
  const item = parseRecycleName(basename(recyclePath), nowMs);
  if (!item) return false;
  const b64 = await getBytesBase64(recyclePath);
  if (b64 === null) return false;
  if (!(await putBase64(item.origPath, b64, `restore: ${recyclePath} -> ${item.origPath}`))) return false;
  return deleteFile(recyclePath, `restore: remove from recycle ${recyclePath}`);
}

// Permanently delete a recycled file.
export async function deleteForeverFromRecycleBin(recyclePath: string): Promise<boolean> {
  if (!recyclePath.startsWith(`${RECYCLE_DIR}/`) || recyclePath.includes('..')) return false;
  return deleteFile(recyclePath, `purge: ${recyclePath}`);
}

export async function listRecycleBin(nowMs: number): Promise<RecycleItem[]> {
  const entries = await listDir(RECYCLE_DIR);
  return entries
    .filter((e) => e.type === 'file')
    .map((e) => parseRecycleName(e.name, nowMs))
    .filter((x): x is RecycleItem => x !== null)
    .sort((a, b) => b.deletedAtMs - a.deletedAtMs);
}

// Delete every item past its 10-day window. Returns the purged paths.
export async function purgeExpired(nowMs: number): Promise<string[]> {
  const items = await listRecycleBin(nowMs);
  const purged: string[] = [];
  for (const it of items) {
    if (it.expired && (await deleteForeverFromRecycleBin(it.recyclePath))) purged.push(it.recyclePath);
  }
  return purged;
}
