'use client';

import { useEffect } from 'react';
import { trackPage } from '@/lib/analytics';
import { PageParams } from '@/lib/analytics/types';

interface PageTrackerProps {
  params: PageParams;
}

export default function PageTracker({ params }: PageTrackerProps) {
  useEffect(() => {
    trackPage(params);
  }, [params]);

  return null;
}
