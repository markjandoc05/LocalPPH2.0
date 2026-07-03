'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LucideSearch } from 'lucide-react';

export default function SearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="bg-[#0C0C1C] py-20 px-4 sm:px-6 lg:px-8 text-center text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Find Local Businesses in the Philippines
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Search trusted businesses by name, category, city, province, or barangay.
        </p>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LucideSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="block w-full pl-11 pr-4 py-3.5 border-0 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-[#2563EB] sm:text-lg outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-[#2563EB] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0C0C1C] transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
