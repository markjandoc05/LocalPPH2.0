'use client';

import { useEffect } from 'react';

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('Route render failed:', error);
  }, [error]);

  return (
    <div className="flex-1 bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">This page could not load</h1>
        <p className="mt-3 text-sm text-slate-600">
          The route changed, but part of the page failed while loading. Please try again.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
