'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicClientProvider } from '@/lib/data-connect/client-provider';

interface SearchFiltersProps {
  isLoading?: boolean;
}

export default function SearchFilters({ isLoading }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [cats, regs] = await Promise.all([
        publicClientProvider.getCategories(),
        publicClientProvider.getRegions()
      ]);
      setCategories(cats.data.categories || []);
      setRegions(regs.data.regions || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const regionId = searchParams.get('region');
    if (regionId) {
      publicClientProvider.getProvinces({ regionId }).then(res => setProvinces(res.data.provinces || []));
    } else {
      Promise.resolve().then(() => {
        setProvinces(prev => prev.length > 0 ? [] : prev);
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const provinceId = searchParams.get('province');
    if (provinceId) {
      publicClientProvider.getCities({ provinceId }).then(res => setCities(res.data.cities || []));
    } else {
      Promise.resolve().then(() => {
        setCities(prev => prev.length > 0 ? [] : prev);
      });
    }
  }, [searchParams]);

  const handleFilterChange = (name: string, value: string) => {
    if (isLoading) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    
    // Clear cascading filters
    if (name === 'region') {
        params.delete('province');
        params.delete('city');
    } else if (name === 'province') {
        params.delete('city');
    }

    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (isLoading) return;
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set(name, 'true');
    } else {
      params.delete(name);
    }
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    if (isLoading) return;
    router.push('/search');
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-[#0C0C1C]">Filters</h3>
        {hasFilters && (
          <button 
            onClick={handleClearFilters}
            disabled={isLoading}
            className="text-sm text-[#2563EB] hover:underline disabled:opacity-50"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select
            value={searchParams.get('category') || ''}
            disabled={isLoading}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none text-sm disabled:opacity-50"
          >
            <option value="">All</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
          <select
            value={searchParams.get('region') || ''}
            disabled={isLoading}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none text-sm disabled:opacity-50"
          >
            <option value="">All</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Province</label>
          <select
            value={searchParams.get('province') || ''}
            disabled={isLoading || provinces.length === 0}
            onChange={(e) => handleFilterChange('province', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none text-sm disabled:opacity-50"
          >
            <option value="">All</option>
            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
          <select
            value={searchParams.get('city') || ''}
            disabled={isLoading || cities.length === 0}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none text-sm disabled:opacity-50"
          >
            <option value="">All</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={searchParams.get('sort') || 'newest'}
            disabled={isLoading}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none text-sm disabled:opacity-50"
          >
            <option value="newest">Newest</option>
            <option value="featured">Featured</option>
            <option value="verified">Verified</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4 py-2">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              disabled={isLoading}
              checked={searchParams.get('verifiedOnly') === 'true'}
              onChange={(e) => handleCheckboxChange('verifiedOnly', e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB] disabled:opacity-50"
            />
            <span className="text-xs text-gray-700">Verified</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              disabled={isLoading}
              checked={searchParams.get('featuredOnly') === 'true'}
              onChange={(e) => handleCheckboxChange('featuredOnly', e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB] disabled:opacity-50"
            />
            <span className="text-xs text-gray-700">Featured</span>
          </label>
        </div>
      </div>
    </div>
  );
}
