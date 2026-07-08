import React, { useState } from 'react';
import { BusinessListing } from '@/types/business';
import { EmptyState } from '../ui/EmptyState';
import { 
  LucideSearchX, 
  MapPin, 
  CheckCircle2, 
  Star, 
  LayoutGrid, 
  List, 
  LucideGlobe, 
  LucideExternalLink 
} from 'lucide-react';
import Link from 'next/link';
import PublicBusinessCard from '@/components/search/PublicBusinessCard';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';

interface PublicBusinessListProps {
  businesses: BusinessListing[];
  loading?: boolean;
}

export default function PublicBusinessList({ businesses, loading }: PublicBusinessListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const showSkeleton = loading;
  const showEmpty = !loading && (!businesses || businesses.length === 0);

  return (
    <div className="space-y-6">
      {/* View Switcher Controls */}
      <div className="flex justify-end items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">View style:</span>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List View"
            aria-label="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSkeleton ? (
        viewMode === 'grid' ? (
          /* Grid Loading Skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-slate-200 rounded-xl bg-white overflow-hidden h-[380px] animate-pulse">
                <div className="h-32 bg-slate-100" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List Loading Skeleton */
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-slate-200 rounded-xl bg-white p-5 h-[150px] animate-pulse flex gap-5 items-center">
                <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0" />
                <div className="flex-grow space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : showEmpty ? (
        <EmptyState 
          icon={LucideSearchX}
          title="No businesses found"
          description="Try adjusting your search or filters."
        />
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <PublicBusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="space-y-4">
          {businesses.map((business) => (
            <div 
              key={business.id} 
              className="relative group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col md:flex-row gap-5 items-start md:items-center"
            >
              {/* Invisible full-card clickable link overlay */}
              <Link 
                href={`/business/${business.slug}`} 
                className="absolute inset-0 z-10 rounded-xl" 
                aria-label={`View profile for ${business.name}`}
              />

              {/* Business Logo / Initials */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden relative z-20 shadow-sm group-hover:scale-102 transition-transform duration-300">
                {business.logoUrl ? (
                  <img 
                    src={business.logoUrl} 
                    alt={`${business.name} Logo`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 text-xl font-bold uppercase">
                    {business.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Details & Info */}
              <div className="flex-grow space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    {business.name}
                  </h3>
                  <div className="flex gap-1 relative z-20">
                    {business.isVerified && (
                      <div className="text-blue-600" title="Verified Business">
                        <CheckCircle2 className="w-5 h-5 fill-blue-50 text-blue-600" />
                      </div>
                    )}
                    {business.isFeatured && (
                      <div className="text-amber-500" title="Featured Business">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <Badge variant="info" className="font-semibold text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-100">
                    {business.subcategoryName !== "Not assigned" 
                      ? `${business.categoryName} - ${business.subcategoryName}`
                      : business.categoryName}
                  </Badge>
                  <div className="text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    {business.cityName}, {business.provinceName}
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 md:max-w-2xl leading-relaxed">
                  {business.description || "No description provided."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full md:w-auto flex flex-row md:flex-col gap-2.5 relative z-20 md:self-stretch justify-end min-w-[140px]">
                <div className="flex gap-2 w-full md:w-auto">
                  {business.websiteUrl && (
                    <a 
                      href={business.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: "flex-grow md:flex-grow-0 text-xs hover:bg-slate-50 font-medium h-9" })}
                    >
                      <LucideGlobe className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Web
                    </a>
                  )}
                  {business.facebookUrl && (
                    <a 
                      href={business.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: "flex-grow md:flex-grow-0 text-xs text-blue-700 hover:bg-blue-50/50 font-medium h-9" })}
                    >
                      <LucideExternalLink className="w-3.5 h-3.5 mr-1" />
                      FB
                    </a>
                  )}
                </div>
                <Link 
                  href={`/business/${business.slug}`} 
                  className={buttonVariants({ variant: 'default', size: 'sm', className: "w-full md:w-auto text-xs font-semibold h-9 shadow-sm" })}
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

