'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

type ConfigPatch = Partial<{
  tts_engine: string;
  voice: string;
  volume: number;
  brightness: number;
  camera_vision: boolean;
  recording: boolean;
  chat_logging: boolean;
}>;

// Write desired settings. The DB trigger bumps config_rev, and the watch applies
// it on its next ~15s heartbeat.
export async function updateDeviceConfig(eui: string, patch: ConfigPatch): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from('device_config').update(patch).eq('eui', eui);
  revalidatePath('/control');
}

// Queue a command the watch will pick up + run on its next heartbeat.
export async function sendCommand(eui: string, command: string, args: Record<string, unknown> = {}): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from('device_commands').insert({ eui, command, args });
  revalidatePath('/control');
}
