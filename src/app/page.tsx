import { Metadata } from 'next';
import { getFeaturedApprovedBusinesses, getRecentlyApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import SearchHero from '@/components/search/SearchHero';
import PublicBusinessList from '@/components/search/PublicBusinessList';
import Link from 'next/link';
import { LucideArrowRight } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Button, buttonVariants } from '@/components/ui/Button';

export const metadata: Metadata = generatePageMetadata(
  'Find Local Businesses in the Philippines',
  'Search trusted businesses by name, category, city, province, or barangay. Discover the best local services and products on LocalPages.ph.',
  '/'
);

export default async function Home() {
  const [featuredBusinesses, recentBusinesses] = await Promise.all([
    getFeaturedApprovedBusinesses(),
    getRecentlyApprovedBusinesses()
  ]);

  return (
    <div className="flex-1 flex flex-col w-full">
      <SearchHero />
      
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {featuredBusinesses.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Businesses</h2>
                <p className="text-slate-500 mt-1">Discover highly recommended local businesses.</p>
              </div>
              <Link href="/search?featuredOnly=true" className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                View all <LucideArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <PublicBusinessList businesses={featuredBusinesses} />
            <div className="mt-8 sm:hidden text-center">
               <Link href="/search?featuredOnly=true" className={buttonVariants({ variant: 'outline', className: "w-full" })}>
                View all featured <LucideArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recently Added</h2>
              <p className="text-slate-500 mt-1">New businesses in your area.</p>
            </div>
            <Link href="/search" className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              Browse directory <LucideArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <PublicBusinessList businesses={recentBusinesses} />
          <div className="mt-12 flex justify-center">
            <Link href="/search" className={buttonVariants({ variant: 'default', size: 'lg' })}>
              Explore All Businesses
            </Link>
          </div>
        </section>
        
      </div>
    </div>
  );
}
