import { NextRequest } from 'next/server';

// Proxy a tone WAV from the (private) repo so the browser can preview it.
const REPO = process.env.GITHUB_REPO || 'itsramananshul/master-brain';
const TOKEN = process.env.GITHUB_TOKEN || '';

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || '';
  if ((!path.startsWith('tones/') && !path.startsWith('RecycleBin/')) || path.includes('..')) {
    return new Response('bad path', { status: 400 });
  }
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(path)}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.raw', 'User-Agent': 'aria-web' },
  });
  if (!r.ok) return new Response('not found', { status: 404 });
  const buf = Buffer.from(await r.arrayBuffer());
  return new Response(buf, {
    headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'public, max-age=600' },
  });
}
