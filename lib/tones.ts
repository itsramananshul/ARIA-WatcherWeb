import { listDir } from '@/lib/github';

export type Tone = { name: string; label: string; path: string };

// "warm_marimba.wav" -> "Warm Marimba"
export function prettyTone(filename: string): string {
  return filename.replace(/\.wav$/i, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// The tones/ folder in the repo is the single source of truth — add/remove a
// WAV there and it shows up (or disappears) here and on the device automatically.
export async function listTones(): Promise<Tone[]> {
  const entries = await listDir('tones');
  return entries
    .filter((e) => e.type === 'file' && /\.wav$/i.test(e.name))
    .map((e) => ({ name: e.name, label: prettyTone(e.name), path: e.path }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
