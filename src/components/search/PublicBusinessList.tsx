import React from 'react';
import { BusinessListing } from '@/types/business';
import { EmptyState } from '../ui/EmptyState';
import { LucideSearchX, MapPin, Tag, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';

interface PublicBusinessListProps {
  businesses: BusinessListing[];
  loading?: boolean;
}

export default function PublicBusinessList({ businesses, loading }: PublicBusinessListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <EmptyState 
        icon={LucideSearchX}
        title="No businesses found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-slate-700">Business</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-700">Category</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-700">Location</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((business) => (
              <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <Link href={`/business/${business.slug}`} className="hover:text-blue-600">{business.name}</Link>
                </td>
                <td className="px-6 py-4 text-slate-600">{business.categoryName || 'N/A'}</td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {business.cityName}, {business.provinceName}
                  </div>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {business.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                  {business.isFeatured && <Star className="w-5 h-5 text-yellow-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {businesses.map((business) => (
          <div key={business.id} className="p-4 space-y-2">
            <Link href={`/business/${business.slug}`} className="font-bold text-lg text-slate-900 block">{business.name}</Link>
            <div className="text-sm text-slate-600">{business.categoryName}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {business.cityName}, {business.provinceName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

