import { pgTable, text, timestamp, boolean, doublePrecision, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const businessStatusEnum = pgEnum('business_status', [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'REVISION_REQUESTED',
  'REJECTED',
  'INACTIVE',
  'SUSPENDED'
]);

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'MODERATOR',
  'BUSINESS',
  'SUBSCRIBER'
]);

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  role: userRoleEnum('role').default('SUBSCRIBER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
});

export const subcategories = pgTable('subcategories', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const regions = pgTable('regions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const provinces = pgTable('provinces', {
  id: uuid('id').defaultRandom().primaryKey(),
  regionId: uuid('region_id').references(() => regions.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const cities = pgTable('cities', {
  id: uuid('id').defaultRandom().primaryKey(),
  provinceId: uuid('province_id').references(() => provinces.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const barangays = pgTable('barangays', {
  id: uuid('id').defaultRandom().primaryKey(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  name: text('name').notNull(),
});

export const businesses = pgTable('businesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  subcategoryId: uuid('subcategory_id').references(() => subcategories.id),
  keywords: text('keywords'),
  
  status: businessStatusEnum('status').default('DRAFT').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  
  // Contact
  contactPhone: text('contact_phone'),
  contactMobile: text('contact_mobile'),
  contactEmail: text('contact_email'),
  websiteUrl: text('website_url'),
  facebookUrl: text('facebook_url'),
  instagramUrl: text('instagram_url'),
  tiktokUrl: text('tiktok_url'),
  linkedinUrl: text('linkedin_url'),
  
  // Location
  regionId: uuid('region_id').references(() => regions.id).notNull(),
  provinceId: uuid('province_id').references(() => provinces.id).notNull(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  barangayId: uuid('barangay_id').references(() => barangays.id),
  addressLine1: text('address_line1').notNull(),
  zipCode: text('zip_code'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  googleMapsUrl: text('google_maps_url'),
  
  // Details
  businessHours: text('business_hours'),
  products: text('products'),
  services: text('services'),
  paymentMethods: text('payment_methods'),
  parkingAvailability: text('parking_availability'),
  deliveryAvailability: text('delivery_availability'),
  accessibilityOptions: text('accessibility_options'),
  
  moderatorNotes: text('moderator_notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const businessPhotos = pgTable('business_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  photoUrl: text('photo_url').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [businesses.categoryId],
    references: [categories.id],
  }),
  city: one(cities, {
    fields: [businesses.cityId],
    references: [cities.id],
  }),
  photos: many(businessPhotos),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  businesses: many(businesses),
}));

export const subcategoriesRelations = relations(subcategories, ({ one }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
}));
