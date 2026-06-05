'use client';

import { useRef, useTransition } from 'react';
import { uploadTone } from '@/lib/actions';

export function UploadTone() {
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={(fd) => start(async () => { await uploadTone(fd); ref.current?.reset(); })}
      className="mb-6 flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4"
    >
      <input
        type="file"
        name="file"
        accept=".wav,audio/wav,audio/x-wav"
        required
        className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-slate-200 hover:file:bg-white/20"
      />
      <button disabled={pending} className="flex-none rounded-lg bg-emerald-400/15 px-4 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-400/25 disabled:opacity-40">
        {pending ? 'Uploading…' : 'Upload tone'}
      </button>
    </form>
  );
}
