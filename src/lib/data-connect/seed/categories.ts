export interface SeedCategory {
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
}

export const categories: SeedCategory[] = [
  {
    name: "Food & Beverage",
    slug: "food-and-beverage",
    subcategories: [
      { name: "Restaurants", slug: "restaurants" },
      { name: "Coffee Shops", slug: "coffee-shops" },
    ],
  },
  {
    name: "Health & Medical",
    slug: "health-and-medical",
    subcategories: [
      { name: "Clinics", slug: "clinics" },
      { name: "Hospitals", slug: "hospitals" },
      { name: "Dental Clinics", slug: "dental-clinics" },
      { name: "Aesthetic Clinics", slug: "aesthetic-clinics" },
      { name: "Pharmacies", slug: "pharmacies" },
      { name: "Medical Suppliers", slug: "medical-suppliers" },
    ],
  },
  {
    name: "Travel & Hospitality",
    slug: "travel-and-hospitality",
    subcategories: [
      { name: "Hotels", slug: "hotels" },
      { name: "Resorts", slug: "resorts" },
      { name: "Travel Agencies", slug: "travel-agencies" },
    ],
  },
  {
    name: "Wellness & Beauty",
    slug: "wellness-and-beauty",
    subcategories: [
      { name: "Salons", slug: "salons" },
      { name: "Spas", slug: "spas" },
      { name: "Gyms", slug: "gyms" },
    ],
  },
  {
    name: "Construction & Home",
    slug: "construction-and-home",
    subcategories: [
      { name: "Hardware Stores", slug: "hardware-stores" },
      { name: "Construction Services", slug: "construction-services" },
      { name: "Real Estate", slug: "real-estate" },
    ],
  },
  {
    name: "Education",
    slug: "education",
    subcategories: [
      { name: "Schools", slug: "schools" },
      { name: "Universities", slug: "universities" },
    ],
  },
  {
    name: "Tech & Digital",
    slug: "tech-and-digital",
    subcategories: [
      { name: "IT Services", slug: "it-services" },
      { name: "Web Developers", slug: "web-developers" },
      { name: "Marketing Agencies", slug: "marketing-agencies" },
      { name: "Printing Services", slug: "printing-services" },
    ],
  },
  {
    name: "Automotive",
    slug: "automotive",
    subcategories: [
      { name: "Auto Repair", slug: "auto-repair" },
      { name: "Car Dealers", slug: "car-dealers" },
    ],
  },
  {
    name: "Professional Services",
    slug: "professional-services",
    subcategories: [
      { name: "Accounting Services", slug: "accounting-services" },
      { name: "Law Firms", slug: "law-firms" },
    ],
  },
  {
    name: "Pets",
    slug: "pets",
    subcategories: [
      { name: "Veterinary Clinics", slug: "veterinary-clinics" },
      { name: "Pet Shops", slug: "pet-shops" },
    ],
  },
];
