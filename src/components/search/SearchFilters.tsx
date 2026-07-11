'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicClientProvider } from '@/lib/data-connect/client-provider';
import { LucideRotateCcw, LucideSearch, LucideSlidersHorizontal } from 'lucide-react';

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
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(() => (
    Boolean(
      searchParams.get('region') ||
      searchParams.get('province') ||
      searchParams.get('city') ||
      searchParams.get('verifiedOnly') ||
      searchParams.get('featuredOnly')
    )
  ));

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

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleFilterChange('q', searchText.trim());
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
  const fieldClass = "h-11 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 text-sm font-semibold text-slate-900 shadow-inner shadow-slate-100 outline-none transition-all duration-150 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wide text-slate-600";
  const utilityButtonClass = "col-span-5 inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 xl:col-span-1 xl:h-11 xl:px-3 xl:text-sm";

  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm shadow-slate-200/70 backdrop-blur sm:p-4">
      <div className="space-y-3">
        <div className="grid grid-cols-10 gap-3 xl:grid-cols-[minmax(300px,1fr)_220px_180px_auto_auto] xl:items-end">
          <form onSubmit={handleSearchSubmit} className="col-span-10 space-y-1 xl:col-span-1">
            <label className={labelClass}>Search by name or location</label>
            <div className="relative">
              <LucideSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={searchText}
                disabled={isLoading}
                onChange={(event) => setSearchText(event.target.value)}
                onBlur={() => {
                  if (searchText.trim() !== (searchParams.get('q') || '')) {
                    handleFilterChange('q', searchText.trim());
                  }
                }}
                placeholder="Business name or location"
                className={`${fieldClass} pl-9 placeholder:text-slate-500`}
              />
            </div>
          </form>

          <label className="col-span-7 space-y-1 xl:col-span-1">
            <span className={labelClass}>Category</span>
          <select
            value={searchParams.get('category') || ''}
            disabled={isLoading}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={fieldClass}
          >
            <option className="text-gray-900 font-medium" value="">All</option>
            {categories.map(c => <option className="text-gray-900 font-medium" key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          </label>

          <label className="col-span-3 space-y-1 xl:col-span-1">
            <span className={labelClass}>Sort by</span>
          <select
            value={searchParams.get('sort') || 'newest'}
            disabled={isLoading}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className={fieldClass}
          >
            <option className="text-gray-900 font-medium" value="newest">Newest</option>
            <option className="text-gray-900 font-medium" value="featured">Featured</option>
            <option className="text-gray-900 font-medium" value="verified">Verified</option>
            <option className="text-gray-900 font-medium" value="name">Name (A-Z)</option>
          </select>
          </label>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters((value) => !value)}
            disabled={isLoading}
            className={`${utilityButtonClass} ${showAdvancedFilters ? 'border-blue-200 bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 hover:text-white' : ''}`}
          >
            <LucideSlidersHorizontal className="mr-1.5 h-3.5 w-3.5 xl:mr-2 xl:h-4 xl:w-4" />
            {showAdvancedFilters ? 'Hide' : 'Advanced'}
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            disabled={isLoading || !hasFilters}
            className={utilityButtonClass}
          >
            <LucideRotateCcw className="mr-1.5 h-3.5 w-3.5 xl:mr-2 xl:h-4 xl:w-4" />
            Clear
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto_auto] xl:items-end">
            <label className="space-y-1">
              <span className={labelClass}>Region</span>
              <select
                value={searchParams.get('region') || ''}
                disabled={isLoading}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className={fieldClass}
              >
                <option className="text-gray-900 font-medium" value="">All regions</option>
                {regions.map(r => <option className="text-gray-900 font-medium" key={r.id} value={r.slug}>{r.name}</option>)}
              </select>
            </label>

            <label className="space-y-1">
              <span className={labelClass}>Province</span>
              <select
                value={searchParams.get('province') || ''}
                disabled={isLoading || provinces.length === 0}
                onChange={(e) => handleFilterChange('province', e.target.value)}
                className={fieldClass}
              >
                <option className="text-gray-900 font-medium" value="">All provinces</option>
                {provinces.map(p => <option className="text-gray-900 font-medium" key={p.id} value={p.slug}>{p.name}</option>)}
              </select>
            </label>

            <label className="space-y-1">
              <span className={labelClass}>City</span>
              <select
                value={searchParams.get('city') || ''}
                disabled={isLoading || cities.length === 0}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className={fieldClass}
              >
                <option className="text-gray-900 font-medium" value="">All cities</option>
                {cities.map(c => <option className="text-gray-900 font-medium" key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </label>

            <label className={`flex h-11 items-center gap-2 rounded-lg border px-3 text-xs font-bold shadow-sm transition-colors cursor-pointer ${searchParams.get('verifiedOnly') === 'true' ? 'border-blue-200 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50'}`}>
              <input
                type="checkbox"
                disabled={isLoading}
                checked={searchParams.get('verifiedOnly') === 'true'}
                onChange={(e) => handleCheckboxChange('verifiedOnly', e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB] cursor-pointer disabled:opacity-50"
              />
              <span>Verified</span>
            </label>

            <label className={`flex h-11 items-center gap-2 rounded-lg border px-3 text-xs font-bold shadow-sm transition-colors cursor-pointer ${searchParams.get('featuredOnly') === 'true' ? 'border-blue-200 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50'}`}>
              <input
                type="checkbox"
                disabled={isLoading}
                checked={searchParams.get('featuredOnly') === 'true'}
                onChange={(e) => handleCheckboxChange('featuredOnly', e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB] cursor-pointer disabled:opacity-50"
              />
              <span>Featured</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
