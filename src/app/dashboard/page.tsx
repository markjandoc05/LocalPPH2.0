'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin, isBusiness } from '@/lib/auth/roles';
import { 
  LucideSearch, 
  LucideGrid, 
  LucideMapPin, 
  LucideUser, 
  LucideHeart, 
  LucideCompass,
  LucideArrowRight,
  LucideSparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getFeaturedApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import { BusinessListing } from '@/types/business';

interface SavedBusiness {
  id: string;
  name: string;
  category: string;
  city: string;
  slug?: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  
  const [savedBusinesses] = useState<SavedBusiness[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('saved_businesses') || localStorage.getItem('bookmarks');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load saved businesses:', e);
      }
    }
    return [];
  });

  const [recommended, setRecommended] = useState<BusinessListing[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState('');

  // Fetch recommended businesses
  useEffect(() => {
    if (!user) return;

    async function fetchRecommended() {
      try {
        const res = await getFeaturedApprovedBusinesses();
        if (Array.isArray(res)) {
          setRecommended(res.slice(0, 3));
        } else {
          setRecommended([]);
        }
      } catch (err: any) {
        console.error('Failed to load recommended businesses:', err);
        setRecError('Could not load recommended businesses at this time.');
      } finally {
        setRecLoading(false);
      }
    }
    fetchRecommended();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const quickActions = [
    {
      title: 'Search Businesses',
      description: 'Search and discover local services in the Philippines.',
      href: '/',
      icon: LucideSearch,
      buttonText: 'Search Now',
    },
    {
      title: 'Browse Categories',
      description: 'Explore businesses by category and industry.',
      href: '/categories',
      icon: LucideGrid,
      buttonText: 'View Categories',
    },
    {
      title: 'Browse Locations',
      description: 'Find local services by city or province.',
      href: '/locations',
      icon: LucideMapPin,
      buttonText: 'View Locations',
    },
    {
      title: 'My Profile',
      description: 'View and update your contact info and settings.',
      href: '/profile',
      icon: LucideUser,
      buttonText: 'Manage Profile',
    },
  ];

  return (
    <div className="flex-1 bg-slate-50 w-full py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user.displayName || user.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-slate-500 mt-2 text-lg max-w-2xl">
            Discover trusted local businesses, save your favorites, and manage your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main Section: Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LucideCompass className="w-5 h-5 text-blue-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <div 
                      key={i} 
                      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600 w-fit mb-4">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">{action.title}</h3>
                        <p className="text-sm text-slate-500 mb-6">{action.description}</p>
                      </div>
                      <Link href={action.href} className="w-full">
                        <Button variant="secondary" className="w-full font-medium">
                          {action.buttonText}
                          <LucideArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Section: Saved Businesses & Recommended Card */}
          <div className="space-y-8">
            {/* Saved Businesses Card */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LucideHeart className="w-5 h-5 text-red-500 fill-red-500" />
                Saved Businesses
              </h2>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {savedBusinesses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4 text-slate-400">
                      <LucideHeart className="w-8 h-8" />
                    </div>
                    <p className="text-slate-700 font-medium mb-1">
                      You haven’t saved any businesses yet.
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                      Explore our directories to save and bookmark your favorite Philippine service providers.
                    </p>
                    <Link href="/categories">
                      <Button variant="outline" className="w-full text-slate-700 font-semibold border-slate-200 hover:bg-slate-50">
                        Start Exploring
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedBusinesses.map((biz) => (
                      <div key={biz.id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{biz.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{biz.category} • {biz.city}</p>
                        </div>
                        <Link href={biz.slug ? `/business/${biz.slug}` : `/search?q=${encodeURIComponent(biz.name)}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold p-2 h-auto text-xs">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <Link href="/categories" className="block text-center text-xs font-semibold text-blue-600 hover:underline pt-2">
                      Browse More Businesses
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Businesses Card */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LucideSparkles className="w-5 h-5 text-amber-500" />
                Recommended for You
              </h2>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {recLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : recError ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">{recError}</p>
                  </div>
                ) : recommended.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-500 mb-4">No recommended businesses available right now.</p>
                    <Link href="/categories">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Browse Categories
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommended.map((biz) => (
                      <div key={biz.id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors flex justify-between items-center">
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{biz.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{biz.categoryName || 'Business'} • {biz.cityName || 'Local'}</p>
                        </div>
                        <Link href={`/business/${biz.slug}`} className="flex-shrink-0">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold p-2 h-auto text-xs">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <Link href="/" className="block text-center text-xs font-semibold text-blue-600 hover:underline pt-2">
                      Search All Listings
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
