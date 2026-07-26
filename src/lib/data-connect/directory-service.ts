import { provider } from "./provider";
import { searchApprovedBusinesses, SearchResult } from "./public-business-service";

export interface DirectoryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategoryCount?: number;
}

export interface DirectorySubcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export interface DirectoryRegion {
  id: string;
  name: string;
  slug: string;
  provinceCount?: number;
}

export interface DirectoryProvince {
  id: string;
  regionId: string;
  name: string;
  slug: string;
  cityCount?: number;
}

export interface DirectoryCity {
  id: string;
  provinceId: string;
  name: string;
  slug: string;
}

export const getAllCategories = async (): Promise<DirectoryCategory[]> => {
  const [result, subcategoriesResult] = await Promise.all([
    provider.getCategories(),
    provider.getSubcategories(),
  ]);
  const categoriesList = result.data.categories || [];
  const subcategoriesList = subcategoriesResult.data.subcategories || [];
  const subcategoryCounts = new Map<string, number>();

  for (const subcategory of subcategoriesList) {
    subcategoryCounts.set(
      subcategory.categoryId,
      (subcategoryCounts.get(subcategory.categoryId) || 0) + 1,
    );
  }

  return categoriesList.map((category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  }) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || `${category.name} businesses, services, and shops.`,
    subcategoryCount: subcategoryCounts.get(category.id) || 0,
  }));
};

export const getCategoryBySlug = async (slug: string): Promise<DirectoryCategory | null> => {
  const categories = await getAllCategories();
  return categories.find((c) => c.slug === slug) || null;
};

export const getSubcategoriesByCategory = async (categoryId: string): Promise<DirectorySubcategory[]> => {
  const result = await provider.getSubcategories({ categoryId });
  return (result.data.subcategories || []) as DirectorySubcategory[];
};

export const getAllRegions = async (): Promise<DirectoryRegion[]> => {
  const [result, provincesResult] = await Promise.all([
    provider.getRegions(),
    provider.getProvinces(),
  ]);
  const regionsList = result.data.regions || [];
  const provincesList = provincesResult.data.provinces || [];
  const provinceCounts = new Map<string, number>();

  for (const province of provincesList) {
    provinceCounts.set(
      province.regionId,
      (provinceCounts.get(province.regionId) || 0) + 1,
    );
  }

  return regionsList.map((region: { id: string; name: string; slug: string }) => ({
    id: region.id,
    name: region.name,
    slug: region.slug,
    provinceCount: provinceCounts.get(region.id) || 0,
  }));
};

export const getRegionBySlug = async (slug: string): Promise<DirectoryRegion | null> => {
  const regions = await getAllRegions();
  return regions.find((r) => r.slug === slug) || null;
};

export const getProvincesByRegion = async (regionId: string): Promise<DirectoryProvince[]> => {
  const [result, citiesResult] = await Promise.all([
    provider.getProvinces({ regionId }),
    provider.getCities(),
  ]);
  const provincesList = result.data.provinces || [];
  const citiesList = citiesResult.data.cities || [];
  const cityCounts = new Map<string, number>();

  for (const city of citiesList) {
    cityCounts.set(
      city.provinceId,
      (cityCounts.get(city.provinceId) || 0) + 1,
    );
  }

  return provincesList.map((province: {
    id: string;
    regionId: string;
    name: string;
    slug: string;
  }) => ({
    id: province.id,
    regionId: province.regionId,
    name: province.name,
    slug: province.slug,
    cityCount: cityCounts.get(province.id) || 0,
  }));
};

export const getProvinceBySlug = async (slug: string): Promise<DirectoryProvince | null> => {
  const result = await provider.getProvinces();
  const provincesList = result.data.provinces || [];
  const p = provincesList.find((prov: { id: string; regionId: string; name: string; slug: string }) => prov.slug === slug);
  if (!p) return null;
  
  const cityRes = await provider.getCities({ provinceId: p.id });
  const cities = cityRes.data.cities || [];
  
  return {
    id: p.id,
    regionId: p.regionId,
    name: p.name,
    slug: p.slug,
    cityCount: cities.length,
  };
};

export const getCitiesByProvince = async (provinceId: string): Promise<DirectoryCity[]> => {
  const result = await provider.getCities({ provinceId });
  return (result.data.cities || []) as DirectoryCity[];
};

export const getCityBySlug = async (slug: string): Promise<DirectoryCity | null> => {
  const result = await provider.getCities();
  const citiesList = result.data.cities || [];
  const city = citiesList.find((c: { id: string; provinceId: string; name: string; slug: string }) => c.slug === slug);
  if (!city) return null;
  return {
    id: city.id,
    provinceId: city.provinceId,
    name: city.name,
    slug: city.slug,
  };
};

export const getApprovedBusinessesByCategory = async (
  categoryIdOrSlug: string,
  pagination: { page: number; limit: number },
  regionIdOrSlug?: string,
): Promise<SearchResult> => {
  return searchApprovedBusinesses({
    categoryId: categoryIdOrSlug,
    regionId: regionIdOrSlug,
  }, pagination);
};

export const getApprovedBusinessesByCity = async (
  cityId: string,
  pagination: { page: number; limit: number }
): Promise<SearchResult> => {
  return searchApprovedBusinesses({ cityId: cityId }, pagination);
};
