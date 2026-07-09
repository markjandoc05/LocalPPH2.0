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
    // Only track once per mount of this component with these params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
