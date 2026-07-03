# LocalPages.ph Seed Data Guide

This guide explains how the core directory data (locations, categories) is structured and how to seed it into the database.

## Data Structure

### Locations
The location hierarchy is as follows:
- **Region**: Broad geographical area (e.g., NCR, CALABARZON).
- **Province**: Specifically for non-NCR areas (e.g., Cavite, Laguna).
- **City/Municipality**: Individual cities or towns (e.g., Manila, Makati, Cebu City).

### Categories
- **Category**: Main business category (e.g., Food & Beverage, Health & Medical).
- **Subcategory**: Specific niche within a category (e.g., Restaurants, Coffee Shops).

## Seed Files

- `src/lib/data-connect/seed/locations.ts`: Contains the list of regions, provinces, and cities.
- `src/lib/data-connect/seed/categories.ts`: Contains the list of categories and their subcategories.
- `src/lib/data-connect/seed/seeder.ts`: Contains the execution logic for seeding.

## How to Seed

### 1. Mock Mode (Default)
In mock mode, the data is automatically loaded into the `mockProvider`. You don't need to run a manual seeding process as the `mock-provider.ts` initializes with this data.

### 2. Firebase Mode
When `NEXT_PUBLIC_DATA_MODE=firebase` is enabled, you can trigger the seeder manually. 

**Option A: System Admin Page**
Navigate to `/admin/system/backend-readiness` (if implemented) or use the `seedMetadata` function from a server action.

**Example Usage:**
```typescript
import { seedMetadata } from "@/lib/data-connect/seed/seeder";

const result = await seedMetadata();
console.log(result.message);
```

## Duplicate Prevention
The seeder uses **Slugs** as the unique identifier for duplicate prevention.
- It uses the `upsert` mutation (in real mode) or a manual find-and-update (in mock mode).
- If a record with the same slug exists, it updates the name; otherwise, it creates a new record.

## Priority Locations Included
- **NCR**: Metro Manila (16 cities + 1 municipality)
- **CALABARZON**: Cavite, Laguna, Batangas, Rizal, Quezon
- **Central Luzon**: Pampanga, Bulacan, Tarlac
- **Cebu**: Cebu City, Mandaue, Lapu-Lapu
- **Davao**: Davao City
- **Bicol**: Legazpi, Naga

## Categories Included
- Food & Beverage
- Health & Medical
- Travel & Hospitality
- Wellness & Beauty
- Construction & Home
- Education
- Tech & Digital
- Automotive
- Professional Services
- Pets
