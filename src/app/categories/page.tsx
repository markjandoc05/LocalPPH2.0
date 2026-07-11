import React from "react";
import { DirectoryCategory, getAllCategories } from "@/lib/data-connect/directory-service";
import DirectoryPageHeader from "@/components/directory/DirectoryPageHeader";
import CategoryGrid from "@/components/directory/CategoryGrid";
import LocationBreadcrumbs from "@/components/directory/LocationBreadcrumbs";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";
import { ErrorState } from "@/components/ui/ErrorState";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    "Business Categories Directory",
    "Browse the LocalPages.ph Philippine business directory by category. Find local stores, professional services, restaurants, health providers, and more.",
    "/categories"
  );
}

export default async function CategoriesPage() {
  let categories: DirectoryCategory[] = [];
  let loadError = false;

  try {
    categories = await getAllCategories();
  } catch (error) {
    console.error("Failed to load categories page:", error);
    loadError = true;
  }

  const breadcrumbs = [
    { label: "Categories" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <DirectoryPageHeader
        title="Business Categories"
        description="Discover local businesses, services, and professionals in the Philippines by browsing our hand-picked categories."
        breadcrumbs={<LocationBreadcrumbs items={breadcrumbs} />}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-sans font-bold text-[#0C0C1C] mb-6 border-b border-slate-50 pb-4">
            All Categories
          </h2>
          {loadError ? (
            <ErrorState
              title="Categories could not load"
              message="Please try again in a moment."
            />
          ) : (
            <CategoryGrid categories={categories} />
          )}
        </div>
      </main>
    </div>
  );
}
