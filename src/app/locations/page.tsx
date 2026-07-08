import React from "react";
import { getAllRegions } from "@/lib/data-connect/directory-service";
import DirectoryPageHeader from "@/components/directory/DirectoryPageHeader";
import LocationGrid from "@/components/directory/LocationGrid";
import LocationBreadcrumbs from "@/components/directory/LocationBreadcrumbs";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    "Business Locations Directory",
    "Browse LocalPages.ph business listings by region, province, and city. Find verified services and local shops near you in the Philippines.",
    "/locations"
  );
}

export default async function LocationsPage() {
  const regions = await getAllRegions();

  const breadcrumbs = [
    { label: "Locations" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <DirectoryPageHeader
        title="Business Locations"
        description="Browse through Philippine regions, provinces, and cities to locate verified local businesses and organizations."
        breadcrumbs={<LocationBreadcrumbs items={breadcrumbs} />}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-sans font-bold text-[#0C0C1C] mb-6 border-b border-slate-50 pb-4">
            Browse by Region
          </h2>
          <LocationGrid regions={regions} />
        </div>
      </main>
    </div>
  );
}
