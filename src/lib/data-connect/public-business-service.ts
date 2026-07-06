import { provider } from "./provider";
import { BusinessListing } from "@/types/business";

export interface SearchFilters {
  q?: string;
  categoryId?: string;
  cityId?: string;
  regionId?: string;
  provinceId?: string;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchResult {
  businesses: BusinessListing[];
  total: number;
}

export const searchApprovedBusinesses = async (
  filters: SearchFilters,
  pagination: PaginationParams,
): Promise<SearchResult> => {
  const result = await provider.searchApprovedBusinesses({
    ...filters,
    page: pagination.page,
    limit: pagination.limit,
  });
  return result.data as unknown as SearchResult;
};

export const getSearchSuggestions = async (q: string): Promise<any[]> => {
  const result = await provider.getSearchSuggestions({ q });
  return result.data.suggestions;
};

export const getApprovedBusinessBySlug = async (
  slug: string,
): Promise<BusinessListing | null> => {
  const result = await provider.getApprovedBusinessBySlug({ slug });
  return result.data.business as BusinessListing | null;
};

export const getFeaturedApprovedBusinesses = async (): Promise<
  BusinessListing[]
> => {
  const result = await provider.getFeaturedApprovedBusinesses();
  return result.data.businesses as BusinessListing[];
};

export const getRecentlyApprovedBusinesses = async (): Promise<
  BusinessListing[]
> => {
  const result = await provider.getRecentlyApprovedBusinesses();
  return result.data.businesses as BusinessListing[];
};
