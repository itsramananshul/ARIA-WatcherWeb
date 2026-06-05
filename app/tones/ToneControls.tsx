'use client';

import { useTransition } from 'react';
import { setActiveTone, deleteTone } from '@/lib/actions';
import type { Tone } from '@/lib/tones';

export function ToneRow({ tone, active }: { tone: Tone; active: boolean }) {
  const [pending, start] = useTransition();
  const src = `/api/tone?path=${encodeURIComponent(tone.path)}`;
  return (
    <li className={`rounded-2xl border p-4 transition ${active ? 'border-emerald-400/40 bg-emerald-400/[0.04]' : 'border-white/10 bg-white/[0.02]'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">{tone.label}</span>
          {active && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">Active</span>}
        </div>
        <span className="font-mono text-[11px] text-slate-600">{tone.name}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio controls preload="none" src={src} className="h-9 w-full max-w-[260px]" />
        <div className="ml-auto flex gap-2">
          <button
            disabled={pending || active}
            onClick={() => start(() => setActiveTone(tone.name))}
            className="rounded-lg bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-40"
          >
            {active ? 'Active' : pending ? '…' : 'Set active'}
          </button>
          <button
            disabled={pending}
            onClick={() => { if (confirm(`Remove "${tone.label}" from the tone library? It goes to the Recycle Bin (restorable for 10 days).`)) start(() => deleteTone(tone.path)); }}
            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
          >
            ✕
          </button>
        </div>
      </div>
    </li>
  );
}
