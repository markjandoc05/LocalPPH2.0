export interface SeedCategory {
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
}

export const categories: SeedCategory[] = [
  { name: "Food & Dining", slug: "food-and-dining", subcategories: [{ name: "Restaurants", slug: "restaurants" }, { name: "Coffee Shops", slug: "coffee-shops" }] },
  { name: "Health & Medical", slug: "health-and-medical", subcategories: [{ name: "Clinics", slug: "clinics" }, { name: "Hospitals", slug: "hospitals" }, { name: "Dental", slug: "dental" }, { name: "Pharmacies", slug: "pharmacies" }] },
  { name: "Beauty & Wellness", slug: "beauty-and-wellness", subcategories: [{ name: "Salons", slug: "salons" }, { name: "Spas", slug: "spas" }, { name: "Gyms", slug: "gyms" }] },
  { name: "Retail & Shopping", slug: "retail-and-shopping", subcategories: [{ name: "Supermarkets", slug: "supermarkets" }, { name: "Fashion & Apparel", slug: "fashion-apparel" }] },
  { name: "Home & Construction", slug: "home-and-construction", subcategories: [{ name: "Hardware", slug: "hardware" }, { name: "Construction Services", slug: "construction" }] },
  { name: "Automotive", slug: "automotive", subcategories: [{ name: "Auto Repair", slug: "auto-repair" }, { name: "Car Dealers", slug: "car-dealers" }] },
  { name: "Professional Services", slug: "professional-services", subcategories: [{ name: "Marketing", slug: "marketing" }, { name: "Printing", slug: "printing" }] },
  { name: "Education & Training", slug: "education-and-training", subcategories: [{ name: "Schools", slug: "schools" }, { name: "Universities", slug: "universities" }] },
  { name: "Travel & Hospitality", slug: "travel-and-hospitality", subcategories: [{ name: "Hotels", slug: "hotels" }, { name: "Resorts", slug: "resorts" }, { name: "Travel Agencies", slug: "travel-agencies" }] },
  { name: "Finance & Legal", slug: "finance-and-legal", subcategories: [{ name: "Banks", slug: "banks" }, { name: "Accounting", slug: "accounting" }, { name: "Law Firms", slug: "law-firms" }] },
  { name: "Real Estate", slug: "real-estate", subcategories: [{ name: "Real Estate Agents", slug: "agents" }] },
  { name: "Events & Entertainment", slug: "events-and-entertainment", subcategories: [{ name: "Event Planners", slug: "planners" }, { name: "Venues", slug: "venues" }] },
  { name: "Technology & Digital Services", slug: "technology-and-digital-services", subcategories: [{ name: "IT Services", slug: "it-services" }, { name: "Web Development", slug: "web-dev" }] },
  { name: "Government & Public Services", slug: "government-and-public-services", subcategories: [{ name: "Government Offices", slug: "offices" }] },
  { name: "Community & Religious", slug: "community-and-religious", subcategories: [{ name: "Churches", slug: "churches" }] },
  { name: "Agriculture & Local Trade", slug: "agriculture-and-local-trade", subcategories: [{ name: "Farms", slug: "farms" }, { name: "Local Markets", slug: "markets" }] },
];
