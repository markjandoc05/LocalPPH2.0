import React from "react";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getSubcategoriesByCategory,
  getApprovedBusinessesByCategory,
  getAllRegions,
} from "@/lib/data-connect/directory-service";
import DirectoryPageHeader from "@/components/directory/DirectoryPageHeader";
import SubcategoryList from "@/components/directory/SubcategoryList";
import LocationBreadcrumbs from "@/components/directory/LocationBreadcrumbs";
import PublicBusinessCard from "@/components/search/PublicBusinessCard";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter, MapPin } from "lucide-react";
import PageTracker from "@/components/analytics/PageTracker";

interface PageParams {
  categorySlug: string;
}

interface PageProps {
  params: Promise<PageParams>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    regionId?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return {
      title: "Category Not Found",
    };
  }
  return generatePageMetadata(
    `${category.name} Directory`,
    `Find verified ${category.name} businesses, services, and professionals in the Philippines. Browse subcategories, view details, and contact suppliers.`,
    `/categories/${categorySlug}`
  );
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const pageStr = resolvedSearchParams.page;
  const limitStr = resolvedSearchParams.limit;
  const selectedRegionId = resolvedSearchParams.regionId;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  const subcategories = await getSubcategoriesByCategory(category.id);
  const regions = await getAllRegions();

  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const limit = limitStr ? parseInt(limitStr, 10) : 9;

  // Fetch approved businesses
  const listingsResult = await getApprovedBusinessesByCategory(category.id, { page, limit });
  
  // If region filter is applied, filter results (for rich filtering experience)
  let businesses = listingsResult.businesses;
  let total = listingsResult.total;
  
  if (selectedRegionId) {
    businesses = businesses.filter((b) => b.regionId === selectedRegionId);
    total = businesses.length; // Approximate total for filtered set
  }

  const totalPages = Math.ceil(total / limit);

  const breadcrumbs = [
    { label: "Categories", href: "/categories" },
    { label: category.name },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <PageTracker
        params={{
          page_type: "Category",
          category_name: category.name,
          business_count: total,
        }}
      />
      <DirectoryPageHeader
        title={category.name}
        description={category.description}
        breadcrumbs={<LocationBreadcrumbs items={breadcrumbs} />}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / Filters */}
          <div className="lg:col-span-1 space-y-6">
            <SubcategoryList
              subcategories={subcategories}
              mainCategoryName={category.name}
            />

            {/* Region Filter Card */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#0C0C1C] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#2563EB]" />
                <span>Filter by Location</span>
              </h2>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                <Link
                  href={`/categories/${categorySlug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    !selectedRegionId
                      ? "bg-blue-50 text-[#2563EB]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>All Regions</span>
                </Link>
                
                {regions.map((reg) => (
                  <Link
                    key={reg.id}
                    href={`/categories/${categorySlug}?regionId=${reg.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedRegionId === reg.id
                        ? "bg-blue-50 text-[#2563EB]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{reg.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Listings */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-sans font-bold text-[#0C0C1C]">
                  Verified Listings
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Showing {businesses.length} of {total} approved businesses
                </p>
              </div>
              
              <Link
                href="/business/listings/new"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                + List Your Business
              </Link>
            </div>

            {businesses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm">
                <div className="text-slate-300 text-5xl mb-4 font-sans">🔍</div>
                <h3 className="text-lg font-sans font-bold text-[#0C0C1C] mb-2">No Businesses Found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  We don&apos;t have any listings approved in this category yet. Be the first to add your business!
                </p>
                <Link
                  href="/business/listings/new"
                  className="inline-flex items-center justify-center px-4 py-2 bg-[#0C0C1C] hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Create New Listing
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
                    href={`/categories/${categorySlug}?page=${page - 1}${selectedRegionId ? `&regionId=${selectedRegionId}` : ""}`}
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
                    href={`/categories/${categorySlug}?page=${page + 1}${selectedRegionId ? `&regionId=${selectedRegionId}` : ""}`}
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
