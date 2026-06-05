import { supabaseAdmin } from '@/lib/supabase';

export type DeviceConfig = {
  eui: string;
  tts_engine: string;
  voice: string;
  volume: number;
  brightness: number;
  camera_vision: boolean;
  recording: boolean;
  chat_logging: boolean;
  wake_word: boolean;
  tone: string;
  config_rev: number;
  reported: { fw?: string; free_heap?: number; battery?: number; applied_rev?: number } | null;
  last_seen: string | null;
};

export async function getDevices(): Promise<DeviceConfig[]> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('device_config')
    .select('eui, tts_engine, voice, volume, brightness, camera_vision, recording, chat_logging, wake_word, tone, config_rev, reported, last_seen')
    .order('last_seen', { ascending: false, nullsFirst: false });
  return (data ?? []) as DeviceConfig[];
}

export function isOnline(lastSeen: string | null): boolean {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 45 * 1000; // syncs every ~15s
}
