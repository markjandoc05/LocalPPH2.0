import { getApprovedBusinessBySlug } from '@/lib/data-connect/public-business-service';
import PublicBusinessProfile from '@/components/business/PublicBusinessProfile';
import Link from 'next/link';
import { LucideArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { generateBusinessMetadata } from '@/lib/seo/metadata';
import { generateLocalBusinessJsonLd } from '@/lib/seo/jsonld';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import PageTracker from '@/components/analytics/PageTracker';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const business = await getApprovedBusinessBySlug(resolvedParams.slug);
  return generateBusinessMetadata(business);
}

export default async function BusinessProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const business = await getApprovedBusinessBySlug(resolvedParams.slug);

  if (!business) {
    notFound();
  }

  const jsonLd = generateLocalBusinessJsonLd(business);

  const breadcrumbs = [
    { label: business.categoryName || business.categoryId || 'Category', href: `/search?category=${business.categorySlug || business.categoryId}` },
    { label: business.cityName || business.cityId || 'City', href: `/search?city=${business.citySlug || business.cityId}` },
    { label: business.name },
  ];

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      <PageTracker
        params={{
          page_type: "Business Profile",
          business_id: business.id,
          business_slug: business.slug,
          business_name: business.name,
          category: business.categoryName || business.categoryId || "",
          city: business.cityName || business.cityId || "",
          province: business.provinceId || "",
          region: business.regionId || "",
          verified: !!business.isVerified,
          featured: !!business.isFeatured,
          premium: !!(business as any).isPremium,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col gap-4">
          <Link href="/search" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
            <LucideArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
          <Breadcrumbs items={breadcrumbs} />
        </div>
        
        <PublicBusinessProfile business={business} />
      </div>
    </div>
  );
}
