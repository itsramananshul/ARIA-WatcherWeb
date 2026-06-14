import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// OPTIMISTIC gate only (Next 16 Proxy must not do auth fetching). The
// authoritative session check lives in lib/auth.ts (requireSession), called
// from each protected page/route. This just bounces requests with no
// plausible session cookie straight to the central ATLAS login so unauthed
// users never even render a protected route.

const SELF_ORIGIN = 'https://watcher.anshullabs.tech';
const LOGIN_URL = 'https://www.anshullabs.tech/api/auth/atlas';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token =
    req.cookies.get('mb_token')?.value || req.cookies.get('aria_token')?.value || null;

  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    const returnTo = SELF_ORIGIN + pathname + search;
    return NextResponse.redirect(`${LOGIN_URL}?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, the favicon, static files (any path with
  // a file extension), and the cron purge route (auth'd via CRON_SECRET).
  matcher: ['/((?!_next/|favicon\\.ico|api/recyclebin/purge|.*\\.[\\w]+$).*)'],
};
