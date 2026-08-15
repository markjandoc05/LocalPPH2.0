import { getRecentlyApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import Link from 'next/link';
import BusinessLogo from '@/components/business/BusinessLogo';
import { LucideArrowRight, LucideMapPin } from 'lucide-react';

export default async function RecentlyAddedSection() {
  let recentBusinesses = [];

  try {
    recentBusinesses = await getRecentlyApprovedBusinesses();
  } catch (error) {
    console.error("Failed to load recent businesses:", error);
    return null;
  }

  if (recentBusinesses.length === 0) return null;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Latest Listings</h2>
          <p className="text-slate-500 mt-2">New businesses now live on LocalPages.ph.</p>
        </div>
        <Link href="/search?sort=newest" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
          View all listings <LucideArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recentBusinesses.map((business) => (
          <Link
            key={business.id}
            href={`/business/${business.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <BusinessLogo
              url={business.logoUrl}
              name={business.name}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                {business.name}
              </h3>
              <p className="mt-1 truncate text-sm text-slate-500">
                {business.categoryName || 'Business listing'}
              </p>
              <p className="mt-1 flex items-center truncate text-sm text-slate-500">
                <LucideMapPin className="mr-1 h-4 w-4 shrink-0 text-blue-600" />
                {business.cityName && business.cityName !== 'Not assigned'
                  ? `${business.cityName}, ${business.provinceName}`
                  : 'Philippines'}
              </p>
            </div>
            <LucideArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
          </Link>
        ))}
      </div>
    </section>
  );
}
