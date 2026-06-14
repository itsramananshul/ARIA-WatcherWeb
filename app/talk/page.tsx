import { Nav } from '@/components/Nav';
import TalkClient from './TalkClient';
import { requireSession } from '@/lib/auth';

export const metadata = { title: 'Talk · ARIA' };

export default async function TalkPage() {
  await requireSession('/talk');
  return (
    <main className="min-h-screen bg-[#05070a] text-slate-200">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Nav active="talk" />
        <h2 className="mb-4 mt-8 text-xs uppercase tracking-[0.3em] text-slate-500">Talk to ARIA</h2>
        <TalkClient />
      </div>
    </main>
  );
}
