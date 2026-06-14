import { Nav } from '@/components/Nav';
import { listRecycleBin, RETENTION_DAYS } from '@/lib/recyclebin';
import { RestoreBtn, DeleteForeverBtn } from './RecycleActions';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recycle Bin · ARIA' };

const DAY = 24 * 60 * 60 * 1000;

function when(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default async function RecycleBinPage() {
  await requireSession('/recyclebin');
  const now = Date.now();
  const items = await listRecycleBin(now);

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-200">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Nav active="recyclebin" />
        <h2 className="mb-1 mt-8 text-xs uppercase tracking-[0.3em] text-slate-500">
          Recycle Bin · {items.length}
        </h2>
        <p className="mb-5 text-[11px] text-slate-600">
          Removed photos &amp; recordings stay here for {RETENTION_DAYS} days, then delete automatically. Restore anything before then.
        </p>

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
            The Recycle Bin is empty.
          </div>
        )}

        <ul className="space-y-3">
          {items.map((it) => {
            const daysLeft = Math.max(0, Math.ceil((it.expiresAtMs - now) / DAY));
            const isPhoto = it.kind === 'photo';
            const src = isPhoto ? `/api/photo?path=${encodeURIComponent(it.recyclePath)}` : null;
            return (
              <li
                key={it.recyclePath}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={it.basename} className="h-14 w-14 flex-none rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 flex-none items-center justify-center rounded-lg bg-white/5 text-xl">
                    {it.kind === 'recording' ? '🎙️' : '📄'}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white">{it.basename}</div>
                  <div className="truncate font-mono text-[11px] text-slate-600">{it.origPath}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    removed {when(it.deletedAtMs)} ·{' '}
                    <span className={daysLeft <= 2 ? 'text-amber-400' : 'text-slate-400'}>
                      {daysLeft === 0 ? 'deletes today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-none flex-col gap-2">
                  <RestoreBtn recyclePath={it.recyclePath} />
                  <DeleteForeverBtn recyclePath={it.recyclePath} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
