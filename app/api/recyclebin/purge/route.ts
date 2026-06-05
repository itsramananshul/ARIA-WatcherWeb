import { NextRequest } from 'next/server';
import { purgeExpired } from '@/lib/recyclebin';

// Daily Vercel Cron (see vercel.json) hits this to permanently delete anything
// in the Recycle Bin past its 10-day window. Protected by CRON_SECRET: Vercel
// sends `Authorization: Bearer <CRON_SECRET>` automatically when that env is set.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (req.headers.get('authorization') !== `Bearer ${secret}`) {
      return new Response('unauthorized', { status: 401 });
    }
  }
  const purged = await purgeExpired(Date.now());
  return Response.json({ ok: true, purged: purged.length, paths: purged });
}
