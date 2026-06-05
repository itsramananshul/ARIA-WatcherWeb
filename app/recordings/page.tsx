import { Nav } from '@/components/Nav';
import { listDir, getText } from '@/lib/github';
import { RecycleLink } from '@/app/Recycle';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recordings · ARIA' };

const DIR = process.env.GITHUB_REC_DIR || 'recordings';

function prettyDate(name: string): string {
  // rec_<epoch>.md  ->  readable date
  const m = name.match(/(\d{10,13})/);
  if (m) {
    const n = Number(m[1]);
    const ms = m[1].length > 12 ? n : n * 1000;
    return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return name;
}

export default async function Recordings() {
  const entries = await listDir(DIR);
  const md = entries.filter((e) => e.type === 'file' && e.name.endsWith('.md'))
    .sort((a, b) => b.name.localeCompare(a.name));
  const wav = entries.filter((e) => e.type === 'file' && /\.(wav|wav\.done)$/.test(e.name));

  // pull transcript text for each .md (strip the "# Recording" header)
  const items = await Promise.all(md.map(async (e) => {
    const raw = await getText(e.path);
    const body = raw.replace(/^#.*\n+/, '').trim();
    return { name: e.name, path: e.path, body };
  }));

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-200">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Nav active="recordings" />
        <h2 className="mb-4 mt-8 text-xs uppercase tracking-[0.3em] text-slate-500">
          Recordings · {items.length} transcript{items.length === 1 ? '' : 's'}
          {wav.length ? ` · ${wav.length} audio` : ''}
        </h2>

        {items.length === 0 && wav.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
            No recordings yet. Use the Recording tile on the Watcher and they&apos;ll appear here.
          </div>
        )}

        <div className="space-y-5">
          {items.map((it) => (
            <div key={it.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm text-white">{prettyDate(it.name)}</span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-600">{it.name}</span>
                  <RecycleLink path={it.path} />
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {it.body || <span className="text-slate-600">(empty)</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
