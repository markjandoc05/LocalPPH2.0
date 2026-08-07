import { pgTable, text, timestamp, boolean, doublePrecision, pgEnum, uuid, index, uniqueIndex, integer } from 'drizzle-orm/pg-core';
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
}, (table) => ({
  ownerCreatedAtIdx: index('businesses_owner_created_at_idx').on(table.ownerId, table.createdAt),
  statusCreatedAtIdx: index('businesses_status_created_at_idx').on(table.status, table.createdAt),
  categoryStatusCreatedAtIdx: index('businesses_category_status_created_at_idx').on(table.categoryId, table.status, table.createdAt),
  subcategoryStatusIdx: index('businesses_subcategory_status_idx').on(table.subcategoryId, table.status),
  regionStatusIdx: index('businesses_region_status_idx').on(table.regionId, table.status),
  provinceStatusIdx: index('businesses_province_status_idx').on(table.provinceId, table.status),
  cityStatusIdx: index('businesses_city_status_idx').on(table.cityId, table.status),
  featuredStatusCreatedAtIdx: index('businesses_featured_status_created_at_idx').on(table.isFeatured, table.status, table.createdAt),
}));

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

export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').default('OPEN').notNull(),
  adminResponse: text('admin_response'),
  respondedById: text('responded_by_id').references(() => users.id),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('support_tickets_user_id_idx').on(table.userId),
  statusIdx: index('support_tickets_status_idx').on(table.status),
  createdAtIdx: index('support_tickets_created_at_idx').on(table.createdAt),
}));

export const emailCampaigns = pgTable('email_campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  targetRoles: text('target_roles'),
  targetUserIds: text('target_user_ids'),
  fromEmail: text('from_email').default('support@localpages.ph').notNull(),
  replyToEmail: text('reply_to_email').default('support@localpages.ph').notNull(),
  intervalSeconds: integer('interval_seconds').default(0).notNull(),
  status: text('status').default('SENDING').notNull(),
  totalRecipients: integer('total_recipients').default(0).notNull(),
  sentCount: integer('sent_count').default(0).notNull(),
  failedCount: integer('failed_count').default(0).notNull(),
  openedCount: integer('opened_count').default(0).notNull(),
  createdById: text('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index('email_campaigns_created_at_idx').on(table.createdAt),
  statusIdx: index('email_campaigns_status_idx').on(table.status),
}));

export const emailCampaignRecipients = pgTable('email_campaign_recipients', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => emailCampaigns.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role'),
  status: text('status').default('PENDING').notNull(),
  smtpMessageId: text('smtp_message_id'),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at'),
  firstOpenedAt: timestamp('first_opened_at'),
  lastOpenedAt: timestamp('last_opened_at'),
  openCount: integer('open_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index('email_campaign_recipients_campaign_id_idx').on(table.campaignId),
  userIdIdx: index('email_campaign_recipients_user_id_idx').on(table.userId),
  emailIdx: index('email_campaign_recipients_email_idx').on(table.email),
}));

export const listingRevisionReminders = pgTable('listing_revision_reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
  sentById: text('sent_by_id').references(() => users.id, { onDelete: 'set null' }),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  status: text('status').default('PENDING').notNull(),
  smtpMessageId: text('smtp_message_id'),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  businessCreatedAtIdx: index('listing_revision_reminders_business_created_at_idx').on(table.businessId, table.createdAt),
  ownerCreatedAtIdx: index('listing_revision_reminders_owner_created_at_idx').on(table.ownerId, table.createdAt),
  statusIdx: index('listing_revision_reminders_status_idx').on(table.status),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  supportTickets: many(supportTickets),
  emailCampaignRecipients: many(emailCampaignRecipients),
  revisionRemindersReceived: many(listingRevisionReminders, { relationName: 'listingRevisionReminderOwner' }),
  revisionRemindersSent: many(listingRevisionReminders, { relationName: 'listingRevisionReminderSender' }),
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
  revisionReminders: many(listingRevisionReminders),
}));

export const businessProfileViewsRelations = relations(businessProfileViews, ({ one }) => ({
  business: one(businesses, {
    fields: [businessProfileViews.businessId],
    references: [businesses.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  respondedBy: one(users, {
    fields: [supportTickets.respondedById],
    references: [users.id],
  }),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [emailCampaigns.createdById],
    references: [users.id],
  }),
  recipients: many(emailCampaignRecipients),
}));

export const emailCampaignRecipientsRelations = relations(emailCampaignRecipients, ({ one }) => ({
  campaign: one(emailCampaigns, {
    fields: [emailCampaignRecipients.campaignId],
    references: [emailCampaigns.id],
  }),
  user: one(users, {
    fields: [emailCampaignRecipients.userId],
    references: [users.id],
  }),
}));

export const listingRevisionRemindersRelations = relations(listingRevisionReminders, ({ one }) => ({
  business: one(businesses, {
    fields: [listingRevisionReminders.businessId],
    references: [businesses.id],
  }),
  owner: one(users, {
    fields: [listingRevisionReminders.ownerId],
    references: [users.id],
    relationName: 'listingRevisionReminderOwner',
  }),
  sentBy: one(users, {
    fields: [listingRevisionReminders.sentById],
    references: [users.id],
    relationName: 'listingRevisionReminderSender',
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

export const backupSnapshots = pgTable('backup_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: text('label'),
  backupType: text('backup_type').default('MANUAL').notNull(),
  scope: text('scope').notNull(),
  status: text('status').default('COMPLETED').notNull(),
  recordCount: integer('record_count').default(0).notNull(),
  payload: text('payload').notNull(),
  errorMessage: text('error_message'),
  createdById: text('created_by_id').references(() => users.id),
  restoredById: text('restored_by_id').references(() => users.id),
  restoredAt: timestamp('restored_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index('backup_snapshots_created_at_idx').on(table.createdAt),
  statusIdx: index('backup_snapshots_status_idx').on(table.status),
}));

export const backupSchedules = pgTable('backup_schedules', {
  id: text('id').primaryKey(),
  enabled: boolean('enabled').default(false).notNull(),
  frequency: text('frequency').default('WEEKLY').notNull(),
  scope: text('scope').notNull(),
  timeOfDay: text('time_of_day').default('02:00').notNull(),
  lastRunAt: timestamp('last_run_at'),
  nextRunAt: timestamp('next_run_at'),
  updatedById: text('updated_by_id').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
