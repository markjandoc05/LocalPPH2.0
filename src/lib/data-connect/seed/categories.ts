export interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  subcategories: { name: string; slug: string }[];
}

export const legacyCategoryAliases: Record<string, string[]> = {
  'food-dining': ['food-beverage'],
  'retail-shopping': ['retail'],
  'professional-services': ['services'],
  'beauty-wellness': ['health-wellness'],
};

export const legacyCategorySlugs = Object.values(legacyCategoryAliases).flat();

export const getCategorySlugsForSearch = (slug: string) => [
  slug,
  ...(legacyCategoryAliases[slug] || []),
];

export const categories: SeedCategory[] = [
  {
    name: 'Food & Dining',
    slug: 'food-dining',
    description: 'Restaurants, cafes, food services, and dining establishments.',
    subcategories: [
      { name: 'Restaurants', slug: 'restaurants' },
      { name: 'Coffee Shops', slug: 'coffee-shops' },
      { name: 'Bakeries', slug: 'bakeries' },
      { name: 'Catering Services', slug: 'catering-services' },
      { name: 'Fast Food', slug: 'fast-food' },
    ],
  },
  {
    name: 'Health & Medical',
    slug: 'health-medical',
    description: 'Hospitals, clinics, pharmacies, laboratories, and healthcare services.',
    subcategories: [
      { name: 'Clinics', slug: 'clinics' },
      { name: 'Hospitals', slug: 'hospitals' },
      { name: 'Dental Clinics', slug: 'dental-clinics' },
      { name: 'Pharmacies', slug: 'pharmacies' },
      { name: 'Diagnostic Laboratories', slug: 'diagnostic-laboratories' },
    ],
  },
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    description: 'Salons, spas, fitness centers, wellness clinics, and personal care services.',
    subcategories: [
      { name: 'Salons', slug: 'salons' },
      { name: 'Spas', slug: 'spas' },
      { name: 'Gyms & Fitness Centers', slug: 'gyms-fitness-centers' },
      { name: 'Wellness Centers', slug: 'wellness-centers' },
      { name: 'Personal Care', slug: 'personal-care' },
    ],
  },
  {
    name: 'Retail & Shopping',
    slug: 'retail-shopping',
    description: 'Stores, malls, groceries, convenience shops, and retail businesses.',
    subcategories: [
      { name: 'Supermarkets', slug: 'supermarkets' },
      { name: 'Fashion & Apparel', slug: 'fashion-apparel' },
      { name: 'Convenience Stores', slug: 'convenience-stores' },
      { name: 'Specialty Shops', slug: 'specialty-shops' },
      { name: 'Online Stores', slug: 'online-stores' },
    ],
  },
  {
    name: 'Home & Construction',
    slug: 'home-construction',
    description: 'Contractors, home services, hardware, construction, repairs, and maintenance.',
    subcategories: [
      { name: 'Construction Services', slug: 'construction-services' },
      { name: 'Hardware', slug: 'hardware' },
      { name: 'Furniture & Interior Design', slug: 'furniture-interior-design' },
      { name: 'Home Repair & Maintenance', slug: 'home-repair-maintenance' },
      { name: 'Fire Safety Equipment', slug: 'fire-safety-equipment' },
    ],
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car dealers, motorcycle shops, repair services, car wash, parts, and transport-related services.',
    subcategories: [
      { name: 'Auto Repair', slug: 'auto-repair' },
      { name: 'Car Dealers', slug: 'car-dealers' },
      { name: 'Motorcycle Shops', slug: 'motorcycle-shops' },
      { name: 'Car Wash & Detailing', slug: 'car-wash-detailing' },
      { name: 'Auto Parts', slug: 'auto-parts' },
    ],
  },
  {
    name: 'Professional Services',
    slug: 'professional-services',
    description: 'Law, accounting, consulting, insurance, marketing, and other professional services.',
    subcategories: [
      { name: 'Accounting', slug: 'accounting' },
      { name: 'Law Firms', slug: 'law-firms' },
      { name: 'Consulting', slug: 'consulting' },
      { name: 'Insurance', slug: 'insurance' },
      { name: 'Marketing', slug: 'marketing' },
      { name: 'Printing', slug: 'printing' },
    ],
  },
  {
    name: 'Education & Training',
    slug: 'education-training',
    description: 'Schools, universities, review centers, tutorials, and training providers.',
    subcategories: [
      { name: 'Schools', slug: 'schools' },
      { name: 'Universities', slug: 'universities' },
      { name: 'Tutorial Services', slug: 'tutorial-services' },
      { name: 'Review Centers', slug: 'review-centers' },
      { name: 'Vocational Training', slug: 'vocational-training' },
    ],
  },
  {
    name: 'Travel & Hospitality',
    slug: 'travel-hospitality',
    description: 'Hotels, resorts, travel agencies, tour operators, venues, and hospitality services.',
    subcategories: [
      { name: 'Hotels', slug: 'hotels' },
      { name: 'Resorts', slug: 'resorts' },
      { name: 'Travel Agencies', slug: 'travel-agencies' },
      { name: 'Tour Operators', slug: 'tour-operators' },
    ],
  },
  {
    name: 'Finance & Legal',
    slug: 'finance-legal',
    description: 'Banks, lending, pawnshops, remittance, legal, and financial service providers.',
    subcategories: [
      { name: 'Banks', slug: 'banks' },
      { name: 'Lending Services', slug: 'lending-services' },
      { name: 'Pawnshops', slug: 'pawnshops' },
      { name: 'Remittance Centers', slug: 'remittance-centers' },
      { name: 'Financial Services', slug: 'financial-services' },
    ],
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Developers, brokers, condominiums, apartments, dormitories, and property services.',
    subcategories: [
      { name: 'Brokers & Agents', slug: 'brokers-agents' },
      { name: 'Property Developers', slug: 'property-developers' },
      { name: 'Property Rentals', slug: 'property-rentals' },
      { name: 'Property Management', slug: 'property-management' },
    ],
  },
  {
    name: 'Events & Entertainment',
    slug: 'events-entertainment',
    description: 'Event planners, venues, studios, entertainment, performers, and party suppliers.',
    subcategories: [
      { name: 'Event Planners', slug: 'event-planners' },
      { name: 'Venues', slug: 'venues' },
      { name: 'Event Equipment Rental', slug: 'event-equipment-rental' },
      { name: 'Performers & Entertainment', slug: 'performers-entertainment' },
    ],
  },
  {
    name: 'Technology & Digital Services',
    slug: 'technology-digital-services',
    description: 'IT services, software, web development, digital marketing, and online business support.',
    subcategories: [
      { name: 'IT Services', slug: 'it-services' },
      { name: 'Software Development', slug: 'software-development' },
      { name: 'Web Development', slug: 'web-development' },
      { name: 'Digital Marketing', slug: 'digital-marketing' },
      { name: 'AI & Automation', slug: 'ai-automation' },
    ],
  },
  {
    name: 'Government & Public Services',
    slug: 'government-public-services',
    description: 'Government offices, LGUs, barangay offices, and public service institutions.',
    subcategories: [
      { name: 'National Government Offices', slug: 'national-government-offices' },
      { name: 'LGU Offices', slug: 'lgu-offices' },
      { name: 'Barangay Offices', slug: 'barangay-offices' },
      { name: 'Public Utilities', slug: 'public-utilities' },
    ],
  },
  {
    name: 'Community & Religious',
    slug: 'community-religious',
    description: 'Churches, chapels, NGOs, foundations, and community organizations.',
    subcategories: [
      { name: 'Churches & Places of Worship', slug: 'churches-places-of-worship' },
      { name: 'NGOs & Foundations', slug: 'ngos-foundations' },
      { name: 'Community Organizations', slug: 'community-organizations' },
    ],
  },
  {
    name: 'Agriculture & Local Trade',
    slug: 'agriculture-local-trade',
    description: 'Farms, agri supplies, fisheries, livestock, public markets, and local suppliers.',
    subcategories: [
      { name: 'Farms', slug: 'farms' },
      { name: 'Agricultural Supplies', slug: 'agricultural-supplies' },
      { name: 'Fisheries', slug: 'fisheries' },
      { name: 'Livestock', slug: 'livestock' },
      { name: 'Public Markets', slug: 'public-markets' },
    ],
  },
];
