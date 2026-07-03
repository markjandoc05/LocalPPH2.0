'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
      <p className="text-lg text-slate-600 mb-8">Oops! The page you're looking for doesn't exist.</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
