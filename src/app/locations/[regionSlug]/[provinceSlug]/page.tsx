import React from "react";
import { notFound } from "next/navigation";
import {
  getRegionBySlug,
  getProvinceBySlug,
  getCitiesByProvince,
} from "@/lib/data-connect/directory-service";
import DirectoryPageHeader from "@/components/directory/DirectoryPageHeader";
import LocationBreadcrumbs from "@/components/directory/LocationBreadcrumbs";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";
import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";

interface PageParams {
  regionSlug: string;
  provinceSlug: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { regionSlug, provinceSlug } = await params;
  const province = await getProvinceBySlug(provinceSlug);
  if (!province) {
    return {
      title: "Province Not Found",
    };
  }
  return generatePageMetadata(
    `Businesses in ${province.name}`,
    `Browse verified local businesses and shops located in ${province.name}, Philippines. Explore city directories and contacts.`,
    `/locations/${regionSlug}/${provinceSlug}`
  );
}

export default async function ProvinceDetailPage({ params }: PageProps) {
  const { regionSlug, provinceSlug } = await params;

  const region = await getRegionBySlug(regionSlug);
  const province = await getProvinceBySlug(provinceSlug);
  
  if (!region || !province) {
    notFound();
  }

  const cities = await getCitiesByProvince(province.id);

  const breadcrumbs = [
    { label: "Locations", href: "/locations" },
    { label: region.name, href: `/locations/${regionSlug}` },
    { label: province.name },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <DirectoryPageHeader
        title={province.name}
        description={`Explore cities, municipalities, and businesses located within ${province.name}, ${region.name}.`}
        breadcrumbs={<LocationBreadcrumbs items={breadcrumbs} />}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-xl font-sans font-bold text-[#0C0C1C]">
                Cities & Municipalities in {province.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Select a city/municipality below to view registered businesses
              </p>
            </div>
          </div>

          {cities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No registered cities or municipalities found for this province yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <div
                  key={city.id}
                  className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-[#2563EB] rounded-lg transition-colors duration-300">
                        <Home className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-sans font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors duration-300">
                        {city.name}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-6 flex-grow">
                      Find local services, retailers, health workers, and companies based in {city.name}.
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                      <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                        City/Town
                      </span>
                      
                      <Link
                        href={`/locations/${regionSlug}/${provinceSlug}/${city.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] group-hover:text-[#1D4ED8] transition-colors"
                      >
                        <span>Browse Listings</span>
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
