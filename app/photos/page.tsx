import { Nav } from '@/components/Nav';
import { listDir } from '@/lib/github';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Photos · ARIA' };

const DIR = process.env.GITHUB_PHOTO_DIR || 'photos';

function meta(name: string): { kind: string; when: string } {
  const kind = name.startsWith('vision') ? 'saw' : 'photo';
  const m = name.match(/(\d{13}|\d{10})/);
  const when = m
    ? new Date(m[1].length > 12 ? Number(m[1]) : Number(m[1]) * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : name;
  return { kind, when };
}

export default async function Photos() {
  const entries = await listDir(DIR);
  const photos = entries
    .filter((e) => e.type === 'file' && /\.(jpg|jpeg|png)$/i.test(e.name))
    .sort((a, b) => b.name.localeCompare(a.name));

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-200">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Nav active="photos" />
        <h2 className="mb-4 mt-8 text-xs uppercase tracking-[0.3em] text-slate-500">
          Photos · {photos.length}
        </h2>

        {photos.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
            No photos yet. Hit &ldquo;Take photo&rdquo; on Control, say &ldquo;take a photo&rdquo; to ARIA, or ask &ldquo;what can you see?&rdquo;
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => {
            const { kind, when } = meta(p.name);
            const src = `/api/photo?path=${encodeURIComponent(p.path)}`;
            return (
              <a key={p.path} href={src} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={p.name} className="aspect-square w-full object-cover transition group-hover:opacity-80" />
                <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] text-slate-500">
                  <span className="uppercase tracking-wider">{kind}</span>
                  <span>{when}</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
