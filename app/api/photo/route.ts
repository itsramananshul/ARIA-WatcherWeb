import { NextRequest } from 'next/server';
import { isRequestAuthed } from '@/lib/auth';

// Proxy a photo from the (private) GitHub repo so the browser can show it
// without exposing the token.
const REPO = process.env.GITHUB_REPO || 'itsramananshul/master-brain';
const TOKEN = process.env.GITHUB_TOKEN || '';

export async function GET(req: NextRequest) {
  if (!(await isRequestAuthed(req))) return new Response('unauthorized', { status: 401 });
  const path = req.nextUrl.searchParams.get('path') || '';
  // Allow live photos and recycled photos (so the Recycle Bin can show thumbnails).
  if ((!path.startsWith('photos/') && !path.startsWith('RecycleBin/')) || path.includes('..')) {
    return new Response('bad path', { status: 400 });
  }
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(path)}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.raw', 'User-Agent': 'aria-web' },
  });
  if (!r.ok) return new Response('not found', { status: 404 });
  const buf = Buffer.from(await r.arrayBuffer());
  return new Response(buf, {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' },
  });
}
