// Mirrors the backend's WatcherChat file format + naming so the web app can
// regenerate / target the right file when deleting messages or conversations.

export const CHAT_DIR = process.env.GITHUB_CHAT_DIR || 'WatcherChat';

export function tsName(iso: string): string {
  const d = new Date(iso).toISOString();
  return d.slice(0, 10) + '_' + d.slice(11, 19).replace(/:/g, '');
}

export function chatFilePath(firstTs: string): string {
  return `${CHAT_DIR}/${tsName(firstTs)}.md`;
}

export type Turn = { ts: string; user_text: string | null; aria_text: string | null };

export function buildChatMd(firstIso: string, turns: Turn[]): string {
  let md = `# Chat — ${new Date(firstIso).toISOString()}\n`;
  for (const t of turns) {
    const hm = new Date(t.ts).toISOString().slice(11, 16);
    md += `\n### ${hm}\n**You:** ${(t.user_text || '').trim()}\n\n**ARIA:** ${(t.aria_text || '').trim()}\n`;
  }
  return md;
}
