import React from "react";
import { notFound } from "next/navigation";
import {
  getRegionBySlug,
  getProvincesByRegion,
} from "@/lib/data-connect/directory-service";
import DirectoryPageHeader from "@/components/directory/DirectoryPageHeader";
import LocationBreadcrumbs from "@/components/directory/LocationBreadcrumbs";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";
import Link from "next/link";
import { Map, ArrowRight } from "lucide-react";
import PageTracker from "@/components/analytics/PageTracker";

interface PageParams {
  regionSlug: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { regionSlug } = await params;
  const region = await getRegionBySlug(regionSlug);
  if (!region) {
    return {
      title: "Region Not Found",
    };
  }
  return generatePageMetadata(
    `Businesses in ${region.name}`,
    `Browse local businesses, services, and shops operating in ${region.name}, Philippines. Explore lists of provinces and cities.`,
    `/locations/${regionSlug}`
  );
}

export default async function RegionDetailPage({ params }: PageProps) {
  const { regionSlug } = await params;
  const region = await getRegionBySlug(regionSlug);
  if (!region) {
    notFound();
  }

  const provinces = await getProvincesByRegion(region.id);

  const breadcrumbs = [
    { label: "Locations", href: "/locations" },
    { label: region.name },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <PageTracker
        params={{
          page_type: "Region",
          region: region.name,
        }}
      />
      <DirectoryPageHeader
        title={region.name}
        description={`Explore cities, provinces, and businesses within the ${region.name} region.`}
        breadcrumbs={<LocationBreadcrumbs items={breadcrumbs} />}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-xl font-sans font-bold text-[#0C0C1C]">
                Provinces under {region.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Select a province below to view specific cities and businesses
              </p>
            </div>
          </div>

          {provinces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No provinces registered for this region yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {provinces.map((prov) => (
                <div
                  key={prov.id}
                  className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-[#2563EB] rounded-lg transition-colors duration-300">
                        <Map className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-sans font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors duration-300">
                        {prov.name}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-6 flex-grow">
                      Find local businesses, professionals, and resources listed in {prov.name}.
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                      <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                        {prov.cityCount !== undefined
                          ? `${prov.cityCount} Cities/Towns`
                          : "View Cities"}
                      </span>
                      
                      <Link
                        href={`/locations/${regionSlug}/${prov.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] group-hover:text-[#1D4ED8] transition-colors"
                      >
                        <span>Browse</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
