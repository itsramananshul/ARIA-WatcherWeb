const REPO = process.env.GITHUB_REPO || 'itsramananshul/master-brain';
const TOKEN = process.env.GITHUB_TOKEN || '';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

export type GhEntry = { name: string; type: string; size: number; path: string; download_url: string | null };

export async function listDir(path: string): Promise<GhEntry[]> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(path)}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'aria-web' },
    cache: 'no-store',
  });
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? (data as GhEntry[]) : [];
}

export async function getText(path: string): Promise<string> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(path)}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.raw', 'User-Agent': 'aria-web' },
    cache: 'no-store',
  });
  return r.ok ? r.text() : '';
}

const ghHeaders = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'aria-web',
  'Content-Type': 'application/json',
};

// Returns the blob sha, or null if the file doesn't exist.
export async function getSha(path: string): Promise<string | null> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(path)}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'aria-web' },
    cache: 'no-store',
  });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  const j = await r.json();
  return j.sha ?? null;
}

// Create or overwrite a text file.
export async function putText(path: string, text: string, message: string): Promise<boolean> {
  const sha = await getSha(path);
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(text, 'utf8').toString('base64'),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(path)}`, {
    method: 'PUT', headers: ghHeaders, body: JSON.stringify(body),
  });
  return r.ok;
}

// Delete a file (no-op if it doesn't exist).
export async function deleteFile(path: string, message: string): Promise<boolean> {
  const sha = await getSha(path);
  if (!sha) return true; // already gone
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(path)}`, {
    method: 'DELETE', headers: ghHeaders, body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  return r.ok;
}
