'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPage } from '@/lib/analytics';

function TrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    // We only track general/static pages automatically to avoid duplicate page views on dynamic pages.
    // Dynamic pages (Search, Category, Location, Business Profile) track themselves explicitly with rich metadata.
    if (pathname === '/') {
      trackPage({ page_type: 'Home' });
    } else if (pathname === '/categories') {
      trackPage({ page_type: 'Categories' });
    } else if (pathname === '/locations') {
      trackPage({ page_type: 'Locations' });
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
