'use client';

import { useState, useTransition } from 'react';
import type { DeviceConfig } from '@/lib/devices';
import { updateDeviceConfig, sendCommand } from '@/lib/actions';

const VOICES = ['Kore', 'Sulafat', 'Despina', 'Leda'];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export default function DeviceControls({ device }: { device: DeviceConfig }) {
  const eui = device.eui;
  const [pending, start] = useTransition();
  const [vol, setVol] = useState(device.volume);
  const [bri, setBri] = useState(device.brightness);
  const [say, setSay] = useState('');

  const set = (patch: Parameters<typeof updateDeviceConfig>[1]) => start(() => updateDeviceConfig(eui, patch));
  const cmd = (c: string) => start(() => sendCommand(eui, c));

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs transition ${active ? 'bg-emerald-400 text-black font-medium' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`;

  return (
    <div className={`relative ${pending ? 'opacity-60' : ''}`}>
      {/* Voice */}
      <Row label="Voice">
        <div className="flex flex-wrap gap-1.5">
          {VOICES.map((v) => (
            <button key={v} className={pill(device.voice === v)} onClick={() => set({ voice: v })}>{v}</button>
          ))}
        </div>
      </Row>
      <div className="border-t border-white/5" />

      {/* Engine */}
      <Row label="TTS engine">
        <button className={pill(device.tts_engine === 'current')} onClick={() => set({ tts_engine: 'current' })}>Current</button>
        <button className={pill(device.tts_engine === 'live')} onClick={() => set({ tts_engine: 'live' })}>Fast (Live)</button>
      </Row>
      <div className="border-t border-white/5" />

      {/* Volume */}
      <Row label={`Volume · ${vol}`}>
        <input type="range" min={0} max={100} value={vol}
          onChange={(e) => setVol(+e.target.value)}
          onPointerUp={() => set({ volume: vol })}
          className="w-40 accent-emerald-400" />
      </Row>
      <div className="border-t border-white/5" />

      {/* Brightness */}
      <Row label={`Brightness · ${bri}`}>
        <input type="range" min={5} max={100} value={bri}
          onChange={(e) => setBri(+e.target.value)}
          onPointerUp={() => set({ brightness: bri })}
          className="w-40 accent-emerald-400" />
      </Row>
      <div className="border-t border-white/5" />

      {/* Feature toggles */}
      {([
        ['camera_vision', 'Camera vision', device.camera_vision],
        ['recording', 'Recording', device.recording],
        ['chat_logging', 'Chat logging', device.chat_logging],
      ] as const).map(([key, label, val]) => (
        <div key={key}>
          <Row label={label}>
            <button
              onClick={() => set({ [key]: !val } as Parameters<typeof updateDeviceConfig>[1])}
              className={`relative h-6 w-11 rounded-full transition ${val ? 'bg-emerald-400' : 'bg-white/15'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${val ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </Row>
          <div className="border-t border-white/5" />
        </div>
      ))}

      {/* Commands */}
      <div className="mt-5">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Commands</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => cmd('take_photo')} className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">📷 Take photo</button>
          <button onClick={() => cmd('record_start')} className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">● Start recording</button>
          <button onClick={() => cmd('record_stop')} className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">■ Stop recording</button>
          <button onClick={() => { if (confirm('Reboot the watch?')) cmd('reboot'); }} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20">⟲ Reboot</button>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={say}
            onChange={(e) => setSay(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && say.trim()) { start(() => sendCommand(eui, 'speak', { text: say })); setSay(''); } }}
            placeholder="Type something for ARIA to say out loud…"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-emerald-400/40 focus:outline-none"
          />
          <button
            disabled={!say.trim()}
            onClick={() => { start(() => sendCommand(eui, 'speak', { text: say })); setSay(''); }}
            className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-medium text-black hover:bg-emerald-300 disabled:opacity-40"
          >
            Say it
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-600">Commands run on the device&apos;s next check-in (~15s).</p>
      </div>
    </div>
  );
}
