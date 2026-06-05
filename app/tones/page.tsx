import { Nav } from '@/components/Nav';
import { listTones } from '@/lib/tones';
import { getDevices } from '@/lib/devices';
import { ToneRow } from './ToneControls';
import { UploadTone } from './UploadTone';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tones · ARIA' };

export default async function TonesPage() {
  const [tones, devices] = await Promise.all([listTones(), getDevices()]);
  // Active tone = what the device(s) are set to (they share one selection here).
  const active = devices.find((d) => d.tone)?.tone || 'water_drops.wav';

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-200">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Nav active="tones" />
        <h2 className="mb-1 mt-8 text-xs uppercase tracking-[0.3em] text-slate-500">
          Thinking Tones · {tones.length}
        </h2>
        <p className="mb-5 text-[11px] text-slate-600">
          ARIA plays the active tone while she&apos;s thinking. The library is the <span className="font-mono">tones/</span> folder
          in your repo — upload here, or add/remove WAVs in the repo and it updates everywhere (web + watch).
        </p>

        <UploadTone />

        {tones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
            No tones yet. Upload a WAV (mono, ideally 24&nbsp;kHz) to start the library.
          </div>
        ) : (
          <ul className="space-y-3">
            {tones.map((t) => (
              <ToneRow key={t.path} tone={t} active={t.name === active} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
