import React from 'react';
import { BusinessListing } from '@/types/business';
import PublicBusinessCard from './PublicBusinessCard';
import { EmptyState } from '../ui/EmptyState';
import { LucideSearchX } from 'lucide-react';

interface PublicBusinessListProps {
  businesses: BusinessListing[];
  loading?: boolean;
}

export default function PublicBusinessList({ businesses, loading }: PublicBusinessListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm h-96 animate-pulse p-6">
            <div className="h-32 bg-slate-100 rounded-lg mb-6"></div>
            <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2 mb-6"></div>
            <div className="h-20 bg-slate-100 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <EmptyState 
        icon={LucideSearchX}
        title="No businesses found"
        description="Try adjusting your search query or filters to find what you're looking for."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <PublicBusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}

