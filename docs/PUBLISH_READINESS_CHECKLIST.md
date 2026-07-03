# Publish Readiness & Quality Assurance Checklist

This document details the completed publish-readiness audit, route checks, system stabilization, configurations, and verification guidelines for **LocalPages Philippines**.

---

## 1. Build & Compilation Stability
- [x] **Linting Status**: Fully passed (`npm run lint` yields zero errors). Non-blocking warnings are kept safe.
- [x] **Type Checking**: TypeScript types resolve cleanly with no blocking compilation issues.
- [x] **Production Build**: Successfully compiled standalone production build using `next build` under Next.js (Turbopack).
- [x] **Standalone Server**: Standalone build configured and verified in `next.config.ts`.

---

## 2. Route Directory & Access Testing
All system routes have been verified for file structure integrity, layout, and client/server component constraints:

| Route Path | Description | Access Type | Role-based Redirects |
| :--- | :--- | :--- | :--- |
| `/` | Landing / Hero / Directory search | Public | None |
| `/search` | Search results, filters, map integration | Public | None |
| `/categories` | Category index | Public | None |
| `/categories/[categorySlug]` | Businesses by category slug | Public | None |
| `/locations` | Geographic regions index | Public | None |
| `/locations/[regionSlug]` | Geographic region detail (Province/City) | Public | None |
| `/locations/[regionSlug]/[provinceSlug]/[citySlug]` | Businesses listed under city | Public | None |
| `/business/[slug]` | Public Business Profile page | Public | Only APPROVED listings display |
| `/auth/login` | Log in page | Guest | Redirects if logged in |
| `/auth/register` | User/Business registration page | Guest | Redirects if logged in |
| `/auth/forgot-password` | Password recovery form | Guest | Redirects if logged in |
| `/dashboard` | Subscriber-only bookmarks & alerts | Subscriber | Redirects to login/appropriate dashboard |
| `/business` | Business listing management portal | Business / Admin | Redirects to login if unauthenticated |
| `/business/listings` | Active/Draft listings table | Business / Admin | Protected |
| `/business/listings/new` | Create listing form | Business / Admin | Protected |
| `/admin` | Admin control panel dashboard | Admin / Mod | Protected |
| `/admin/listings` | Pending business applications review | Admin / Mod | Protected |
| `/admin/users` | Platform user roles administrator | Admin / Mod | Protected |
| `/admin/system/backend-readiness` | Firebase Data Connect connection status | Admin / Mod | Protected |

---

## 3. Role-Based Authentication Flow (RBAC)
Role-Based Access Control is enforced dynamically via `src/lib/auth/AuthContext.tsx` on page loads and path changes:

### Registration & Login Behavior
- **Registering a Subscriber**: Can browse, search, bookmark, and manage their `/dashboard`. Restricted from `/admin` and `/business` management folders.
- **Registering a Business Account**: Automatically redirected to `/business` dashboard. Enforces mandatory business profile setup upon first registration.
- **Login Redirects**: Redirects to appropriate portal automatically based on user role (`/admin` for admin, `/business` for business, `/dashboard` for standard subscribers).
- **Unauthorized Guard**: Any unauthenticated access to `/admin`, `/business`, or `/dashboard` is immediately intercepted and routed back to `/auth/login`.

---

## 4. Listing Lifecycle & Business Flow
Listing submissions undergo a clear state-transition loop (Draft ➔ Pending Review ➔ Approved/Rejected/Needs Revision):

1. **Listing Creation**: Done in `/business/listings/new`. Businesses can fill name, slug, description, contact information, select category, subcategory, and region.
2. **Save as Draft**: Businesses can save incomplete profiles. Status remains in `DRAFT` and does not prompt admin notification.
3. **Submit for Approval**: Once submission is completed and submitted, the state changes to `PENDING` and triggers an administrator alert.
4. **Admin Verification Dashboard**: Located in `/admin/listings`. The item is listed inside the pending list.
5. **Approve Action**: Admin changes status to `APPROVED`. The business becomes searchable and details load successfully under `/business/[slug]`.
6. **Reject / Needs Revision**: Admin marks status to `REJECTED` or `NEEDS_REVISION`. Listings are completely hidden from the public directories, search, and maps.

---

## 5. Public Search & Directory
- **State Enforcement**: The public search engine filter only fetches and presents business listings with an `APPROVED` status.
- **Query Support**: Supports full-text keywords (`q=`), category selection (`category=`), geographic filters (`city=`), and pagination indexes.
- **No Results Handler**: Gracefully handles empty states for directories and category landing pages, encouraging local owners to submit a free listing.

---

## 6. SEO & AI Search Indexation
- **Robots.txt**: Excludes crawler access from user-specific dashboards and administration routes while encouraging indexing for public profiles, search index, and directories:
  - Allowed: `/`, `/search`, `/business/[slug]`
  - Disallowed: `/admin`, `/business`, `/dashboard`, `/auth`
- **Sitemap.xml**: Dynamically generated index of all approved business profiles to keep search engines aligned.
- **Microdata Integration**: Automatic rendering of standard **LocalBusiness** Schema JSON-LD metadata markup inside public profile pages to enable structured Rich Snippets on search engines.

---

## 7. Configuration Safety Check
- **next.config.ts**: Configured safely for standalone production containers on Cloud Run.
- **metadata.json**: Set name as `LocalPages Philippines` and descriptive meta description. Correctly declares necessary permissions.
- **Environment Example (`.env.example`)**: Completed and verified with `NEXT_PUBLIC_DATA_MODE` defaulting to `mock` for local standalone safety, and warnings declared if unconfigured.
- **Mock Fallback Warning**: If running in production with mock data enabled, a critical system banner warns administrators under the backend readiness panel.

---

## 8. Manual Testing Guidelines
To run end-to-end user journeys locally, use these accounts or scenarios:

### Test Scenario A: Listing Lifecycle
1. Access `/auth/register` and create a **Business Owner** account.
2. Complete the listing creation form at `/business/listings/new`.
3. Save as **Draft** and verify it appears on your dashboard in the draft state.
4. Open the draft, complete details, and click **Submit for Review**.
5. Log out and sign in using an **Admin** role account.
6. Navigate to `/admin/listings` and click on your pending listing.
7. Click **Approve**.
8. Navigate to `/search` or `/business/[your-slug]` to verify it displays on the public portal.

### Test Scenario B: Index & SEO Validation
1. Open `/robots.txt` in your browser and confirm `/admin` is disallowed while public search is permitted.
2. Open `/sitemap.xml` and ensure the list of dynamic approved business urls is listed cleanly.
3. Use the page inspector to verify the `<script type="application/ld+json">` tag contains valid schema attributes.
