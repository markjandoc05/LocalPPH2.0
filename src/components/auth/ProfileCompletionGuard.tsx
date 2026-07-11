'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

const allowedIncompleteProfilePaths = ['/profile', '/auth', '/privacy', '/terms'];

export default function ProfileCompletionGuard() {
  const { user, loading, profileComplete } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user || profileComplete) return;

    const canStayOnPath = allowedIncompleteProfilePaths.some((path) =>
      pathname === path || pathname.startsWith(`${path}/`)
    );

    if (canStayOnPath) return;

    const params = new URLSearchParams({
      complete: '1',
      next: pathname,
    });

    router.replace(`/profile?${params.toString()}`);
  }, [loading, pathname, profileComplete, router, user]);

  return null;
}
