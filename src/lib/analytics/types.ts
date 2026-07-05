export type PageType =
  | 'Home'
  | 'Search'
  | 'Categories'
  | 'Category'
  | 'Locations'
  | 'Region'
  | 'Province'
  | 'City'
  | 'Barangay'
  | 'Business Profile'
  | 'Login'
  | 'Register'
  | 'New Listing';

export interface BasePageParams {
  page_type: PageType;
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface BusinessPageParams extends BasePageParams {
  page_type: 'Business Profile';
  business_id: string;
  business_slug: string;
  business_name: string;
  category: string;
  city: string;
  province: string;
  region: string;
  verified: boolean;
  featured: boolean;
  premium: boolean;
}

export interface CategoryPageParams extends BasePageParams {
  page_type: 'Category';
  category_name: string;
  business_count?: number;
}

export interface LocationPageParams extends BasePageParams {
  page_type: 'Region' | 'Province' | 'City' | 'Barangay';
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
}

export interface SearchPageParams extends BasePageParams {
  page_type: 'Search';
  search_term: string;
  results_count: number;
  filters: string; // dynamic filters formatted as a string
}

export interface GeneralPageParams extends BasePageParams {
  page_type: 'Home' | 'Categories' | 'Locations';
}

export type PageParams =
  | BusinessPageParams
  | CategoryPageParams
  | LocationPageParams
  | SearchPageParams
  | GeneralPageParams;

export interface AnalyticsEventParams {
  // Common dimensions structured for custom reports (Requirement 5)
  page_type?: PageType;
  business_id?: string;
  business_name?: string;
  category?: string;
  city?: string;
  province?: string;
  region?: string;
  verified?: boolean;
  featured?: boolean;
  premium?: boolean;

  // Specific action event metadata (Requirement 4 & 9)
  search_term?: string;
  results_count?: number;
  filters?: string;
  category_name?: string;
  business_count?: number;
  method?: string; // For login/signup types
  share_platform?: string; // Facebook, Twitter, Native Share, etc.
  interaction_type?: string;
  rating?: number; // review_submission rating value
  link_url?: string; // raw url clicked
  
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsProvider {
  name: string;
  initialize(measurementId?: string): void;
  trackPage(params: PageParams): void;
  trackEvent(eventName: string, params?: AnalyticsEventParams): void;
}
