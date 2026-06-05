import Link from 'next/link';

const ITEMS = [
  { key: 'dashboard', href: '/', label: 'Dashboard' },
  { key: 'talk', href: '/talk', label: 'Talk' },
  { key: 'photos', href: '/photos', label: 'Photos' },
  { key: 'recordings', href: '/recordings', label: 'Recordings' },
  { key: 'tones', href: '/tones', label: 'Tones' },
  { key: 'control', href: '/control', label: 'Control' },
  { key: 'recyclebin', href: '/recyclebin', label: 'Recycle Bin' },
] as const;

export function Nav({ active }: { active: 'dashboard' | 'talk' | 'photos' | 'recordings' | 'tones' | 'control' | 'recyclebin' }) {
  return (
    <header className="flex items-end justify-between border-b border-white/10 pb-6">
      <div>
        <h1 className="text-3xl font-light tracking-[0.5em] text-white">ARIA</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">Watcher Console</p>
      </div>
      <nav className="flex flex-wrap justify-end gap-x-5 gap-y-2 pb-1">
        {ITEMS.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className={`text-xs uppercase tracking-[0.2em] transition ${active === it.key ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
