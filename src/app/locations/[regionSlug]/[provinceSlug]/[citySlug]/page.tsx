import React from "react";
import { notFound } from "next/navigation";
import {
  getRegionBySlug,
  getProvinceBySlug,
  getCityBySlug,
  getApprovedBusinessesByCity,
  getAllCategories,
} from "@/lib/data-connect/directory-service";
import DirectoryPageHeader from "@/components/directory/DirectoryPageHeader";
import LocationBreadcrumbs from "@/components/directory/LocationBreadcrumbs";
import PublicBusinessCard from "@/components/search/PublicBusinessCard";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Tag, Info } from "lucide-react";
import PageTracker from "@/components/analytics/PageTracker";

interface PageParams {
  regionSlug: string;
  provinceSlug: string;
  citySlug: string;
}

interface PageProps {
  params: Promise<PageParams>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { regionSlug, provinceSlug, citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) {
    return {
      title: "City Not Found",
    };
  }
  return generatePageMetadata(
    `Businesses in ${city.name}, ${provinceSlug.toUpperCase()}`,
    `Browse approved businesses, local shops, professional services, and contact information in ${city.name}, Philippines.`,
    `/locations/${regionSlug}/${provinceSlug}/${citySlug}`
  );
}

export default async function CityDetailPage({ params, searchParams }: PageProps) {
  const { regionSlug, provinceSlug, citySlug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const pageStr = resolvedSearchParams.page;
  const limitStr = resolvedSearchParams.limit;

  const region = await getRegionBySlug(regionSlug);
  const province = await getProvinceBySlug(provinceSlug);
  const city = await getCityBySlug(citySlug);

  if (!region || !province || !city) {
    notFound();
  }

  const categories = await getAllCategories();

  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const limit = limitStr ? parseInt(limitStr, 10) : 9;

  // Fetch approved businesses in city
  const listingsResult = await getApprovedBusinessesByCity(city.id, { page, limit });
  const businesses = listingsResult.businesses;
  const total = listingsResult.total;
  const totalPages = Math.ceil(total / limit);

  const breadcrumbs = [
    { label: "Locations", href: "/locations" },
    { label: region.name, href: `/locations/${regionSlug}` },
    { label: province.name, href: `/locations/${regionSlug}/${provinceSlug}` },
    { label: city.name },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <PageTracker
        params={{
          page_type: "City",
          region: region.name,
          province: province.name,
          city: city.name,
        }}
      />
      <DirectoryPageHeader
        title={`${city.name} Business Directory`}
        description={`Find approved and verified local businesses, service providers, and shops in ${city.name}, ${province.name}.`}
        breadcrumbs={<LocationBreadcrumbs items={breadcrumbs} />}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Popular Categories */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#0C0C1C] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#2563EB]" />
                <span>Categories in {city.name}</span>
              </h2>
              
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/search?category=${encodeURIComponent(cat.slug)}&city=${encodeURIComponent(city.slug)}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-[#2563EB] hover:bg-slate-50 transition-colors"
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                      Go
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-[#0C0C1C] text-white rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-[#2563EB]" />
                <span>Are you a business owner?</span>
              </h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Connect with clients right here in {city.name}. Put your brand in front of residents searching daily.
              </p>
              <Link
                href="/business/listings/new"
                className="block w-full text-center py-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Claim or Add Listing
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-sans font-bold text-[#0C0C1C]">
                  Directory Listings in {city.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Showing {businesses.length} of {total} verified local listings
                </p>
              </div>
              
              <Link
                href="/business/listings/new"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                + Register a Business
              </Link>
            </div>

            {businesses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm">
                <div className="text-slate-300 text-5xl mb-4 font-sans">📌</div>
                <h3 className="text-lg font-sans font-bold text-[#0C0C1C] mb-2">No Active Listings Yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  We don&apos;t have any businesses listed in {city.name} yet. If you own or manage a business here, list it for free!
                </p>
                <Link
                  href="/business/listings/new"
                  className="inline-flex items-center justify-center px-4 py-2 bg-[#0C0C1C] hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  List My Business
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {businesses.map((business) => (
                  <PublicBusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 ? (
                  <Link
                    href={`/locations/${regionSlug}/${provinceSlug}/${citySlug}?page=${page - 1}`}
                    className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="p-2 border border-slate-100 bg-slate-50 rounded-lg text-slate-300 cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                <span className="text-xs font-mono font-medium text-slate-500 bg-white border border-slate-100 px-3 py-2 rounded-lg">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={`/locations/${regionSlug}/${provinceSlug}/${citySlug}?page=${page + 1}`}
                    className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="p-2 border border-slate-100 bg-slate-50 rounded-lg text-slate-300 cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
