import { getApprovedBusinessBySlug } from '@/lib/data-connect/public-business-service';
import PublicBusinessProfile from '@/components/business/PublicBusinessProfile';
import Link from 'next/link';
import { LucideArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { generateBusinessMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbJsonLd, generateLocalBusinessJsonLd } from '@/lib/seo/jsonld';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import PageTracker from '@/components/analytics/PageTracker';
import { ErrorState } from '@/components/ui/ErrorState';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const business = await getApprovedBusinessBySlug(resolvedParams.slug);
    return generateBusinessMetadata(business);
  } catch (error) {
    console.error("Failed to load business metadata:", error);
    return generateBusinessMetadata(null);
  }
}

export default async function BusinessProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let business = null;

  try {
    business = await getApprovedBusinessBySlug(resolvedParams.slug);
  } catch (error) {
    console.error("Failed to load business profile:", error);
    return (
      <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/search" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit mb-6">
            <LucideArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
          <ErrorState
            title="Business profile could not load"
            message="Please try again in a moment."
          />
        </div>
      </div>
    );
  }

  if (!business) {
    notFound();
  }

  const categoryHref = business.categorySlug ? `/categories/${business.categorySlug}` : '/categories';
  const cityHref = business.regionSlug && business.provinceSlug && business.citySlug
    ? `/locations/${business.regionSlug}/${business.provinceSlug}/${business.citySlug}`
    : '/locations';

  const breadcrumbs = [
    { label: business.categoryName || 'Categories', href: categoryHref },
    { label: business.cityName || business.provinceName || 'Locations', href: cityHref },
    { label: business.name },
  ];
  const jsonLd = [
    generateLocalBusinessJsonLd(business),
    generateBreadcrumbJsonLd([
      { label: 'Home', href: '/' },
      ...breadcrumbs,
    ]),
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
