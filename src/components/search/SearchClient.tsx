'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchFilters from '@/components/search/SearchFilters';
import PublicBusinessList from '@/components/search/PublicBusinessList';
import Pagination from '@/components/search/Pagination';
import { searchApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import { BusinessListing } from '@/types/business';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { trackPage, trackEvent } from '@/lib/analytics';

function SearchClientContent() {
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const filters = {
          q: searchParams.get('q') || undefined,
          categoryId: searchParams.get('category') || undefined,
          regionId: searchParams.get('region') || undefined,
          provinceId: searchParams.get('province') || undefined,
          cityId: searchParams.get('city') || undefined,
          verifiedOnly: searchParams.get('verifiedOnly') === 'true',
          featuredOnly: searchParams.get('featuredOnly') === 'true',
          sort: searchParams.get('sort') || 'newest',
        };
        
        const page = parseInt(searchParams.get('page') || '1', 10);
        
        const result = await searchApprovedBusinesses(filters, { page, limit: itemsPerPage });
        setBusinesses(result.businesses);
        setTotal(result.total);

        // Map filters to a formatted string for tracking dimensions
        const activeFilters = Object.entries(filters)
          .filter(([, val]) => val !== undefined && val !== false)
          .map(([key, val]) => `${key}:${val}`)
          .join(',');

        // 1. Track standard Search Page view
        trackPage({
          page_type: 'Search',
          search_term: filters.q || '',
          results_count: result.total,
          filters: activeFilters || 'none',
        });

        // 2. Track search filter action if filters are applied
        if (activeFilters) {
          trackEvent('filter_search', {
            search_term: filters.q || '',
            results_count: result.total,
            filters: activeFilters,
          });
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [searchParams, itemsPerPage]);

  return (
    <>
      {/* Mini Search Hero */}
      <div className="bg-[#0C0C1C] px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white whitespace-nowrap">Directory Search</h1>
        </div>
      </div>

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Search Directory' }]} />
        </div>
        
        <div className="mb-6">
          <SearchFilters isLoading={loading} />
        </div>

        <PublicBusinessList businesses={businesses} loading={loading} total={total} />
        
        {!loading && total > 0 && (
            <Pagination totalItems={total} itemsPerPage={itemsPerPage} isLoading={loading} />
        )}
      </div>
    </>
  );
}

export default function SearchClient() {
  const searchParams = useSearchParams();

  return <SearchClientContent key={searchParams.toString()} />;
}
