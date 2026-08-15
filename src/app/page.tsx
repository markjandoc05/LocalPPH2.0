import { Metadata } from 'next';
import { Suspense } from 'react';
import HomeHero from '@/components/home/HomeHero';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import FeaturedBusinessesSection from '@/components/home/FeaturedBusinessesSection';
import RecentlyAddedSection from '@/components/home/RecentlyAddedSection';
import WhyLocalPagesSection, { BusinessOwnerCTA } from '@/components/home/WhyLocalPagesAndCTA';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { 
  CategoriesGridSkeleton, 
  FeaturedBusinessesSkeleton, 
  RecentlyAddedSkeleton 
} from '@/components/home/HomeSkeletons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generatePageMetadata(
  'Find Trusted Local Businesses in the Philippines',
  'Discover verified businesses, services, restaurants, clinics, shops, and more across the Philippines.',
  '/'
);

export default async function Home() {
  return (
    <div className="flex-1 flex flex-col w-full bg-slate-50">
      <HomeHero />
      
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        <Suspense fallback={<RecentlyAddedSkeleton />}>
          <RecentlyAddedSection />
        </Suspense>

        <Suspense fallback={<FeaturedBusinessesSkeleton />}>
          <FeaturedBusinessesSection />
        </Suspense>

        <WhyLocalPagesSection />
        
        <BusinessOwnerCTA />

        <Suspense fallback={<CategoriesGridSkeleton />}>
          <CategoriesGrid />
        </Suspense>

      </div>
    </div>
  );
}
