import { getFeaturedApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import Link from 'next/link';
import Image from 'next/image';
import { LucideArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';

export default async function FeaturedBusinessesSection() {
  const featuredBusinesses = await getFeaturedApprovedBusinesses();

  if (featuredBusinesses.length === 0) return null;

  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured Businesses</h2>
          <p className="text-slate-500 mt-2">Discover highly recommended local businesses.</p>
        </div>
        <Link href="/search?featuredOnly=true" className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
          View all <LucideArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredBusinesses.slice(0, 3).map((business) => (
          <div key={business.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
             <div className="h-48 bg-slate-200 relative">
               {business.coverUrl && (
                 <Image
                   src={business.coverUrl}
                   alt={business.name}
                   fill
                   sizes="(max-width: 768px) 100vw, 33vw"
                   className="object-cover"
                   referrerPolicy="no-referrer"
                 />
               )}
             </div>
             <div className="p-6 flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  {business.logoUrl && (
                    <div className="w-10 h-10 rounded-full relative overflow-hidden flex-shrink-0">
                      <Image
                        src={business.logoUrl}
                        alt={business.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-lg text-slate-900 ml-3">{business.name}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{business.description}</p>
             </div>
             <div className="p-6 border-t border-slate-100">
                <Link href={`/business/${business.slug}`} className={buttonVariants({ variant: 'outline', className: "w-full" })}>
                  View Business
                </Link>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}
