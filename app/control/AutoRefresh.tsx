'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Re-fetch the (server-rendered) Control page on an interval so the device's
// online status + reported state stay live without a manual reload.
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
