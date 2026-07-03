export interface SeedRegion {
  name: string;
  slug: string;
}

export interface SeedProvince {
  name: string;
  slug: string;
  regionSlug: string;
}

export interface SeedCity {
  name: string;
  slug: string;
  provinceSlug: string;
}

export const regions: SeedRegion[] = [
  { name: "NCR", slug: "ncr" },
  { name: "CALABARZON", slug: "calabarzon" },
  { name: "Central Luzon", slug: "central-luzon" },
  { name: "Cebu", slug: "cebu-region" },
  { name: "Davao", slug: "davao-region" },
  { name: "Bicol Region", slug: "bicol-region" },
];

export const provinces: SeedProvince[] = [
  // NCR
  { name: "Metro Manila", slug: "metro-manila", regionSlug: "ncr" },
  
  // CALABARZON
  { name: "Cavite", slug: "cavite", regionSlug: "calabarzon" },
  { name: "Laguna", slug: "laguna", regionSlug: "calabarzon" },
  { name: "Batangas", slug: "batangas", regionSlug: "calabarzon" },
  { name: "Rizal", slug: "rizal", regionSlug: "calabarzon" },
  { name: "Quezon", slug: "quezon", regionSlug: "calabarzon" },
  
  // Central Luzon
  { name: "Pampanga", slug: "pampanga", regionSlug: "central-luzon" },
  { name: "Bulacan", slug: "bulacan", regionSlug: "central-luzon" },
  { name: "Tarlac", slug: "tarlac", regionSlug: "central-luzon" },
  
  // Cebu
  { name: "Cebu", slug: "cebu", regionSlug: "cebu-region" },
  
  // Davao
  { name: "Davao del Sur", slug: "davao-del-sur", regionSlug: "davao-region" },
  
  // Bicol
  { name: "Albay", slug: "albay", regionSlug: "bicol-region" },
  { name: "Camarines Sur", slug: "camarines-sur", regionSlug: "bicol-region" },
];

export const cities: SeedCity[] = [
  // Metro Manila
  { name: "Manila", slug: "manila", provinceSlug: "metro-manila" },
  { name: "Quezon City", slug: "quezon-city", provinceSlug: "metro-manila" },
  { name: "Makati", slug: "makati", provinceSlug: "metro-manila" },
  { name: "Taguig", slug: "taguig", provinceSlug: "metro-manila" },
  { name: "Pasig", slug: "pasig", provinceSlug: "metro-manila" },
  { name: "Mandaluyong", slug: "mandaluyong", provinceSlug: "metro-manila" },
  { name: "San Juan", slug: "san-juan", provinceSlug: "metro-manila" },
  { name: "Parañaque", slug: "paranaque", provinceSlug: "metro-manila" },
  { name: "Las Piñas", slug: "las-pinas", provinceSlug: "metro-manila" },
  { name: "Muntinlupa", slug: "muntinlupa", provinceSlug: "metro-manila" },
  { name: "Pasay", slug: "pasay", provinceSlug: "metro-manila" },
  { name: "Marikina", slug: "marikina", provinceSlug: "metro-manila" },
  { name: "Valenzuela", slug: "valenzuela", provinceSlug: "metro-manila" },
  { name: "Malabon", slug: "malabon", provinceSlug: "metro-manila" },
  { name: "Navotas", slug: "navotas", provinceSlug: "metro-manila" },
  { name: "Caloocan", slug: "caloocan", provinceSlug: "metro-manila" },
  { name: "Pateros", slug: "pateros", provinceSlug: "metro-manila" },
  
  // Cavite
  { name: "Dasmarinas", slug: "dasmarinas", provinceSlug: "cavite" },
  { name: "Bacoor", slug: "bacoor", provinceSlug: "cavite" },
  { name: "Imus", slug: "imus", provinceSlug: "cavite" },
  { name: "Tagaytay", slug: "tagaytay", provinceSlug: "cavite" },
  
  // Laguna
  { name: "Santa Rosa", slug: "santa-rosa", provinceSlug: "laguna" },
  { name: "Calamba", slug: "calamba", provinceSlug: "laguna" },
  { name: "Biñan", slug: "binan", provinceSlug: "laguna" },
  
  // Pampanga
  { name: "San Fernando", slug: "san-fernando-pampanga", provinceSlug: "pampanga" },
  { name: "Angeles", slug: "angeles", provinceSlug: "pampanga" },
  
  // Cebu
  { name: "Cebu City", slug: "cebu-city", provinceSlug: "cebu" },
  { name: "Mandaue", slug: "mandaue", provinceSlug: "cebu" },
  { name: "Lapu-Lapu", slug: "lapu-lapu", provinceSlug: "cebu" },
  
  // Davao
  { name: "Davao City", slug: "davao-city", provinceSlug: "davao-del-sur" },
  
  // Bicol
  { name: "Legazpi", slug: "legazpi", provinceSlug: "albay" },
  { name: "Naga", slug: "naga", provinceSlug: "camarines-sur" },
];
