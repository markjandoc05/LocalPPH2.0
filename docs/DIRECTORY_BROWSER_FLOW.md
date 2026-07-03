# LocalPages.ph Directory Browser Flow

This document details the functional and architectural specification for the Directory Browser feature of **LocalPages.ph**, mapping the page routes, navigation structure, data dependencies, and SEO specifications.

---

## 1. URL & Routing Structure

The directory leverages a highly structured, hierarchical, SEO-friendly routing system:

| Route Path | Page View | SEO Canonical | Dynamic Parameters |
| :--- | :--- | :--- | :--- |
| `/categories` | Main Categories Grid | `/categories` | None |
| `/categories/[categorySlug]` | Category Detail, Subcategories list, and Business Cards | `/categories/[categorySlug]` | `categorySlug` |
| `/locations` | Regions Grid | `/locations` | None |
| `/locations/[regionSlug]` | Provinces List under Region | `/locations/[regionSlug]` | `regionSlug` |
| `/locations/[regionSlug]/[provinceSlug]` | Cities List under Province | `/locations/[regionSlug]/[provinceSlug]` | `regionSlug`, `provinceSlug` |
| `/locations/[regionSlug]/[provinceSlug]/[citySlug]` | City Detail, Category stats, and Business Cards | `/locations/[regionSlug]/[provinceSlug]/[citySlug]` | `regionSlug`, `provinceSlug`, `citySlug` |

---

## 2. Directory Browser Workflows

### A. Browse Categories Flow
1. **Discovery**: Users access `/categories` via Header, Footer, or directly from search engine queries.
2. **Category Select**: Users view categories in a modern responsive grid. Each card displays the subcategory count. Clicking "Browse" directs the user to `/categories/[categorySlug]`.
3. **Filtering & Niche Drilling**: On the category page, users can:
   - Browse specific subcategory tags (which links to the search page).
   - Filter listings by Region using the Left sidebar.
   - Navigate through multiple pages using paginated buttons.

### B. Browse Locations Flow
1. **Region Navigation**: Users access `/locations` displaying all main geographical regions of the Philippines.
2. **Province Navigation**: Clicking a Region links to `/locations/[regionSlug]`, which displays a breakdown of registered provinces under that region.
3. **City/Municipality Navigation**: Clicking a Province displays `/locations/[regionSlug]/[provinceSlug]`, showing all municipalities.
4. **Local Business Listing**: Selecting a City opens `/locations/[regionSlug]/[provinceSlug]/[citySlug]`. Here, residents see:
   - Popular categories in their city (redirecting to search with matched queries).
   - Approved, verified business profiles based in that city.

---

## 3. Data Service & Backend Dependencies

The frontend page components consume methods defined in `src/lib/data-connect/directory-service.ts`. These proxy to the standard `DataProvider` interface, adapting seamlessly to both Mock and Firebase-backed deployments.

### Main Functions
- **`getAllCategories()`**: Retrieves a list of all categories with subcategory counts.
- **`getCategoryBySlug(slug)`**: Matches a category record by its slug.
- **`getSubcategoriesByCategory(categoryId)`**: Resolves subcategory tags belonging to a parent category.
- **`getAllRegions()`**: Lists all regions.
- **`getRegionBySlug(slug)`**: Resolves a region record by its slug.
- **`getProvincesByRegion(regionId)`**: Resolves provinces belonging to a region.
- **`getProvinceBySlug(slug)`**: Resolves a province record by its slug.
- **`getCitiesByProvince(provinceId)`**: Resolves cities/municipalities in a province.
- **`getCityBySlug(slug)`**: Resolves a city record by its slug.
- **`getApprovedBusinessesByCategory(categoryId, pagination)`**: Queries the server for verified business listings under a specified category.
- **`getApprovedBusinessesByCity(cityId, pagination)`**: Queries the server for verified business listings operating in a specific city.

---

## 4. Search Engine Optimization (SEO) Specifications

Every directory page is dynamically pre-rendered and includes:
1. **Dynamic Metadata**: Customized page titles, keyword descriptions, and structured metadata.
2. **Canonical Tags**: Prevents duplicate content issues (such as with pagination queries).
3. **Crawlable Breadcrumbs**: Implements highly structured `LocationBreadcrumbs.tsx` using semantic, self-pointing elements.
4. **SEO Schema (Next.js alternations)**: Configures rich previews for OpenGraph and Twitter cards.
