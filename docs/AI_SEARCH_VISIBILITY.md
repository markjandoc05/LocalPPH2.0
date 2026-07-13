# LocalPages.ph AI Search Visibility

## Public Indexing Rules

LocalPages.ph public discovery is built around server-rendered pages that search engines and AI search crawlers can read without signing in.

- Indexable: homepage, approved business profiles, category pages, region pages, province pages, city pages, privacy policy, and terms.
- Not indexable: admin pages, authentication pages, dashboards, profile pages, support pages, business management pages, inquiry pages, private API routes, and low-value search/filter query URLs.
- Business profile pages use `getApprovedBusinessBySlug`. Listings that are draft, pending, needs revision, rejected, inactive, suspended, missing, or otherwise not approved return 404 or noindex metadata.

## Metadata Format

Approved business profiles use this title pattern:

`{Business Name} – {Category} in {City}, {Province} | LocalPages.ph`

Each approved business page also receives:

- Canonical URL under `https://localpages.ph/business/{slug}`
- Unique meta description from the business description, with a safe fallback
- Open Graph title, description, URL, and image
- Twitter/X summary large image metadata

Generic directory pages use canonical metadata through `generatePageMetadata`.

## Structured Data

Structured data is rendered in server HTML.

- Root layout emits `Organization` and `WebSite` JSON-LD.
- `WebSite` includes `SearchAction` for `/search?q={search_term_string}`.
- Business pages emit `LocalBusiness`-family JSON-LD using the closest available schema type based on category.
- Business JSON-LD includes only available values: name, description, canonical URL, logo, images, phone, email, address, geo coordinates, opening hours, category, products/services summary, map link, social/sales links, and date modified.
- Business pages also emit `BreadcrumbList`.

No fake ratings, fake reviews, fabricated hours, fabricated addresses, or raw internal IDs should be emitted.

## Sitemap Behavior

`src/app/sitemap.ts` dynamically includes:

- Homepage
- Categories index and active category pages
- Locations index and active region, province, and city pages
- Approved business profiles only
- Privacy and terms pages

The sitemap excludes:

- Admin pages
- Auth pages
- Dashboards
- Search query URLs
- Business management routes
- API routes
- Non-approved business listings

Business `lastModified` uses `updatedAt` when available.

## Robots Rules

`src/app/robots.ts` allows public crawling and points crawlers to:

`https://localpages.ph/sitemap.xml`

It disallows private and low-value routes including admin, auth, dashboard, profile, support, business management, inquiries, API routes, and search/filter query URLs.

Googlebot, Bingbot, and AI search crawlers are not specifically blocked.

## Canonical Strategy

Canonical public URLs:

- Business: `/business/{slug}`
- Category: `/categories/{categorySlug}`
- Region: `/locations/{regionSlug}`
- Province: `/locations/{regionSlug}/{provinceSlug}`
- City: `/locations/{regionSlug}/{provinceSlug}/{citySlug}`

Legacy `/directory/business/{slug}` URLs permanently redirect to `/business/{slug}`.

## Internal Linking Strategy

Important crawl paths use standard Next.js `Link` components:

- Homepage links to categories, featured businesses, recently approved businesses, and locations.
- Category pages link to approved businesses.
- City pages link to approved businesses.
- Business pages link back to their category and location pages.
- Breadcrumbs provide semantic page hierarchy.

Avoid JavaScript-only navigation for important public crawl paths.

## Approval To Indexing Flow

1. A listing is submitted by a business account.
2. Admin or moderator reviews the listing.
3. Only after status becomes `APPROVED` does the listing become publicly visible through public business services.
4. Approved listings are included in sitemap output.
5. Non-approved listings remain hidden from public pages and excluded from sitemap output.

## Search Console And Bing Setup

Manual actions:

- Add and verify `https://localpages.ph` in Google Search Console.
- Submit `https://localpages.ph/sitemap.xml`.
- Add and verify the site in Bing Webmaster Tools.
- Submit the same sitemap in Bing.
- Confirm canonical URLs and rendered HTML using URL Inspection tools.

Verification tokens can be managed in the platform integration settings or hosting configuration. Do not hard-code new verification values without the real tokens.

## IndexNow Setup

IndexNow URL submission is not automatically triggered in development. If IndexNow is added later, submit only approved business URLs after approval or meaningful updates, and avoid submitting draft or private routes.

## Manual Validation Checklist

- Open a business page source and confirm the business name, description, address, contact information, and products/services render in HTML.
- Confirm `<script type="application/ld+json">` contains valid JSON.
- Test business JSON-LD with Google Rich Results Test or Schema Markup Validator.
- Confirm canonical URLs use `https://localpages.ph`.
- Open `/sitemap.xml` and confirm approved business URLs are present.
- Confirm non-approved listings are absent from sitemap and public pages.
- Open `/robots.txt` and confirm it references `https://localpages.ph/sitemap.xml`.
- Confirm no raw UUIDs, `[object Object]`, serialized JSON descriptions, or broken placeholder content appears on public pages.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
