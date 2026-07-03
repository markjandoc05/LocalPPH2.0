# Database Schema (PostgreSQL)

This document outlines the planned PostgreSQL database schema for LocalPages.ph.

## 1. users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `display_name` (String)
- `photo_url` (String, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 2. roles
- `user_id` (UUID, Foreign Key to users)
- `role` (Enum: 'ADMIN', 'MODERATOR', 'BUSINESS', 'SUBSCRIBER')
- `assigned_at` (Timestamp)

## 3. businesses
- `id` (UUID, Primary Key)
- `owner_id` (UUID, Foreign Key to users)
- `name` (String)
- `slug` (String, Unique)
- `description` (Text)
- `category_id` (UUID, Foreign Key to categories)
- `status` (Enum: 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED')
- `contact_email` (String)
- `contact_phone` (String)
- `website_url` (String, Optional)
- `address_line1` (String)
- `barangay_id` (UUID, Foreign Key to barangays)
- `city_id` (UUID, Foreign Key to cities)
- `province_id` (UUID, Foreign Key to provinces)
- `region_id` (UUID, Foreign Key to regions)
- `latitude` (Decimal, Optional)
- `longitude` (Decimal, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 4. business_photos
- `id` (UUID, Primary Key)
- `business_id` (UUID, Foreign Key to businesses)
- `photo_url` (String)
- `is_primary` (Boolean)
- `uploaded_at` (Timestamp)

## 5. business_services
- `id` (UUID, Primary Key)
- `business_id` (UUID, Foreign Key to businesses)
- `service_name` (String)
- `description` (Text, Optional)
- `price_range` (String, Optional)

## 6. business_products
- `id` (UUID, Primary Key)
- `business_id` (UUID, Foreign Key to businesses)
- `product_name` (String)
- `description` (Text, Optional)
- `price` (Decimal, Optional)

## 7. categories
- `id` (UUID, Primary Key)
- `name` (String)
- `slug` (String, Unique)

## 8. subcategories
- `id` (UUID, Primary Key)
- `category_id` (UUID, Foreign Key to categories)
- `name` (String)
- `slug` (String, Unique)

## 9. regions
- `id` (UUID, Primary Key)
- `name` (String)
- `slug` (String, Unique)

## 10. provinces
- `id` (UUID, Primary Key)
- `region_id` (UUID, Foreign Key to regions)
- `name` (String)
- `slug` (String, Unique)

## 11. cities
- `id` (UUID, Primary Key)
- `province_id` (UUID, Foreign Key to provinces)
- `name` (String)
- `slug` (String, Unique)

## 12. barangays
- `id` (UUID, Primary Key)
- `city_id` (UUID, Foreign Key to cities)
- `name` (String)

## 13. listing_reviews
- `id` (UUID, Primary Key)
- `business_id` (UUID, Foreign Key to businesses)
- `moderator_id` (UUID, Foreign Key to users)
- `status_change` (Enum: 'APPROVED', 'REJECTED', 'REVISION_REQUESTED')
- `notes` (Text, Optional)
- `reviewed_at` (Timestamp)

## 14. activity_logs
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `action` (String)
- `entity_type` (String)
- `entity_id` (UUID)
- `created_at` (Timestamp)

## 15. saved_businesses
- `user_id` (UUID, Foreign Key to users)
- `business_id` (UUID, Foreign Key to businesses)
- `saved_at` (Timestamp)

## 16. settings
- `key` (String, Primary Key)
- `value` (JSONB)
- `updated_at` (Timestamp)
