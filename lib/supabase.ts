import { createClient } from '@supabase/supabase-js';

// Server-side admin client (service role). NEVER import this into a client
// component — the service key must stay on the server.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_KEY not set');
  return createClient(url, key, { auth: { persistSession: false } });
}

export type ChatTurn = {
  id: number;
  ts: string;
  eui: string | null;
  user_text: string | null;
  aria_text: string | null;
};
