'use client';

import { useTransition } from 'react';
import { deleteConversation, deleteMessage } from '@/lib/actions';

export function DeleteConvo({ rowIds, firstTs }: { rowIds: number[]; firstTs: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm('Delete this entire conversation? It will also be removed from GitHub.'))
          start(() => deleteConversation(rowIds, firstTs));
      }}
      className="text-[11px] text-slate-600 transition hover:text-red-400 disabled:opacity-40"
    >
      {pending ? 'deleting…' : 'delete'}
    </button>
  );
}

export function DeleteMsg({ rowId, firstTs, convoRowIds }: { rowId: number; firstTs: string; convoRowIds: number[] }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      title="Delete this message"
      onClick={() => {
        if (confirm('Delete this message?')) start(() => deleteMessage(rowId, firstTs, convoRowIds));
      }}
      className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-[10px] text-slate-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40"
    >
      ✕
    </button>
  );
}
