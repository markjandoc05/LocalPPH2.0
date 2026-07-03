import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClient from '@/components/search/SearchClient';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata(
  'Search Directory',
  'Search for trusted local businesses by name, category, and location in the Philippines.',
  '/search'
);

export default function SearchPage() {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col min-h-screen">
      <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading search...</div>}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
