import { getDevices, isOnline } from '@/lib/devices';
import DeviceControls from './controls';
import { Nav } from '@/components/Nav';

export const dynamic = 'force-dynamic';

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function Control() {
  const devices = await getDevices();

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-200">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Nav active="control" />

        <h2 className="mb-4 mt-8 text-xs uppercase tracking-[0.3em] text-slate-500">Devices</h2>

        {devices.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
            No devices have checked in yet.
          </div>
        )}

        <div className="space-y-6">
          {devices.map((d) => {
            const online = isOnline(d.last_seen);
            return (
              <div key={d.eui} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400' : 'bg-slate-600'}`} />
                      <span className="font-mono text-sm text-white">{d.eui}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {online ? 'Online' : 'Offline'} · seen {timeAgo(d.last_seen)}
                      {d.reported?.fw ? ` · fw ${d.reported.fw}` : ''}
                      {d.reported?.applied_rev != null ? ` · rev ${d.reported.applied_rev}/${d.config_rev}` : ''}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <DeviceControls device={d} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
