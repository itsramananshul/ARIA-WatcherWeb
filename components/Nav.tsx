import Link from 'next/link';

export function Nav({ active }: { active: 'dashboard' | 'control' }) {
  const cls = (key: string) =>
    `text-xs uppercase tracking-[0.2em] transition ${active === key ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`;
  return (
    <header className="flex items-end justify-between border-b border-white/10 pb-6">
      <div>
        <h1 className="text-3xl font-light tracking-[0.5em] text-white">ARIA</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">Watcher Console</p>
      </div>
      <nav className="flex gap-6 pb-1">
        <Link href="/" className={cls('dashboard')}>Dashboard</Link>
        <Link href="/control" className={cls('control')}>Control</Link>
      </nav>
    </header>
  );
}
