
export type ParameterType = 'string' | 'number' | 'boolean';

export interface ParameterDefinition {
  name: string;
  dataType: ParameterType;
  description: string;
  exampleValue: string | number | boolean;
}

export interface EventDefinition {
  name: string;
  description: string;
  parameters: string[]; // references ParameterDefinition.name
  samplePayload: Record<string, unknown>;
}

export const PARAMETERS: Record<string, ParameterDefinition> = {
  page_type: { name: 'page_type', dataType: 'string', description: 'Identifies the current page type.', exampleValue: 'business' },
  business_id: { name: 'business_id', dataType: 'string', description: 'Unique Business ID', exampleValue: 'BUS-00125' },
  business_name: { name: 'business_name', dataType: 'string', description: 'Business Name', exampleValue: 'Coffee Blanc' },
  business_slug: { name: 'business_slug', dataType: 'string', description: 'Business URL Slug', exampleValue: 'coffee-blanc' },
  category: { name: 'category', dataType: 'string', description: 'Business Category', exampleValue: 'Coffee Shop' },
  city: { name: 'city', dataType: 'string', description: 'City', exampleValue: 'Makati' },
  province: { name: 'province', dataType: 'string', description: 'Province', exampleValue: 'Metro Manila' },
  region: { name: 'region', dataType: 'string', description: 'Region', exampleValue: 'NCR' },
  verified: { name: 'verified', dataType: 'boolean', description: 'Verified Listing', exampleValue: true },
  featured: { name: 'featured', dataType: 'boolean', description: 'Featured Listing', exampleValue: false },
  premium: { name: 'premium', dataType: 'boolean', description: 'Premium Listing', exampleValue: true },
  search_term: { name: 'search_term', dataType: 'string', description: 'Visitor Search Keyword', exampleValue: 'dentist' },
  results_count: { name: 'results_count', dataType: 'number', description: 'Search Results', exampleValue: 145 },
  filters: { name: 'filters', dataType: 'string', description: 'Active filters string', exampleValue: 'category:coffee' },
  category_name: { name: 'category_name', dataType: 'string', description: 'Category Name', exampleValue: 'Coffee' },
  business_count: { name: 'business_count', dataType: 'number', description: 'Business Count', exampleValue: 10 },
  method: { name: 'method', dataType: 'string', description: 'Authentication Method', exampleValue: 'google' },
  role: { name: 'role', dataType: 'string', description: 'User Role', exampleValue: 'business' },
  action_type: { name: 'action_type', dataType: 'string', description: 'Action Type', exampleValue: 'submit' },
  interaction_type: { name: 'interaction_type', dataType: 'string', description: 'Interaction Type', exampleValue: 'call' },
  contact_number: { name: 'contact_number', dataType: 'string', description: 'Contact Number', exampleValue: '09171234567' },
  link_url: { name: 'link_url', dataType: 'string', description: 'Raw URL clicked', exampleValue: 'https://example.com' },
  share_platform: { name: 'share_platform', dataType: 'string', description: 'Share Platform', exampleValue: 'facebook' },
  rating: { name: 'rating', dataType: 'number', description: 'Review Rating', exampleValue: 5 },
  review_length: { name: 'review_length', dataType: 'number', description: 'Review Length', exampleValue: 100 },
  sender_name: { name: 'sender_name', dataType: 'string', description: 'Sender Name', exampleValue: 'John Doe' },
  sender_email: { name: 'sender_email', dataType: 'string', description: 'Sender Email', exampleValue: 'john@example.com' },
};

export const EVENTS: EventDefinition[] = [
  { name: 'page_view', description: 'Triggered whenever a public page is viewed.', parameters: ['page_type', 'business_name', 'category', 'city', 'province', 'region', 'verified', 'featured', 'premium'], samplePayload: { event: 'page_view', page_type: 'Home' } },
  { name: 'view_business', description: 'Triggered whenever a visitor opens a Business Profile.', parameters: ['business_id', 'business_name', 'business_slug', 'category', 'city', 'province', 'region', 'verified', 'featured', 'premium'], samplePayload: { event: 'view_business', business_id: 'BUS001', business_name: 'Coffee Blanc' } },
  { name: 'business_call_click', description: 'Triggered when the visitor clicks the Call button.', parameters: ['business_id', 'business_name', 'city', 'category', 'contact_number'], samplePayload: { event: 'business_call_click', business_id: 'BUS001', contact_number: '09171234567' } },
  { name: 'business_email_click', description: 'Triggered when the visitor clicks the Email button.', parameters: ['business_id', 'business_name', 'city', 'category', 'link_url'], samplePayload: { event: 'business_email_click', business_id: 'BUS001', link_url: 'mailto:info@coffee.com' } },
  { name: 'business_website_click', description: 'Triggered when the visitor clicks the Website button.', parameters: ['business_id', 'business_name', 'city', 'category', 'link_url'], samplePayload: { event: 'business_website_click', business_id: 'BUS001', link_url: 'https://coffee.com' } },
  { name: 'business_facebook_click', description: 'Triggered when the visitor clicks the Facebook button.', parameters: ['business_id', 'business_name', 'city', 'category', 'link_url'], samplePayload: { event: 'business_facebook_click', business_id: 'BUS001', link_url: 'https://facebook.com/coffee' } },
  { name: 'business_instagram_click', description: 'Triggered when the visitor clicks the Instagram button.', parameters: ['business_id', 'business_name', 'city', 'category', 'link_url'], samplePayload: { event: 'business_instagram_click', business_id: 'BUS001', link_url: 'https://instagram.com/coffee' } },
  { name: 'business_messenger_click', description: 'Triggered when the visitor clicks the Messenger button.', parameters: ['business_id', 'business_name', 'city', 'category', 'link_url'], samplePayload: { event: 'business_messenger_click', business_id: 'BUS001', link_url: 'm.me/coffee' } },
  { name: 'business_directions_click', description: 'Triggered when the visitor clicks the Directions button.', parameters: ['business_id', 'business_name', 'city', 'category', 'link_url'], samplePayload: { event: 'business_directions_click', business_id: 'BUS001', link_url: 'https://maps.google.com' } },
  { name: 'share_business', description: 'Triggered when the visitor shares a business.', parameters: ['business_id', 'business_name', 'share_platform'], samplePayload: { event: 'share_business', business_id: 'BUS001', share_platform: 'facebook' } },
  { name: 'bookmark_business', description: 'Triggered when the visitor bookmarks a business.', parameters: ['business_id', 'business_name', 'interaction_type'], samplePayload: { event: 'bookmark_business', business_id: 'BUS001', interaction_type: 'add' } },
  { name: 'search', description: 'Triggered when the visitor performs a search.', parameters: ['search_term', 'results_count', 'filters'], samplePayload: { event: 'search', search_term: 'dentist', results_count: 10 } },
  { name: 'filter_search', description: 'Triggered when the visitor applies filters.', parameters: ['search_term', 'results_count', 'filters'], samplePayload: { event: 'filter_search', search_term: 'dentist', filters: 'city:Makati' } },
  { name: 'contact_business', description: 'Triggered when the visitor sends a message.', parameters: ['business_id', 'business_name', 'interaction_type', 'sender_name', 'sender_email'], samplePayload: { event: 'contact_business', business_id: 'BUS001', sender_name: 'John Doe' } },
  { name: 'review_submission', description: 'Triggered when the visitor submits a review.', parameters: ['business_id', 'business_name', 'rating', 'review_length'], samplePayload: { event: 'review_submission', business_id: 'BUS001', rating: 5 } },
  { name: 'login', description: 'Triggered when the visitor logs in.', parameters: ['method', 'page_type'], samplePayload: { event: 'login', method: 'google' } },
  { name: 'signup', description: 'Triggered when the visitor signs up.', parameters: ['method', 'role', 'page_type'], samplePayload: { event: 'signup', method: 'google', role: 'business' } },
  { name: 'register_business', description: 'Triggered when the visitor registers a business (draft).', parameters: ['business_id', 'business_name', 'category', 'city', 'province', 'region', 'action_type', 'page_type'], samplePayload: { event: 'register_business', business_id: 'BUS001', action_type: 'draft_save' } },
  { name: 'submit_listing', description: 'Triggered when the visitor submits a listing.', parameters: ['business_id', 'business_name', 'category', 'city', 'province', 'region', 'action_type', 'page_type'], samplePayload: { event: 'submit_listing', business_id: 'BUS001', action_type: 'submit' } },
  { name: 'claim_listing', description: 'Triggered when the visitor claims a listing.', parameters: ['business_id', 'business_name'], samplePayload: { event: 'claim_listing', business_id: 'BUS001' } },
];
