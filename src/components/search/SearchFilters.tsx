'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Reset to page 1 on filter change
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
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
            className="text-sm text-[#2563EB] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={searchParams.get('category') || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
          >
            <option value="">All Categories</option>
            <option value="c1">Food & Beverage</option>
            <option value="c2">IT Services</option>
            <option value="c3">Retail</option>
            <option value="c4">Health & Wellness</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <select
            value={searchParams.get('city') || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
          >
            <option value="">All Cities</option>
            <option value="city1">Manila</option>
            <option value="city2">Makati</option>
            <option value="city3">Quezon City</option>
            <option value="city4">Taguig</option>
          </select>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={searchParams.get('verifiedOnly') === 'true'}
              onChange={(e) => handleCheckboxChange('verifiedOnly', e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB]"
            />
            <span className="text-sm text-gray-700">Verified Business</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={searchParams.get('featuredOnly') === 'true'}
              onChange={(e) => handleCheckboxChange('featuredOnly', e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB]"
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>
      </div>
    </div>
  );
}
