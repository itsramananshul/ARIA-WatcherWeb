'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { getSha, putText, deleteFile } from '@/lib/github';
import { chatFilePath, buildChatMd, type Turn } from '@/lib/chatmd';

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

// ── Deletions (propagate to the GitHub mirror) ────────────────────────────

// Delete a whole conversation: its rows + its WatcherChat file on GitHub.
export async function deleteConversation(rowIds: number[], firstTs: string): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from('aria_chat_log').delete().in('id', rowIds);
  const path = chatFilePath(firstTs);
  await deleteFile(path, `delete ${path} (from console)`);
  revalidatePath('/');
}

// Delete one message (turn). Regenerate the conversation's GitHub file from
// what's left (or delete it if that was the last message). Only touches GitHub
// if the file actually exists (i.e. the conversation was already flushed).
export async function deleteMessage(rowId: number, firstTs: string, convoRowIds: number[]): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from('aria_chat_log').delete().eq('id', rowId);

  const path = chatFilePath(firstTs);
  const exists = await getSha(path);
  if (exists) {
    const remaining = convoRowIds.filter((id) => id !== rowId);
    if (remaining.length === 0) {
      await deleteFile(path, `delete ${path} (last message removed)`);
    } else {
      const { data } = await sb.from('aria_chat_log')
        .select('ts, user_text, aria_text').in('id', remaining).order('ts', { ascending: true });
      if (data && data.length) {
        await putText(path, buildChatMd(data[0].ts as string, data as Turn[]), `update ${path} (deleted a message)`);
      }
    }
  }
  revalidatePath('/');
}

// Remove a device from the console (config + its command history). A device
// that's still powered on + online will re-register on its next check-in.
export async function deleteDevice(eui: string): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from('device_commands').delete().eq('eui', eui);
  await sb.from('device_config').delete().eq('eui', eui);
  revalidatePath('/control');
}
