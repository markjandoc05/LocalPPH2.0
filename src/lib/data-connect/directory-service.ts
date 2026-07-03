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
  const result = await provider.getCategories();
  const categoriesList = result.data.categories || [];
  
  // Calculate subcategories count
  const categoriesWithCount = await Promise.all(
    categoriesList.map(async (cat: { id: string; name: string; slug: string }) => {
      const subsRes = await provider.getSubcategories({ categoryId: cat.id });
      const subs = subsRes.data.subcategories || [];
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: `${cat.name} businesses, services, and shops.`,
        subcategoryCount: subs.length,
      };
    })
  );
  
  return categoriesWithCount;
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
  const result = await provider.getRegions();
  const regionsList = result.data.regions || [];
  
  // Statically compute province count from seed info or dynamically query
  const regionsWithCount = await Promise.all(
    regionsList.map(async (reg: { id: string; name: string; slug: string }) => {
      const provRes = await provider.getProvinces({ regionId: reg.id });
      const provs = provRes.data.provinces || [];
      return {
        id: reg.id,
        name: reg.name,
        slug: reg.slug,
        provinceCount: provs.length,
      };
    })
  );
  
  return regionsWithCount;
};

export const getRegionBySlug = async (slug: string): Promise<DirectoryRegion | null> => {
  const regions = await getAllRegions();
  return regions.find((r) => r.slug === slug) || null;
};

export const getProvincesByRegion = async (regionId: string): Promise<DirectoryProvince[]> => {
  const result = await provider.getProvinces({ regionId });
  const provincesList = result.data.provinces || [];
  
  const provincesWithCount = await Promise.all(
    provincesList.map(async (p: { id: string; regionId: string; name: string; slug: string }) => {
      const cityRes = await provider.getCities({ provinceId: p.id });
      const cities = cityRes.data.cities || [];
      return {
        id: p.id,
        regionId: p.regionId,
        name: p.name,
        slug: p.slug,
        cityCount: cities.length,
      };
    })
  );
  
  return provincesWithCount;
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
  categoryId: string,
  pagination: { page: number; limit: number }
): Promise<SearchResult> => {
  return searchApprovedBusinesses({ category: categoryId }, pagination);
};

export const getApprovedBusinessesByCity = async (
  cityId: string,
  pagination: { page: number; limit: number }
): Promise<SearchResult> => {
  return searchApprovedBusinesses({ city: cityId }, pagination);
};
