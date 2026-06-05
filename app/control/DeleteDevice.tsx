'use client';

import { useTransition } from 'react';
import { deleteDevice } from '@/lib/actions';

export function DeleteDevice({ eui }: { eui: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`Remove ${eui} from the console?\n\n(If it's powered on and online it will re-appear on its next check-in.)`))
          start(() => deleteDevice(eui));
      }}
      className="rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
    >
      {pending ? '…' : 'Remove'}
    </button>
  );
}
