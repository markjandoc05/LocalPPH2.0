# Public Directory Flow

## Overview
The public directory provides discovery tools for platform visitors to find and explore businesses. The primary experience consists of the Homepage, Search Interface, and Business Profile pages.

## Approved-Only Visibility Rule
- **CRITICAL**: Only business listings with a `status` of `APPROVED` are ever surfaced to public interfaces.
- Pending, draft, rejected, suspended, and inactive listings are securely filtered at the data layer before reaching the UI.
- Mock implementation ensures `status === 'APPROVED'` condition is checked on every query.

## Search and Filter Behavior
- **Search Page (`/search`)**: Central hub for finding businesses.
- **Search Logic**: Combines full-text query matching (name, description, keywords, city) with specific dimensional filters (category, location, verified/featured flags).
- **State Management**: Search state is managed via URL query parameters, allowing users to share links to specific search results.
- **Client-Side vs Server-Side**: Currently uses a client-side component (`useSearchParams`) to dynamically fetch and display results.

## Pagination Behavior
- Results are paginated (12 items per page).
- Pagination parameters (`page`) are stored in the URL.
- When filters or search queries change, the pagination automatically resets to `page=1`.

## Future Subscriber-Only Detail Restriction
- During Phase 2, all business contact information (mobile, phone, email) is rendered freely on the public `PublicBusinessProfile` component.
- In future phases, these specific data fields may be conditionally gated. The component structure isolates contact details in a specific sidebar card, making it trivial to replace it with a "Login to View Contact Info" CTA for unauthenticated users if policy dictates.
