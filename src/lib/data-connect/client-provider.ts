import { DataProvider } from "./types";
import { auth } from "@/lib/firebase/config";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const apiFetch = async (method: string, variables?: any) => {
  const token = await auth.currentUser?.getIdToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/data", {
    method: "POST",
    headers,
    body: JSON.stringify({ method, variables }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(error.error || `API error: ${res.status}`, res.status);
  }
  
  return res.json();
};

const publicApiFetch = async (method: string, variables?: any) => {
  const res = await fetch("/api/public/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ method, variables }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(error.error || `API error: ${res.status}`, res.status);
  }
  
  return res.json();
};

export const publicClientProvider: DataProvider = {
  getCategories: () => publicApiFetch("getCategories"),
  getRegions: () => publicApiFetch("getRegions"),
  getProvinces: (vars: any) => publicApiFetch("getProvinces", vars),
  getCities: (vars: any) => publicApiFetch("getCities", vars),
  getSubcategories: (vars: any) => publicApiFetch("getSubcategories", vars),
  getSearchSuggestions: (vars: any) => publicApiFetch("getSearchSuggestions", vars),
  searchApprovedBusinesses: (vars: any) => publicApiFetch("searchApprovedBusinesses", vars),
  // Other methods not needed for public filters...
} as any;

export const clientProvider: DataProvider = {
  createUser: (vars) => apiFetch("createUser", vars),
  getUserById: (vars) => apiFetch("getUserById", vars),
  updateUser: (vars) => apiFetch("updateUser", vars),
  getAllUsers: () => apiFetch("getAllUsers"),
  createSupportTicket: (vars) => apiFetch("createSupportTicket", vars),
  getMySupportTickets: (vars) => apiFetch("getMySupportTickets", vars),
  getAllSupportTickets: () => apiFetch("getAllSupportTickets"),
  updateSupportTicket: (vars) => apiFetch("updateSupportTicket", vars),
  getMyBusinesses: (vars) => apiFetch("getMyBusinesses", vars),
  getBusinessById: (vars) => apiFetch("getBusinessById", vars),
  createBusinessDraft: (vars) => apiFetch("createBusinessDraft", vars),
  updateBusiness: (vars) => apiFetch("updateBusiness", vars),
  submitBusiness: (vars) => apiFetch("submitBusiness", vars),
  getAllBusinesses: (vars) => apiFetch("getAllBusinesses", vars),
  updateBusinessStatus: (vars) => apiFetch("updateBusinessStatus", vars),
  searchApprovedBusinesses: (vars) => publicApiFetch("searchApprovedBusinesses", vars),
  getSearchSuggestions: (vars) => publicApiFetch("getSearchSuggestions", vars),
  getApprovedBusinessBySlug: (vars) => publicApiFetch("getApprovedBusinessBySlug", vars),
  getFeaturedApprovedBusinesses: () => publicApiFetch("getFeaturedApprovedBusinesses"),
  getRecentlyApprovedBusinesses: () => publicApiFetch("getRecentlyApprovedBusinesses"),
  getRegions: () => publicApiFetch("getRegions"),
  getProvinces: (vars) => publicApiFetch("getProvinces", vars),
  getCities: (vars) => publicApiFetch("getCities", vars),
  getCategories: () => publicApiFetch("getCategories"),
  getSubcategories: (vars) => publicApiFetch("getSubcategories", vars),
  upsertRegion: (vars) => apiFetch("upsertRegion", vars),
  upsertProvince: (vars) => apiFetch("upsertProvince", vars),
  upsertCity: (vars) => apiFetch("upsertCity", vars),
  upsertCategory: (vars) => apiFetch("upsertCategory", vars),
  upsertSubcategory: (vars) => apiFetch("upsertSubcategory", vars),
};
