export type BusinessStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'REJECTED'
  | 'INACTIVE'
  | 'SUSPENDED';

export interface BusinessListing {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  keywords?: string;
  
  status: BusinessStatus;
  isVerified?: boolean;
  isFeatured?: boolean;
  
  // Contact
  contactPhone?: string;
  contactMobile?: string;
  contactEmail?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  shopeeUrl?: string;
  lazadaUrl?: string;
  
  // Location
  regionId: string;
  provinceId: string;
  cityId: string;
  barangayId?: string;
  addressLine1: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  
  // Details (Assuming JSON strings or arrays depending on DB capability, using string arrays here for UI)
  businessHours?: string;
  products?: string;
  services?: string;
  paymentMethods?: string;
  parkingAvailability?: string;
  deliveryAvailability?: string;
  accessibilityOptions?: string;
  
  // Moderator Notes
  moderatorNotes?: string;
  
  // Media and documents
  logoUrl?: string;
  coverUrl?: string;
  documents?: { id: string; url: string; name: string; path?: string }[] | string; // Can be parsed or string from DB
  gallery?: string[] | string; // Can be parsed or string from DB
  
  createdAt: string;
  updatedAt: string;
  
  // Relations for UI display
  ownerName?: string;
  ownerEmail?: string;
  ownerAccountStatus?: string;
  revisionReminderCount?: number;
  lastRevisionReminderAt?: string;
  lastRevisionReminderStatus?: 'SENT' | 'FAILED';
  lastRevisionReminderError?: string;
  categoryName?: string;
  categorySlug?: string;
  subcategoryName?: string;
  subcategorySlug?: string;
  cityName?: string;
  citySlug?: string;
  provinceName?: string;
  provinceSlug?: string;
  regionName?: string;
  regionSlug?: string;
}

export interface BusinessStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  needsRevision: number;
  rejected: number;
}
