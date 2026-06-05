'use client';

import { useRef, useState } from 'react';
import { startRecorder, blobToWav16k, type Recorder } from '@/lib/recorder';

type Msg = { role: 'you' | 'aria'; text: string };

export default function TalkClient() {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const recRef = useRef<Recorder | null>(null);

  async function toggle() {
    setError('');
    if (recording) {
      // stop -> process
      setRecording(false);
      setBusy(true);
      try {
        const blob = await recRef.current!.stop();
        recRef.current = null;
        const wav = await blobToWav16k(blob);
        const r = await fetch('/api/talk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: wav,
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'failed');
        const next: Msg[] = [];
        if (j.you) next.push({ role: 'you', text: j.you });
        if (j.aria) next.push({ role: 'aria', text: j.aria });
        setMsgs((m) => [...m, ...next]);
        if (j.audio) {
          const audio = new Audio('data:audio/wav;base64,' + j.audio);
          audio.play().catch(() => {});
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setBusy(false);
      }
    } else {
      try {
        recRef.current = await startRecorder();
        setRecording(true);
      } catch {
        setError('Microphone access denied');
      }
    }
  }

  return (
    <div>
      <div className="min-h-[280px] space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        {msgs.length === 0 && (
          <p className="py-16 text-center text-sm text-slate-500">
            Tap the mic and talk to ARIA. Her reply plays back and shows here.
          </p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'you' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                m.role === 'you'
                  ? 'rounded-br-sm bg-white/10 text-slate-100'
                  : 'rounded-bl-sm border border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-50'
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
        {busy && <p className="text-center text-xs text-slate-500">ARIA is thinking…</p>}
      </div>

      {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}

      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={toggle}
          disabled={busy}
          className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl transition disabled:opacity-40 ${
            recording
              ? 'animate-pulse bg-red-500 text-white shadow-[0_0_30px] shadow-red-500/50'
              : 'bg-emerald-400 text-black hover:bg-emerald-300'
          }`}
        >
          {recording ? '■' : '🎤'}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          {recording ? 'Tap to stop & send' : busy ? 'Sending…' : 'Tap to talk'}
        </p>
      </div>
    </div>
  );
}
