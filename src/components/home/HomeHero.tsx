'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LucideSearch, MapPin, Tag, Building2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import Link from 'next/link';
import { publicClientProvider } from '@/lib/data-connect/client-provider';

export default function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await publicClientProvider.getSearchSuggestions({ q: query.trim() });
        setSuggestions(res.data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    if (suggestion.type === 'business') {
      router.push(`/business/${suggestion.slug}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
    }
  };

  return (
    <div className="bg-[#0C0C1C] py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-slate-800">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white mb-6">
          Find Trusted Local Businesses in the Philippines
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Discover verified businesses, services, restaurants, clinics, shops, and more across the Philippines.
        </p>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8 relative" ref={containerRef}>
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LucideSearch className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
              placeholder="Search business name or keyword"
              className="block w-full pl-11 pr-4 py-4 border border-slate-700 rounded-2xl text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg outline-none shadow-sm"
            />

            {showSuggestions && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left animate-in fade-in zoom-in duration-200">
                {isLoading ? (
                  <div className="p-4 text-center text-slate-500">Searching...</div>
                ) : suggestions.length > 0 ? (
                  <div className="py-2">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                      >
                        <div className="mt-1">
                          <Building2 className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{s.text}</div>
                          <div className="text-xs text-slate-500">{s.subtext}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500">No matching businesses found.</div>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Explore
          </button>
        </form>

        <div className="text-sm text-slate-400">
          Popular: <Link href="/search?q=restaurants" className="hover:text-blue-400">Restaurants</Link> • <Link href="/search?q=coffee+shops" className="hover:text-blue-400">Coffee Shops</Link> • <Link href="/search?q=clinics" className="hover:text-blue-400">Clinics</Link> • <Link href="/search?q=hotels" className="hover:text-blue-400">Hotels</Link>
        </div>
      </div>
    </div>
  );
}
