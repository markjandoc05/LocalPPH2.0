'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchFilters from '@/components/search/SearchFilters';
import PublicBusinessList from '@/components/search/PublicBusinessList';
import Pagination from '@/components/search/Pagination';
import { searchApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import { BusinessListing } from '@/types/business';
import { LucideSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { trackPage, trackEvent } from '@/lib/analytics';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const currentQ = searchParams.get('q') || '';
  const [prevQ, setPrevQ] = useState(currentQ);
  const [heroQuery, setHeroQuery] = useState(currentQ);

  if (currentQ !== prevQ) {
    setPrevQ(currentQ);
    setHeroQuery(currentQ);
  }

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const filters = {
          q: searchParams.get('q') || undefined,
          category: searchParams.get('category') || undefined,
          city: searchParams.get('city') || undefined,
          verifiedOnly: searchParams.get('verifiedOnly') === 'true',
          featuredOnly: searchParams.get('featuredOnly') === 'true',
        };
        
        const page = parseInt(searchParams.get('page') || '1', 10);
        
        const result = await searchApprovedBusinesses(filters, { page, limit: itemsPerPage });
        setBusinesses(result.businesses);
        setTotal(result.total);

        // Map filters to a formatted string for tracking dimensions
        const activeFilters = Object.entries(filters)
          .filter(([_, val]) => val !== undefined && val !== false)
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

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (heroQuery.trim()) {
        params.set('q', heroQuery.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      router.push(`/search?${params.toString()}`);
    }, 500);

    return () => clearTimeout(handler);
  }, [heroQuery, searchParams, router]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handled by useEffect
  };

  return (
    <>
      {/* Mini Search Hero */}
      <div className="bg-[#0C0C1C] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white whitespace-nowrap">Directory Search</h1>
          <form onSubmit={handleHeroSearch} className="w-full md:max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={heroQuery}
              disabled={loading}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Search by name, category, or location"
              className="block w-full pl-10 pr-4 py-2.5 border-0 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-[#2563EB] sm:text-sm outline-none shadow-sm disabled:opacity-50"
            />
          </form>
        </div>
      </div>

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Search Directory' }]} />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <SearchFilters isLoading={loading} />
          </div>
          
          {/* Main Results */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-end">
              <h2 className="text-xl font-bold text-[#0C0C1C]">
                {loading ? 'Searching...' : `${total} ${total === 1 ? 'Business' : 'Businesses'} Found`}
              </h2>
            </div>
            
            <PublicBusinessList businesses={businesses} loading={loading} />
            
            {!loading && total > 0 && (
              <Pagination totalItems={total} itemsPerPage={itemsPerPage} isLoading={loading} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
