import { NextRequest } from 'next/server';
import { isRequestAuthed } from '@/lib/auth';

// Proxy a browser voice turn to ARIA's backend (keeps the shared token
// server-side). Body = 16kHz mono WAV. Returns { you, aria, audio(base64 wav) }.
const BASE = (process.env.SUPABASE_URL || '') + '/functions/v1/aria-watcher';
const TOKEN = process.env.WATCHER_SHARED_TOKEN || '';
const BOUNDARY = '---sensecraftboundary---';

export async function POST(req: NextRequest) {
  if (!(await isRequestAuthed(req))) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const wav = Buffer.from(await req.arrayBuffer());
  if (wav.length < 64) return Response.json({ error: 'empty audio' }, { status: 400 });

  const r = await fetch(`${BASE}/audio_stream?engine=current&voice=Kore`, {
    method: 'POST',
    headers: {
      'Authorization': TOKEN,
      'api-obiter-device-eui': 'web-console',
      'Content-Type': 'application/octet-stream',
    },
    body: wav,
  });
  if (!r.ok) return Response.json({ error: `backend ${r.status}` }, { status: 502 });

  const buf = Buffer.from(await r.arrayBuffer());
  const idx = buf.indexOf(BOUNDARY);
  if (idx < 0) return Response.json({ error: 'malformed response' }, { status: 502 });

  let meta: { data?: { stt_result?: string; screen_text?: string } } = {};
  try { meta = JSON.parse(buf.subarray(0, idx).toString('utf8')); } catch { /* ignore */ }

  let audioStart = idx + BOUNDARY.length;
  if (buf[audioStart] === 0x0a) audioStart++; // skip trailing \n
  const audio = buf.subarray(audioStart);

  return Response.json({
    you: meta?.data?.stt_result || '',
    aria: meta?.data?.screen_text || '',
    audio: audio.toString('base64'),
  });
}
