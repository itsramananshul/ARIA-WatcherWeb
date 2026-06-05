import Link from 'next/link';

const ITEMS = [
  { key: 'dashboard', href: '/', label: 'Dashboard' },
  { key: 'talk', href: '/talk', label: 'Talk' },
  { key: 'recordings', href: '/recordings', label: 'Recordings' },
  { key: 'control', href: '/control', label: 'Control' },
] as const;

export function Nav({ active }: { active: 'dashboard' | 'talk' | 'recordings' | 'control' }) {
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
