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

export const clientProvider: DataProvider = {
  createUser: (vars) => apiFetch("createUser", vars),
  getUserById: (vars) => apiFetch("getUserById", vars),
  updateUser: (vars) => apiFetch("updateUser", vars),
  getAllUsers: () => apiFetch("getAllUsers"),
  getMyBusinesses: (vars) => apiFetch("getMyBusinesses", vars),
  getBusinessById: (vars) => apiFetch("getBusinessById", vars),
  createBusinessDraft: (vars) => apiFetch("createBusinessDraft", vars),
  updateBusiness: (vars) => apiFetch("updateBusiness", vars),
  submitBusiness: (vars) => apiFetch("submitBusiness", vars),
  getAllBusinesses: (vars) => apiFetch("getAllBusinesses", vars),
  updateBusinessStatus: (vars) => apiFetch("updateBusinessStatus", vars),
  searchApprovedBusinesses: (vars) => apiFetch("searchApprovedBusinesses", vars),
  getApprovedBusinessBySlug: (vars) => apiFetch("getApprovedBusinessBySlug", vars),
  getFeaturedApprovedBusinesses: () => apiFetch("getFeaturedApprovedBusinesses"),
  getRecentlyApprovedBusinesses: () => apiFetch("getRecentlyApprovedBusinesses"),
  getRegions: () => apiFetch("getRegions"),
  getProvinces: (vars) => apiFetch("getProvinces", vars),
  getCities: (vars) => apiFetch("getCities", vars),
  getCategories: () => apiFetch("getCategories"),
  getSubcategories: (vars) => apiFetch("getSubcategories", vars),
  upsertRegion: (vars) => apiFetch("upsertRegion", vars),
  upsertProvince: (vars) => apiFetch("upsertProvince", vars),
  upsertCity: (vars) => apiFetch("upsertCity", vars),
  upsertCategory: (vars) => apiFetch("upsertCategory", vars),
  upsertSubcategory: (vars) => apiFetch("upsertSubcategory", vars),
};
