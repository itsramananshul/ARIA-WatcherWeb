const REPO = process.env.GITHUB_REPO || 'itsramananshul/master-brain';
const TOKEN = process.env.GITHUB_TOKEN || '';

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
