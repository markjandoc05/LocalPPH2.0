import { pgTable, text, timestamp, boolean, doublePrecision, pgEnum, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';
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
  firstName: text('first_name'),
  lastName: text('last_name'),
  mobileNumber: text('mobile_number'),
  telephoneNumber: text('telephone_number'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  addressLine1: text('address_line_1'),
  addressLine2: text('address_line_2'),
  barangay: text('barangay'),
  city: text('city'),
  province: text('province'),
  region: text('region'),
  zipCode: text('zip_code'),
  country: text('country').default('Philippines'),
  accountStatus: text('account_status').default('ACTIVE').notNull(),
  lastLoginAt: timestamp('last_login_at'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  status: boolean('status').default(true).notNull(),
});

export const subcategories = pgTable('subcategories', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: boolean('status').default(true).notNull(),
});

export const regions = pgTable('regions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: boolean('status').default(true).notNull(),
});

export const provinces = pgTable('provinces', {
  id: uuid('id').defaultRandom().primaryKey(),
  regionId: uuid('region_id').references(() => regions.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: boolean('status').default(true).notNull(),
});

export const cities = pgTable('cities', {
  id: uuid('id').defaultRandom().primaryKey(),
  provinceId: uuid('province_id').references(() => provinces.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: boolean('status').default(true).notNull(),
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
  shopeeUrl: text('shopee_url'),
  lazadaUrl: text('lazada_url'),
  
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
  
  // Media and documents
  logoUrl: text('logo_url'),
  coverUrl: text('cover_url'),
  documents: text('documents'), // JSON-serialized array of documents
  gallery: text('gallery'), // JSON-serialized array of gallery images
  
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

export const businessProfileViews = pgTable('business_profile_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  visitorKey: text('visitor_key').notNull(),
  firstViewedAt: timestamp('first_viewed_at').defaultNow().notNull(),
  lastViewedAt: timestamp('last_viewed_at').defaultNow().notNull(),
}, (table) => ({
  businessIdIdx: index('business_profile_views_business_id_idx').on(table.businessId),
  uniqueBusinessVisitorIdx: uniqueIndex('business_profile_views_business_visitor_idx').on(table.businessId, table.visitorKey),
}));

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
  subcategory: one(subcategories, {
    fields: [businesses.subcategoryId],
    references: [subcategories.id],
  }),
  region: one(regions, {
    fields: [businesses.regionId],
    references: [regions.id],
  }),
  province: one(provinces, {
    fields: [businesses.provinceId],
    references: [provinces.id],
  }),
  city: one(cities, {
    fields: [businesses.cityId],
    references: [cities.id],
  }),
  photos: many(businessPhotos),
  profileViews: many(businessProfileViews),
}));

export const businessProfileViewsRelations = relations(businessProfileViews, ({ one }) => ({
  business: one(businesses, {
    fields: [businessProfileViews.businessId],
    references: [businesses.id],
  }),
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

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
