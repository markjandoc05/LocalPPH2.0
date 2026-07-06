import { getRecentlyApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import Link from 'next/link';
import Image from 'next/image';
import { LucideArrowRight } from 'lucide-react';

export default async function RecentlyAddedSection() {
  const recentBusinesses = await getRecentlyApprovedBusinesses();

  if (recentBusinesses.length === 0) return null;

  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Recently Added</h2>
          <p className="text-slate-500 mt-2">New businesses in your area.</p>
        </div>
        <Link href="/search" className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
          Browse directory <LucideArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentBusinesses.slice(0, 4).map((business) => (
          <div key={business.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            {business.logoUrl && (
              <div className="w-12 h-12 rounded-full relative overflow-hidden flex-shrink-0">
                <Image
                  src={business.logoUrl}
                  alt={business.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-slate-900">{business.name}</h3>
              <p className="text-sm text-slate-500">View Business</p>
            </div>
            <Link href={`/business/${business.slug}`} className="ml-auto p-2 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors">
              <LucideArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
