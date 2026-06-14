import { supabaseAdmin, type ChatTurn } from '@/lib/supabase';
import { Nav } from '@/components/Nav';
import { DeleteConvo, DeleteMsg } from '@/app/ChatDelete';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const GAP_MS = 4 * 60 * 1000;

type Conversation = { id: string; start: string; turns: ChatTurn[] };

function groupConversations(turnsAsc: ChatTurn[]): Conversation[] {
  const convos: Conversation[] = [];
  let cur: ChatTurn[] = [];
  let prev = 0;
  for (const t of turnsAsc) {
    const ms = new Date(t.ts).getTime();
    if (cur.length && ms - prev > GAP_MS) {
      convos.push({ id: cur[0].ts, start: cur[0].ts, turns: cur });
      cur = [];
    }
    cur.push(t);
    prev = ms;
  }
  if (cur.length) convos.push({ id: cur[0].ts, start: cur[0].ts, turns: cur });
  return convos;
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default async function Home() {
  await requireSession('/');
  const sb = supabaseAdmin();

  const [{ data: recent }, { count: totalMsgs }] = await Promise.all([
    sb.from('aria_chat_log').select('id, ts, eui, user_text, aria_text').order('ts', { ascending: false }).limit(120),
    sb.from('aria_chat_log').select('*', { count: 'exact', head: true }),
  ]);

  const turns = (recent ?? []) as ChatTurn[];
  const asc = [...turns].reverse();
  const convos = groupConversations(asc).reverse(); // newest conversation first
  const lastActive = turns[0]?.ts ?? null;
  const devices = new Set(turns.map((t) => t.eui ?? 'unknown')).size;

  const stats = [
    { label: 'Messages', value: totalMsgs ?? turns.length },
    { label: 'Conversations', value: convos.length },
    { label: 'Devices', value: devices },
    { label: 'Last active', value: lastActive ? timeAgo(lastActive) : '—' },
  ];

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-200">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Nav active="dashboard" />

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-2xl font-semibold text-white">{s.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Conversations */}
        <section className="mt-10">
          <h2 className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-500">Recent conversations</h2>

          {convos.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
              No conversations yet. Talk to ARIA on the Watcher and they&apos;ll show up here.
            </div>
          )}

          <div className="space-y-6">
            {convos.map((c) => {
              const ids = c.turns.map((t) => t.id);
              return (
              <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">{fmtTime(c.start)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-600">{c.turns.length} {c.turns.length === 1 ? 'turn' : 'turns'}</span>
                    <DeleteConvo rowIds={ids} firstTs={c.start} />
                  </div>
                </div>
                <div className="space-y-3">
                  {c.turns.map((t) => (
                    <div key={t.id} className="group/msg relative space-y-1.5">
                      <div className="absolute -right-1 -top-1 z-10 opacity-0 transition group-hover/msg:opacity-100">
                        <DeleteMsg rowId={t.id} firstTs={c.start} convoRowIds={ids} />
                      </div>
                      {t.user_text && (
                        <div className="flex justify-end">
                          <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-white/10 px-3.5 py-2 text-sm text-slate-100">
                            {t.user_text}
                          </p>
                        </div>
                      )}
                      {t.aria_text && (
                        <div className="flex justify-start">
                          <p className="max-w-[85%] rounded-2xl rounded-bl-sm border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2 text-sm text-emerald-50">
                            {t.aria_text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-[11px] text-slate-600">
          ARIA · Watcher Console — live from your device
        </footer>
      </div>
    </main>
  );
}
