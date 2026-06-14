import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Authoritative session check (the Data Access Layer gate). ARIA identity lives
// in ATLAS; sessions live in master-brain's aria_sessions table. We validate
// the shared .anshullabs.tech token (set by the central ATLAS login on www)
// against master-brain's /api/auth/check. Call this at the top of every
// protected server page / route handler BEFORE touching data.

const SELF_ORIGIN = 'https://watcher.anshullabs.tech';
const LOGIN_URL = 'https://www.anshullabs.tech/api/auth/atlas';
const CHECK_URL = 'https://www.anshullabs.tech/api/auth/check';

export const LOGOUT_URL =
  'https://www.anshullabs.tech/api/auth/atlas/logout?returnTo=' +
  encodeURIComponent(SELF_ORIGIN + '/');

async function sessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get('mb_token')?.value || store.get('aria_token')?.value || null;
}

/** For route handlers: validate the request's session cookie. true = allowed. */
export async function isRequestAuthed(req: Request): Promise<boolean> {
  const raw = req.headers.get('cookie') || '';
  const m = raw.match(/(?:^|;\s*)(?:mb_token|aria_token)=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : null;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return false;
  try {
    const r = await fetch(CHECK_URL, { headers: { 'x-auth-token': token }, cache: 'no-store' });
    return r.ok;
  } catch {
    return false;
  }
}

/** Returns the valid token, or redirects to the ATLAS login (never returns). */
export async function requireSession(returnPath = '/'): Promise<string> {
  const token = await sessionToken();
  const toLogin = () =>
    redirect(`${LOGIN_URL}?returnTo=${encodeURIComponent(SELF_ORIGIN + returnPath)}`);

  if (!token || !/^[0-9a-f]{64}$/.test(token)) return toLogin();
  try {
    const r = await fetch(CHECK_URL, { headers: { 'x-auth-token': token }, cache: 'no-store' });
    if (!r.ok) return toLogin();
  } catch {
    return toLogin();
  }
  return token;
}
