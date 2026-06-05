'use client';

import { useTransition } from 'react';
import { restoreItem, deleteItemForever } from '@/lib/actions';

export function RestoreBtn({ recyclePath }: { recyclePath: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => restoreItem(recyclePath))}
      className="rounded-lg bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-40"
    >
      {pending ? 'restoring…' : '↩ Restore'}
    </button>
  );
}

export function DeleteForeverBtn({ recyclePath }: { recyclePath: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm('Permanently delete this item?\n\nThis cannot be undone.'))
          start(() => deleteItemForever(recyclePath));
      }}
      className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
    >
      {pending ? 'deleting…' : '✕ Delete now'}
    </button>
  );
}
