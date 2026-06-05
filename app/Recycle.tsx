'use client';

import { useTransition } from 'react';
import { recycleItem } from '@/lib/actions';

const CONFIRM = (label: string) =>
  `Move this ${label} to the Recycle Bin?\n\nIt's kept for 10 days and you can restore it from the Recycle Bin tab. After 10 days it's deleted automatically.`;

// Corner ✕ for the photo grid.
export function RecycleX({ path, label = 'photo' }: { path: string; label?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      title={`Move ${label} to Recycle Bin`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(CONFIRM(label))) start(() => recycleItem(path));
      }}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] text-slate-200 backdrop-blur transition hover:bg-red-500/40 hover:text-white disabled:opacity-40"
    >
      {pending ? '·' : '✕'}
    </button>
  );
}

// Text link for list rows (recordings).
export function RecycleLink({ path, label = 'recording' }: { path: string; label?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(CONFIRM(label))) start(() => recycleItem(path));
      }}
      className="text-[11px] text-slate-600 transition hover:text-red-400 disabled:opacity-40"
    >
      {pending ? 'removing…' : 'remove'}
    </button>
  );
}
