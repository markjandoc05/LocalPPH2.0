import { DataProvider } from "./types";
import { db } from "../../db/index";
import { 
  users, 
  businesses, 
  categories, 
  subcategories, 
  regions, 
  provinces, 
  cities, 
  barangays,
  supportTickets,
  businessPhotos,
  businessProfileViews,
  siteSettings,
  backupSnapshots,
  backupSchedules,
} from "../../db/schema";
import { eq, and, or, ilike, sql, desc, asc, inArray } from "drizzle-orm";
import { BusinessListing } from "@/types/business";
import { formatAppDateTime } from "@/lib/time";

const businessInquiryCategory = 'BUSINESS_INQUIRY';
const businessInquiryPrefix = 'LOCALPAGES_BUSINESS_INQUIRY::';
const businessInquiryThreadPrefix = 'LOCALPAGES_INQUIRY_THREAD::';

const parseBusinessInquiryMessage = (message?: string | null) => {
  if (!message?.startsWith(businessInquiryPrefix)) return null;

  try {
    return JSON.parse(message.slice(businessInquiryPrefix.length));
  } catch (error) {
    console.error("Error parsing business inquiry metadata:", error);
    return null;
  }
};

const parseBusinessInquiryThread = (response?: string | null) => {
  if (!response) return [];
  if (!response.startsWith(businessInquiryThreadPrefix)) {
    return [{
      id: 'legacy-owner-response',
      sender: 'owner',
      body: response,
      createdAt: null,
    }];
  }

  try {
    const parsed = JSON.parse(response.slice(businessInquiryThreadPrefix.length));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing business inquiry thread:", error);
    return [];
  }
};

const serializeBusinessInquiryThread = (messages: any[]) =>
  `${businessInquiryThreadPrefix}${JSON.stringify(messages)}`;

const getBusinessInquiryTime = (value?: string | Date | null) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const formatBusinessInquiry = (ticket: any) => {
  if (!ticket) return null;
  const details = parseBusinessInquiryMessage(ticket.message);
  if (!details) return null;
  const threadMessages = parseBusinessInquiryThread(ticket.adminResponse);
  const initialMessage = {
    id: `${ticket.id}-initial`,
    sender: 'user',
    body: details.message || '',
    createdAt: ticket.createdAt,
  };
  const visibleMessages = [initialMessage, ...threadMessages].filter((message) =>
    message.sender === 'user' || message.sender === 'owner'
  );
  const latestMessageTime = Math.max(...visibleMessages.map((message) => getBusinessInquiryTime(message.createdAt)));
  const latestSenderDeleteTime = Math.max(
    0,
    ...threadMessages
      .filter((message) => message.type === 'inbox_deleted' && message.side === 'sender')
      .map((message) => getBusinessInquiryTime(message.createdAt))
  );
  const latestOwnerDeleteTime = Math.max(
    0,
    ...threadMessages
      .filter((message) => message.type === 'inbox_deleted' && message.side === 'owner')
      .map((message) => getBusinessInquiryTime(message.createdAt))
  );
  const latestSenderReadTime = Math.max(
    0,
    ...threadMessages
      .filter((message) => message.type === 'inbox_read' && message.side === 'sender')
      .map((message) => getBusinessInquiryTime(message.createdAt))
  );
  const latestOwnerReadTime = Math.max(
    0,
    ...threadMessages
      .filter((message) => message.type === 'inbox_read' && message.side === 'owner')
      .map((message) => getBusinessInquiryTime(message.createdAt))
  );
  const latestSenderMessageTime = Math.max(
    0,
    ...visibleMessages
      .filter((message) => message.sender === 'user')
      .map((message) => getBusinessInquiryTime(message.createdAt))
  );
  const latestOwnerMessageTime = Math.max(
    0,
    ...visibleMessages
      .filter((message) => message.sender === 'owner')
      .map((message) => getBusinessInquiryTime(message.createdAt))
  );

  return {
    id: ticket.id,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    businessId: details.businessId,
    businessName: details.businessName,
    businessSlug: details.businessSlug,
    ownerId: details.ownerId,
    subject: details.subject || ticket.subject || 'Business inquiry',
    senderName: details.senderName || ticket.user?.displayName || '',
    senderEmail: details.senderEmail || ticket.user?.email || '',
    senderContactNumber: details.senderContactNumber || '',
    message: details.message || '',
    response: ticket.adminResponse || '',
    respondedAt: ticket.respondedAt,
    messages: visibleMessages,
    deletedForSender: latestSenderDeleteTime >= latestMessageTime,
    deletedForOwner: latestOwnerDeleteTime >= latestMessageTime,
    unreadForSender: latestOwnerMessageTime > latestSenderReadTime,
    unreadForOwner: latestSenderMessageTime > latestOwnerReadTime,
    sender: ticket.user || null,
  };
};

const formatBusinessRow = (b: any): BusinessListing => {
  if (!b) return b;
  let parsedDocuments = [];
  if (b.documents) {
    try {
      parsedDocuments = typeof b.documents === 'string' ? JSON.parse(b.documents) : b.documents;
    } catch (e) {
      console.error("Error parsing business documents JSON:", e);
    }
  }
  let parsedGallery = [];
  if (b.gallery) {
    try {
      parsedGallery = typeof b.gallery === 'string' ? JSON.parse(b.gallery) : b.gallery;
    } catch (e) {
      console.error("Error parsing business gallery JSON:", e);
    }
  }
  return {
    ...b,
    ownerName: b.owner?.displayName || b.owner?.email || "Not assigned",
    categoryName: b.category?.name || "Not assigned",
    categorySlug: b.category?.slug || undefined,
    subcategoryName: b.subcategory?.name || "Not assigned",
    subcategorySlug: b.subcategory?.slug || undefined,
    cityName: b.city?.name || "Not assigned",
    citySlug: b.city?.slug || undefined,
    provinceName: b.province?.name || "Not assigned",
    provinceSlug: b.province?.slug || undefined,
    regionName: b.region?.name || "Not assigned",
    regionSlug: b.region?.slug || undefined,
    documents: parsedDocuments,
    gallery: parsedGallery,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : (b.createdAt || new Date().toISOString()),
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : (b.updatedAt || new Date().toISOString()),
  } as unknown as BusinessListing;
};

const allowedBusinessWriteColumns = [
  'id', 'ownerId', 'categoryId', 'subcategoryId', 'regionId', 'provinceId', 'cityId', 'barangayId',
  'name', 'slug', 'description', 'addressLine1', 'zipCode',
  'contactPhone', 'contactMobile', 'contactEmail',
  'websiteUrl', 'googleMapsUrl', 'businessHours', 'products', 'services',
  'paymentMethods', 'parkingAvailability', 'deliveryAvailability', 'accessibilityOptions',
  'logoUrl', 'coverUrl', 'gallery', 'documents',
  'facebookUrl', 'instagramUrl', 'linkedinUrl', 'tiktokUrl', 'shopeeUrl', 'lazadaUrl',
  'status', 'isFeatured', 'keywords', 'moderatorNotes'
];

const nullableUuidColumns = new Set(['subcategoryId', 'barangayId']);

const prepareBusinessWriteData = (data: any) => {
  const prepared: any = {};

  for (const key of allowedBusinessWriteColumns) {
    if (!(key in data)) continue;

    if (nullableUuidColumns.has(key) && data[key] === '') {
      prepared[key] = null;
    } else {
      prepared[key] = data[key];
    }
  }

  if (prepared.documents !== undefined) {
    prepared.documents = prepared.documents ? (typeof prepared.documents === 'string' ? prepared.documents : JSON.stringify(prepared.documents)) : null;
  }
  if (prepared.gallery !== undefined) {
    prepared.gallery = prepared.gallery ? (typeof prepared.gallery === 'string' ? prepared.gallery : JSON.stringify(prepared.gallery)) : null;
  }

  return prepared;
};

const isMissingSupportTicketsTableError = (error: any) => {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('support_tickets') && (
    message.includes('does not exist') ||
    message.includes('relation') ||
    message.includes('failed query')
  );
};

const BACKUP_SCOPE_OPTIONS = ['ALL', 'USERS', 'BUSINESSES', 'DIRECTORY', 'SUPPORT', 'SETTINGS'] as const;
type BackupScope = typeof BACKUP_SCOPE_OPTIONS[number];

const backupGroups: Record<Exclude<BackupScope, 'ALL'>, { key: string; table: any; conflictTarget: any; dateFields: string[] }[]> = {
  USERS: [
    { key: 'users', table: users, conflictTarget: users.id, dateFields: ['lastLoginAt', 'createdAt', 'updatedAt'] },
  ],
  BUSINESSES: [
    { key: 'businesses', table: businesses, conflictTarget: businesses.id, dateFields: ['createdAt', 'updatedAt'] },
    { key: 'businessPhotos', table: businessPhotos, conflictTarget: businessPhotos.id, dateFields: ['uploadedAt'] },
    { key: 'businessProfileViews', table: businessProfileViews, conflictTarget: businessProfileViews.id, dateFields: ['firstViewedAt', 'lastViewedAt'] },
  ],
  DIRECTORY: [
    { key: 'categories', table: categories, conflictTarget: categories.id, dateFields: [] },
    { key: 'subcategories', table: subcategories, conflictTarget: subcategories.id, dateFields: [] },
    { key: 'regions', table: regions, conflictTarget: regions.id, dateFields: [] },
    { key: 'provinces', table: provinces, conflictTarget: provinces.id, dateFields: [] },
    { key: 'cities', table: cities, conflictTarget: cities.id, dateFields: [] },
    { key: 'barangays', table: barangays, conflictTarget: barangays.id, dateFields: [] },
  ],
  SUPPORT: [
    { key: 'supportTickets', table: supportTickets, conflictTarget: supportTickets.id, dateFields: ['respondedAt', 'createdAt', 'updatedAt'] },
  ],
  SETTINGS: [
    { key: 'siteSettings', table: siteSettings, conflictTarget: siteSettings.key, dateFields: ['updatedAt'] },
  ],
};

const normalizeBackupScope = (scope?: string[]) => {
  const selected = (scope && scope.length > 0 ? scope : ['ALL'])
    .map((item) => String(item).toUpperCase())
    .filter((item): item is BackupScope => BACKUP_SCOPE_OPTIONS.includes(item as BackupScope));

  if (selected.length === 0 || selected.includes('ALL')) {
    return ['USERS', 'DIRECTORY', 'BUSINESSES', 'SUPPORT', 'SETTINGS'] as Exclude<BackupScope, 'ALL'>[];
  }

  return Array.from(new Set(selected)) as Exclude<BackupScope, 'ALL'>[];
};

const parseJsonArray = (value: string | null | undefined) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isMissingBackupTablesError = (error: any) => {
  const raw = `${error?.message || ''} ${error?.cause?.message || ''} ${error?.query || ''} ${error || ''}`;
  const message = raw.toLowerCase();
  return (message.includes('backup_snapshots') || message.includes('backupsnapshots') || message.includes('backup_schedules') || message.includes('backupschedules') || message.includes('backup snapshots') || message.includes('backup schedules')) && (
    message.includes('does not exist') ||
    message.includes('relation') ||
    message.includes('failed query')
  );
};

const backupSetupErrorMessage = "Backup setup is not complete yet. Please apply the backup recovery database migration.";

const collectBackupPayload = async (scope: Exclude<BackupScope, 'ALL'>[]) => {
  const payload: Record<string, any[]> = {};
  let recordCount = 0;

  for (const scopeItem of scope) {
    for (const item of backupGroups[scopeItem]) {
      const rows = await db.select().from(item.table);
      payload[item.key] = rows;
      recordCount += rows.length;
    }
  }

  return { payload, recordCount };
};

const reviveDateFields = (row: any, fields: string[]) => {
  const next = { ...row };
  for (const field of fields) {
    if (next[field]) {
      next[field] = new Date(next[field]);
    }
  }
  return next;
};

const restoreRows = async (tx: any, item: { table: any; conflictTarget: any; dateFields: string[] }, rows: any[]) => {
  if (!Array.isArray(rows) || rows.length === 0) return 0;

  let restored = 0;
  for (const row of rows) {
    const values = reviveDateFields(row, item.dateFields);
    const setValues = { ...values };
    delete setValues.id;
    delete setValues.key;

    await tx.insert(item.table)
      .values(values)
      .onConflictDoUpdate({
        target: item.conflictTarget,
        set: setValues,
      });
    restored += 1;
  }

  return restored;
};

const calculateNextBackupRun = (frequency: string, timeOfDay: string, fromDate = new Date()) => {
  const [hourRaw, minuteRaw] = String(timeOfDay || '02:00').split(':');
  const hour = Number(hourRaw) || 2;
  const minute = Number(minuteRaw) || 0;
  const next = new Date(fromDate);
  next.setHours(hour, minute, 0, 0);

  if (next <= fromDate) {
    if (frequency === 'DAILY') {
      next.setDate(next.getDate() + 1);
    } else if (frequency === 'MONTHLY') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
  }

  return next;
};

const mapBackupSnapshot = (snapshot: any) => ({
  ...snapshot,
  scope: parseJsonArray(snapshot.scope),
  createdAt: snapshot.createdAt instanceof Date ? snapshot.createdAt.toISOString() : snapshot.createdAt,
  updatedAt: snapshot.updatedAt instanceof Date ? snapshot.updatedAt.toISOString() : snapshot.updatedAt,
  restoredAt: snapshot.restoredAt instanceof Date ? snapshot.restoredAt.toISOString() : snapshot.restoredAt,
});

const mapBackupSchedule = (schedule: any) => schedule ? {
  ...schedule,
  scope: parseJsonArray(schedule.scope),
  lastRunAt: schedule.lastRunAt instanceof Date ? schedule.lastRunAt.toISOString() : schedule.lastRunAt,
  nextRunAt: schedule.nextRunAt instanceof Date ? schedule.nextRunAt.toISOString() : schedule.nextRunAt,
  updatedAt: schedule.updatedAt instanceof Date ? schedule.updatedAt.toISOString() : schedule.updatedAt,
} : {
  id: 'default',
  enabled: false,
  frequency: 'WEEKLY',
  scope: ['ALL'],
  timeOfDay: '02:00',
  lastRunAt: null,
  nextRunAt: null,
};

export const databaseProvider: DataProvider = {
  async createUser(variables) {
    const res = await db.insert(users)
      .values({
        id: variables.id,
        email: variables.email,
        displayName: variables.displayName,
        photoUrl: variables.photoUrl,
        role: variables.role as any,
        emailVerified: Boolean(variables.emailVerified),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: variables.email,
          displayName: variables.displayName,
          photoUrl: variables.photoUrl,
          emailVerified: Boolean(variables.emailVerified),
          updatedAt: new Date(),
        }
      })
      .returning({ id: users.id });
    
    return { data: { user_insert: res[0].id } };
  },

  async getUserById(variables) {
    const res = await db.query.users.findFirst({
      where: eq(users.id, variables.id),
    });
    return { data: { user: res || null } };
  },

  async updateUser(variables) {
    try {
      const data = variables.data;
      const setFields: any = {
        updatedAt: new Date(),
      };
      
      const allowedFields = [
        'firstName', 'lastName', 'displayName', 'photoUrl', 'mobileNumber',
        'telephoneNumber', 'dateOfBirth', 'gender', 'addressLine1',
        'addressLine2', 'barangay', 'city', 'province', 'region',
        'zipCode', 'country', 'emailVerified'
      ];
      
      for (const field of allowedFields) {
        if (field in data) {
          setFields[field] = data[field];
        }
      }

      console.log("Updating user:", variables.id, "Set fields:", setFields);
      const res = await db.update(users)
        .set(setFields)
        .where(eq(users.id, variables.id))
        .returning({ id: users.id });
      
      return {
        data: { user_update: res[0]?.id || variables.id },
      };
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  },

  async updateUserAccountStatus(variables) {
    const allowedStatuses = ['ACTIVE', 'BANNED', 'DELETED'];
    const nextStatus = String(variables.accountStatus || '').toUpperCase();

    if (!allowedStatuses.includes(nextStatus)) {
      throw new Error("Invalid account status.");
    }

    const res = await db.update(users)
      .set({
        accountStatus: nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, variables.id))
      .returning({ id: users.id });

    return {
      data: { user_update: res[0]?.id || variables.id },
    };
  },

  async updateUserRole(variables) {
    const nextRole = String(variables.role || '').toUpperCase();

    if (nextRole !== 'BUSINESS') {
      throw new Error("Only Business account upgrades are supported from User Management.");
    }

    const res = await db.update(users)
      .set({
        role: nextRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, variables.id))
      .returning({ id: users.id });

    return {
      data: { user_update: res[0]?.id || variables.id },
    };
  },

  async deleteUserAccount(variables) {
    const targetUserId = variables.id;
    if (!targetUserId) {
      throw new Error("User ID is required.");
    }

    try {
      await db.update(backupSnapshots)
        .set({
          createdById: sql`case when ${backupSnapshots.createdById} = ${targetUserId} then null else ${backupSnapshots.createdById} end`,
          restoredById: sql`case when ${backupSnapshots.restoredById} = ${targetUserId} then null else ${backupSnapshots.restoredById} end`,
          updatedAt: new Date(),
        })
        .where(or(eq(backupSnapshots.createdById, targetUserId), eq(backupSnapshots.restoredById, targetUserId)) as any);

      await db.update(backupSchedules)
        .set({
          updatedById: null,
          updatedAt: new Date(),
        })
        .where(eq(backupSchedules.updatedById, targetUserId));
    } catch (error) {
      if (!isMissingBackupTablesError(error)) {
        throw error;
      }
    }

    return db.transaction(async (tx) => {
      const ownedBusinesses = await tx.select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.ownerId, targetUserId));
      const ownedBusinessIds = ownedBusinesses.map((business) => business.id);

      await tx.delete(supportTickets)
        .where(eq(supportTickets.userId, targetUserId));

      await tx.update(supportTickets)
        .set({
          respondedById: null,
          updatedAt: new Date(),
        })
        .where(eq(supportTickets.respondedById, targetUserId));

      if (ownedBusinessIds.length > 0) {
        await tx.delete(businessProfileViews)
          .where(inArray(businessProfileViews.businessId, ownedBusinessIds));

        await tx.delete(businessPhotos)
          .where(inArray(businessPhotos.businessId, ownedBusinessIds));

        await tx.delete(businesses)
          .where(eq(businesses.ownerId, targetUserId));
      }

      const deletedUsers = await tx.delete(users)
        .where(eq(users.id, targetUserId))
        .returning({ id: users.id });

      if (!deletedUsers[0]?.id) {
        throw new Error("User account not found.");
      }

      return {
        data: {
          user_delete: deletedUsers[0].id,
          deletedBusinesses: ownedBusinessIds.length,
        },
      };
    });
  },

  async getAllUsers() {
    const res = await db.query.users.findMany();
    return { data: { users: res } };
  },

  async createSupportTicket(variables) {
    const category = variables.category?.trim();
    const subject = variables.subject?.trim();
    const message = variables.message?.trim();

    if (!category || !subject || !message) {
      throw new Error("Category, subject, and message are required.");
    }

    let res;
    try {
      res = await db.insert(supportTickets)
        .values({
          userId: variables.userId,
          category,
          subject,
          message,
        })
        .returning({ id: supportTickets.id });
    } catch (error) {
      if (isMissingSupportTicketsTableError(error)) {
        throw new Error("Support inbox setup is not complete yet. Please apply the support_tickets database migration.");
      }
      throw error;
    }

    return { data: { support_ticket_insert: res[0].id } };
  },

  async getMySupportTickets(variables) {
    let res;
    try {
      res = await db.query.supportTickets.findMany({
        where: and(
          eq(supportTickets.userId, variables.userId),
          sql`${supportTickets.category} <> ${businessInquiryCategory}`,
        ),
        orderBy: [desc(supportTickets.createdAt)],
      });
    } catch (error) {
      if (isMissingSupportTicketsTableError(error)) {
        return { data: { supportTickets: [] } };
      }
      throw error;
    }

    return { data: { supportTickets: res } };
  },

  async getAllSupportTickets() {
    let res;
    try {
      res = await db.query.supportTickets.findMany({
        where: sql`${supportTickets.category} <> ${businessInquiryCategory}`,
        with: {
          user: true,
          respondedBy: true,
        },
        orderBy: [desc(supportTickets.createdAt)],
      });
    } catch (error) {
      if (isMissingSupportTicketsTableError(error)) {
        return { data: { supportTickets: [] } };
      }
      throw error;
    }

    return { data: { supportTickets: res } };
  },

  async updateSupportTicket(variables) {
    const allowedStatuses = new Set(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']);
    const setFields: any = {
      updatedAt: new Date(),
    };

    if (variables.status) {
      if (!allowedStatuses.has(variables.status)) {
        throw new Error("Invalid support ticket status.");
      }
      setFields.status = variables.status;
    }

    if (variables.adminResponse !== undefined) {
      setFields.adminResponse = variables.adminResponse?.trim() || null;
      setFields.respondedById = variables.respondedById || null;
      setFields.respondedAt = setFields.adminResponse ? new Date() : null;
    }

    const res = await db.update(supportTickets)
      .set(setFields)
      .where(eq(supportTickets.id, variables.id))
      .returning({ id: supportTickets.id });

    return { data: { support_ticket_update: res[0]?.id || variables.id } };
  },

  async getMyBusinessInquiries(variables) {
    const ownerId = variables.ownerId;
    if (!ownerId) {
      throw new Error("Business owner is required.");
    }

    let res;
    try {
      res = await db.query.supportTickets.findMany({
        where: eq(supportTickets.category, businessInquiryCategory),
        with: {
          user: true,
        },
        orderBy: [desc(supportTickets.createdAt)],
      });
    } catch (error) {
      if (isMissingSupportTicketsTableError(error)) {
        return { data: { inquiries: [] } };
      }
      throw error;
    }

    const inquiries = res
      .map(formatBusinessInquiry)
      .filter((inquiry) => inquiry?.ownerId === ownerId && !inquiry.deletedForOwner);

    return { data: { inquiries } };
  },

  async respondBusinessInquiry(variables) {
    const response = variables.response?.trim();
    if (!response) {
      throw new Error("Response message is required.");
    }

    const ticket = await db.query.supportTickets.findFirst({
      where: and(
        eq(supportTickets.id, variables.id),
        eq(supportTickets.category, businessInquiryCategory),
      ),
    });
    const inquiry = formatBusinessInquiry(ticket);

    if (!ticket || !inquiry || inquiry.ownerId !== variables.ownerId) {
      throw new Error("Inquiry not found or access denied.");
    }

    const existingThread = parseBusinessInquiryThread(ticket.adminResponse);
    const nextThread = [
      ...existingThread,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sender: 'owner',
        body: response,
        createdAt: new Date().toISOString(),
      },
    ];

    const res = await db.update(supportTickets)
      .set({
        adminResponse: serializeBusinessInquiryThread(nextThread),
        respondedById: variables.ownerId,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, variables.id))
      .returning({ id: supportTickets.id });

    return { data: { inquiry_update: res[0]?.id || variables.id } };
  },

  async markBusinessInquiryRead(variables) {
    const ticket = await db.query.supportTickets.findFirst({
      where: and(
        eq(supportTickets.id, variables.id),
        eq(supportTickets.category, businessInquiryCategory),
      ),
    });
    const inquiry = formatBusinessInquiry(ticket);

    if (!ticket || !inquiry || inquiry.ownerId !== variables.ownerId) {
      throw new Error("Inquiry not found or access denied.");
    }

    const existingThread = parseBusinessInquiryThread(ticket.adminResponse);
    const nextThread = [
      ...existingThread,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'inbox_read',
        side: 'owner',
        userId: variables.ownerId,
        createdAt: new Date().toISOString(),
      },
    ];

    const res = await db.update(supportTickets)
      .set({
        adminResponse: serializeBusinessInquiryThread(nextThread),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, variables.id))
      .returning({ id: supportTickets.id });

    return { data: { inquiry_update: res[0]?.id || variables.id } };
  },

  async deleteBusinessInquiry(variables) {
    const ticket = await db.query.supportTickets.findFirst({
      where: and(
        eq(supportTickets.id, variables.id),
        eq(supportTickets.category, businessInquiryCategory),
      ),
    });
    const inquiry = formatBusinessInquiry(ticket);

    if (!ticket || !inquiry || inquiry.ownerId !== variables.ownerId) {
      throw new Error("Inquiry not found or access denied.");
    }

    const existingThread = parseBusinessInquiryThread(ticket.adminResponse);
    const nextThread = [
      ...existingThread,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'inbox_deleted',
        side: 'owner',
        userId: variables.ownerId,
        createdAt: new Date().toISOString(),
      },
    ];

    const res = await db.update(supportTickets)
      .set({
        adminResponse: serializeBusinessInquiryThread(nextThread),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, variables.id))
      .returning({ id: supportTickets.id });

    return { data: { inquiry_delete: res[0]?.id || variables.id } };
  },

  async getMySentBusinessInquiries(variables) {
    let res;
    try {
      res = await db.query.supportTickets.findMany({
        where: and(
          eq(supportTickets.userId, variables.userId),
          eq(supportTickets.category, businessInquiryCategory),
        ),
        orderBy: [desc(supportTickets.createdAt)],
      });
    } catch (error) {
      if (isMissingSupportTicketsTableError(error)) {
        return { data: { inquiries: [] } };
      }
      throw error;
    }

    const inquiries = res
      .map(formatBusinessInquiry)
      .filter((inquiry) => inquiry && !inquiry.deletedForSender);

    return { data: { inquiries } };
  },

  async deleteMyBusinessInquiry(variables) {
    const ticket = await db.query.supportTickets.findFirst({
      where: and(
        eq(supportTickets.id, variables.id),
        eq(supportTickets.userId, variables.userId),
        eq(supportTickets.category, businessInquiryCategory),
      ),
    });

    if (!ticket) {
      throw new Error("Inquiry not found or access denied.");
    }

    const existingThread = parseBusinessInquiryThread(ticket.adminResponse);
    const nextThread = [
      ...existingThread,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'inbox_deleted',
        side: 'sender',
        userId: variables.userId,
        createdAt: new Date().toISOString(),
      },
    ];

    const res = await db.update(supportTickets)
      .set({
        adminResponse: serializeBusinessInquiryThread(nextThread),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, variables.id))
      .returning({ id: supportTickets.id });

    return { data: { inquiry_delete: res[0]?.id || variables.id } };
  },

  async markMyBusinessInquiryRead(variables) {
    const ticket = await db.query.supportTickets.findFirst({
      where: and(
        eq(supportTickets.id, variables.id),
        eq(supportTickets.userId, variables.userId),
        eq(supportTickets.category, businessInquiryCategory),
      ),
    });

    if (!ticket) {
      throw new Error("Inquiry not found or access denied.");
    }

    const existingThread = parseBusinessInquiryThread(ticket.adminResponse);
    const nextThread = [
      ...existingThread,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'inbox_read',
        side: 'sender',
        userId: variables.userId,
        createdAt: new Date().toISOString(),
      },
    ];

    const res = await db.update(supportTickets)
      .set({
        adminResponse: serializeBusinessInquiryThread(nextThread),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, variables.id))
      .returning({ id: supportTickets.id });

    return { data: { inquiry_update: res[0]?.id || variables.id } };
  },

  async replyMyBusinessInquiry(variables) {
    const response = variables.response?.trim();
    if (!response) {
      throw new Error("Message is required.");
    }

    const ticket = await db.query.supportTickets.findFirst({
      where: and(
        eq(supportTickets.id, variables.id),
        eq(supportTickets.userId, variables.userId),
        eq(supportTickets.category, businessInquiryCategory),
      ),
    });

    if (!ticket) {
      throw new Error("Inquiry not found or access denied.");
    }

    const existingThread = parseBusinessInquiryThread(ticket.adminResponse);
    const nextThread = [
      ...existingThread,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sender: 'user',
        body: response,
        createdAt: new Date().toISOString(),
      },
    ];

    const res = await db.update(supportTickets)
      .set({
        adminResponse: serializeBusinessInquiryThread(nextThread),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, variables.id))
      .returning({ id: supportTickets.id });

    return { data: { inquiry_update: res[0]?.id || variables.id } };
  },

  async createBackupSnapshot(variables) {
    const scope = normalizeBackupScope(variables?.scope);
    const label = variables?.label?.trim() || null;
    const backupType = variables?.backupType === 'SCHEDULED' ? 'SCHEDULED' : 'MANUAL';

    try {
      const { payload, recordCount } = await collectBackupPayload(scope);
      const res = await db.insert(backupSnapshots)
        .values({
          label,
          backupType,
          scope: JSON.stringify(scope),
          status: 'COMPLETED',
          recordCount,
          payload: JSON.stringify(payload),
          createdById: variables?.createdById || null,
        })
        .returning({ id: backupSnapshots.id });

      return { data: { backup_snapshot_insert: res[0].id } };
    } catch (error) {
      if (isMissingBackupTablesError(error)) {
        throw new Error(backupSetupErrorMessage);
      }
      throw error;
    }
  },

  async getBackupSnapshots() {
    try {
      const res = await db.select({
        id: backupSnapshots.id,
        label: backupSnapshots.label,
        backupType: backupSnapshots.backupType,
        scope: backupSnapshots.scope,
        status: backupSnapshots.status,
        recordCount: backupSnapshots.recordCount,
        errorMessage: backupSnapshots.errorMessage,
        createdById: backupSnapshots.createdById,
        restoredById: backupSnapshots.restoredById,
        restoredAt: backupSnapshots.restoredAt,
        createdAt: backupSnapshots.createdAt,
        updatedAt: backupSnapshots.updatedAt,
      })
        .from(backupSnapshots)
        .orderBy(desc(backupSnapshots.createdAt));

      return { data: { backupSnapshots: res.map(mapBackupSnapshot) } };
    } catch (error) {
      if (isMissingBackupTablesError(error)) {
        return { data: { backupSnapshots: [] } };
      }
      throw error;
    }
  },

  async restoreBackupSnapshot(variables) {
    try {
      const scopeOverride = variables?.scope?.length ? normalizeBackupScope(variables.scope) : null;
      const snapshot = await db.query.backupSnapshots.findFirst({
        where: eq(backupSnapshots.id, variables.id),
      });

      if (!snapshot) {
        throw new Error("Backup snapshot not found.");
      }

      const payload = JSON.parse(snapshot.payload || '{}');
      const scope = scopeOverride || normalizeBackupScope(parseJsonArray(snapshot.scope));
      let restoredCount = 0;

      await db.transaction(async (tx) => {
        for (const scopeItem of scope) {
          for (const item of backupGroups[scopeItem]) {
            restoredCount += await restoreRows(tx, item, payload[item.key] || []);
          }
        }

        await tx.update(backupSnapshots)
          .set({
            status: 'RESTORED',
            restoredById: variables?.restoredById || null,
            restoredAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(backupSnapshots.id, variables.id));
      });

      return { data: { backup_snapshot_restore: variables.id, restoredCount } };
    } catch (error) {
      if (isMissingBackupTablesError(error)) {
        throw new Error(backupSetupErrorMessage);
      }
      throw error;
    }
  },

  async deleteBackupSnapshot(variables) {
    try {
      const res = await db.delete(backupSnapshots)
        .where(eq(backupSnapshots.id, variables.id))
        .returning({ id: backupSnapshots.id });

      return { data: { backup_snapshot_delete: res[0]?.id || variables.id } };
    } catch (error) {
      if (isMissingBackupTablesError(error)) {
        throw new Error(backupSetupErrorMessage);
      }
      throw error;
    }
  },

  async getBackupSchedule() {
    try {
      const schedule = await db.query.backupSchedules.findFirst({
        where: eq(backupSchedules.id, 'default'),
      });

      return { data: { backupSchedule: mapBackupSchedule(schedule) } };
    } catch (error) {
      if (isMissingBackupTablesError(error)) {
        return { data: { backupSchedule: mapBackupSchedule(null) } };
      }
      throw error;
    }
  },

  async updateBackupSchedule(variables) {
    try {
      const frequency = ['DAILY', 'WEEKLY', 'MONTHLY'].includes(variables.frequency) ? variables.frequency : 'WEEKLY';
      const scope = normalizeBackupScope(variables.scope);
      const timeOfDay = /^\d{2}:\d{2}$/.test(variables.timeOfDay || '') ? variables.timeOfDay : '02:00';
      const enabled = Boolean(variables.enabled);
      const nextRunAt = enabled ? calculateNextBackupRun(frequency, timeOfDay) : null;

      const res = await db.insert(backupSchedules)
        .values({
          id: 'default',
          enabled,
          frequency,
          scope: JSON.stringify(scope),
          timeOfDay,
          nextRunAt,
          updatedById: variables?.updatedById || null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: backupSchedules.id,
          set: {
            enabled,
            frequency,
            scope: JSON.stringify(scope),
            timeOfDay,
            nextRunAt,
            updatedById: variables?.updatedById || null,
            updatedAt: new Date(),
          },
        })
        .returning();

      return { data: { backupSchedule: mapBackupSchedule(res[0]) } };
    } catch (error) {
      if (isMissingBackupTablesError(error)) {
        throw new Error(backupSetupErrorMessage);
      }
      throw error;
    }
  },

  async runDueBackupSchedule(variables) {
    try {
      const schedule = await db.query.backupSchedules.findFirst({
        where: eq(backupSchedules.id, 'default'),
      });

      if (!schedule?.enabled || !schedule.nextRunAt || schedule.nextRunAt > new Date()) {
        return { data: { ran: false } };
      }

      const scope = normalizeBackupScope(parseJsonArray(schedule.scope));
      const { payload, recordCount } = await collectBackupPayload(scope);

      const snapshot = await db.insert(backupSnapshots)
        .values({
          label: `Scheduled backup ${formatAppDateTime(new Date())}`,
          backupType: 'SCHEDULED',
          scope: JSON.stringify(scope),
          status: 'COMPLETED',
          recordCount,
          payload: JSON.stringify(payload),
          createdById: variables?.createdById || null,
        })
        .returning({ id: backupSnapshots.id });

      const nextRunAt = calculateNextBackupRun(schedule.frequency, schedule.timeOfDay);
      await db.update(backupSchedules)
        .set({
          lastRunAt: new Date(),
          nextRunAt,
          updatedAt: new Date(),
        })
        .where(eq(backupSchedules.id, 'default'));

      return { data: { ran: true, backupId: snapshot[0].id } };
    } catch (error) {
      if (isMissingBackupTablesError(error)) {
        return { data: { ran: false } };
      }
      throw error;
    }
  },

  async getMyBusinesses(variables) {
    const res = await db.query.businesses.findMany({
      where: eq(businesses.ownerId, variables.ownerId),
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(formatBusinessRow);
    return { data: { businesses: formatted } };
  },

  async getBusinessById(variables) {
    const res = await db.query.businesses.findFirst({
      where: eq(businesses.id, variables.id),
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    if (!res) return { data: { business: null } };
    return { data: { business: formatBusinessRow(res) } };
  },

  async createBusinessDraft(variables) {
    const id = variables.id || crypto.randomUUID();
    const insertData = prepareBusinessWriteData(variables);
    const res = await db.insert(businesses)
      .values({
        ...insertData,
        id,
        status: 'DRAFT',
      })
      .returning({ id: businesses.id });
    
    return { data: { business_insert: res[0].id } };
  },

  async updateBusiness(variables) {
    const filteredData = prepareBusinessWriteData(variables.data);
    delete filteredData.id;
    delete filteredData.ownerId;

    const res = await db.update(businesses)
      .set({
        ...filteredData,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, variables.id))
      .returning({ id: businesses.id });
    
    return {
      data: { business_update: res[0]?.id || variables.id },
    };
  },

  async submitBusiness(variables) {
    const res = await db.update(businesses)
      .set({
        status: 'PENDING',
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, variables.id))
      .returning({ id: businesses.id });
    
    return {
      data: { business_update: res[0]?.id || variables.id },
    };
  },

  async getAllBusinesses(variables) {
    const whereClause = variables?.status ? eq(businesses.status, variables.status) : undefined;
    const res = await db.query.businesses.findMany({
      where: whereClause,
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(formatBusinessRow);
    return { data: { businesses: formatted } };
  },

  async updateBusinessStatus(variables) {
    const res = await db.update(businesses)
      .set({
        status: variables.status,
        moderatorNotes: variables.moderatorNotes,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, variables.id))
      .returning({ id: businesses.id });
    
    return {
      data: {
        business_update: res[0]?.id || variables.id,
      },
    };
  },

  async searchApprovedBusinesses(variables) {
    const limit = variables.limit || 20;
    const page = variables.page || 1;
    const offset = (page - 1) * limit;
    
    const baseWhere = [eq(businesses.status, 'APPROVED')];
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (variables.categoryId) {
      if (uuidRegex.test(variables.categoryId)) {
        baseWhere.push(eq(businesses.categoryId, variables.categoryId));
      } else {
        baseWhere.push(or(eq(categories.slug, variables.categoryId), eq(subcategories.slug, variables.categoryId)) as any);
      }
    }
    if (variables.regionId) {
      if (uuidRegex.test(variables.regionId)) {
        baseWhere.push(eq(businesses.regionId, variables.regionId));
      } else {
        baseWhere.push(eq(regions.slug, variables.regionId));
      }
    }
    if (variables.provinceId) {
      if (uuidRegex.test(variables.provinceId)) {
        baseWhere.push(eq(businesses.provinceId, variables.provinceId));
      } else {
        baseWhere.push(eq(provinces.slug, variables.provinceId));
      }
    }
    if (variables.cityId) {
      if (uuidRegex.test(variables.cityId)) {
        baseWhere.push(eq(businesses.cityId, variables.cityId));
      } else {
        baseWhere.push(eq(cities.slug, variables.cityId));
      }
    }
    if (variables.featuredOnly) baseWhere.push(eq(businesses.isFeatured, true));
    if (variables.verifiedOnly) baseWhere.push(eq(businesses.isVerified, true));

    // For keyword search across joined tables, we need to join
    const query = db.select({
      id: businesses.id,
    })
    .from(businesses)
    .leftJoin(categories, eq(businesses.categoryId, categories.id))
    .leftJoin(subcategories, eq(businesses.subcategoryId, subcategories.id))
    .leftJoin(regions, eq(businesses.regionId, regions.id))
    .leftJoin(provinces, eq(businesses.provinceId, provinces.id))
    .leftJoin(cities, eq(businesses.cityId, cities.id));

    const searchFilters = [...baseWhere];
    if (variables.q) {
      const words = variables.q.split(/\s+/).filter(Boolean);
      for (const word of words) {
        searchFilters.push(or(
          ilike(businesses.name, `%${word}%`),
          ilike(businesses.description, `%${word}%`),
          ilike(businesses.keywords, `%${word}%`),
          sql`COALESCE(${categories.name}, '') ILIKE ${'%' + word + '%'}`,
          sql`COALESCE(${subcategories.name}, '') ILIKE ${'%' + word + '%'}`,
          sql`COALESCE(${regions.name}, '') ILIKE ${'%' + word + '%'}`,
          sql`COALESCE(${provinces.name}, '') ILIKE ${'%' + word + '%'}`,
          sql`COALESCE(${cities.name}, '') ILIKE ${'%' + word + '%'}`
        ) as any);
      }
    }

    let orderByList: any[] = [desc(businesses.createdAt)];
    if (variables.sort === 'featured') {
      orderByList = [desc(businesses.isFeatured), desc(businesses.createdAt)];
    } else if (variables.sort === 'verified') {
      orderByList = [desc(businesses.isVerified), desc(businesses.createdAt)];
    } else if (variables.sort === 'name') {
      orderByList = [asc(businesses.name), desc(businesses.createdAt)];
    }

    const businessIds = searchFilters.length > 0
      ? await query.where(and(...searchFilters)).orderBy(...orderByList)
      : await query.orderBy(...orderByList);
    const ids = businessIds.map(b => b.id);

    if (ids.length === 0) {
      return {
        data: {
          businesses: [],
          total: 0,
        },
      };
    }

    const paginatedIds = ids.slice(offset, offset + limit);
    if (paginatedIds.length === 0) {
      return {
        data: {
          businesses: [],
          total: ids.length,
        },
      };
    }

    const res = await db.query.businesses.findMany({
      where: inArray(businesses.id, paginatedIds),
      orderBy: orderByList,
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(formatBusinessRow);

    return {
      data: {
        businesses: formatted,
        total: ids.length,
      },
    };
  },

  async getSearchSuggestions(variables) {
    const q = variables.q;
    if (!q || q.length < 2) return { data: { suggestions: [] } };

    const searchPattern = `%${q}%`;

    const res = await db.select({
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      categoryName: categories.name,
      cityName: cities.name,
      provinceName: provinces.name,
    })
    .from(businesses)
    .leftJoin(categories, eq(businesses.categoryId, categories.id))
    .leftJoin(cities, eq(businesses.cityId, cities.id))
    .leftJoin(provinces, eq(businesses.provinceId, provinces.id))
    .where(and(
      eq(businesses.status, 'APPROVED'),
      or(
        ilike(businesses.name, searchPattern),
        ilike(categories.name, searchPattern),
        ilike(cities.name, searchPattern),
        ilike(provinces.name, searchPattern),
        ilike(businesses.keywords, searchPattern)
      )
    ))
    .limit(10);

    const suggestions = res.map(r => ({
      id: r.id,
      slug: r.slug,
      text: r.name,
      subtext: `${r.categoryName} • ${r.cityName}, ${r.provinceName}`,
      type: 'business'
    }));

    return { data: { suggestions } };
  },

  async getApprovedBusinessBySlug(variables) {
    if (!variables.slug) return { data: { business: null } };
    
    const res = await db.query.businesses.findFirst({
      where: and(
        ilike(businesses.slug, variables.slug),
        eq(businesses.status, 'APPROVED')
      ),
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    if (!res) return { data: { business: null } };
    return { data: { business: formatBusinessRow(res) } };
  },

  async getFeaturedApprovedBusinesses() {
    const res = await db.query.businesses.findMany({
      where: and(
        eq(businesses.isFeatured, true),
        eq(businesses.status, 'APPROVED')
      ),
      limit: 6,
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(formatBusinessRow);
    return { data: { businesses: formatted } };
  },

  async getRecentlyApprovedBusinesses() {
    const res = await db.query.businesses.findMany({
      where: eq(businesses.status, 'APPROVED'),
      limit: 6,
      orderBy: [desc(businesses.createdAt)],
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(formatBusinessRow);
    return { data: { businesses: formatted } };
  },

  // Metadata operations
  async getRegions() {
    const res = await db.query.regions.findMany();
    return { data: { regions: res } };
  },
  async getProvinces(variables) {
    let where;
    if (variables?.regionId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variables.regionId)) {
        where = eq(provinces.regionId, variables.regionId);
      } else {
        const r = await db.query.regions.findFirst({ where: eq(regions.slug, variables.regionId) });
        if (r) {
          where = eq(provinces.regionId, r.id);
        } else {
          return { data: { provinces: [] } };
        }
      }
    }
    const res = await db.query.provinces.findMany({ where });
    return { data: { provinces: res } };
  },
  async getCities(variables) {
    let where;
    if (variables?.provinceId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variables.provinceId)) {
        where = eq(cities.provinceId, variables.provinceId);
      } else {
        const p = await db.query.provinces.findFirst({ where: eq(provinces.slug, variables.provinceId) });
        if (p) {
          where = eq(cities.provinceId, p.id);
        } else {
          return { data: { cities: [] } };
        }
      }
    }
    const res = await db.query.cities.findMany({ where });
    return { data: { cities: res } };
  },
  async getCategories() {
    const res = await db.query.categories.findMany();
    return { data: { categories: res } };
  },
  async getSubcategories(variables) {
    let where;
    if (variables?.categoryId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variables.categoryId)) {
        where = eq(subcategories.categoryId, variables.categoryId);
      } else {
        const c = await db.query.categories.findFirst({ where: eq(categories.slug, variables.categoryId) });
        if (c) {
          where = eq(subcategories.categoryId, c.id);
        } else {
          return { data: { subcategories: [] } };
        }
      }
    }
    const res = await db.query.subcategories.findMany({ where });
    return { data: { subcategories: res } };
  },

  async upsertRegion(variables) {
    const res = await db.insert(regions)
      .values({
        name: variables.name,
        slug: variables.slug,
      })
      .onConflictDoUpdate({
        target: regions.slug,
        set: { name: variables.name }
      })
      .returning({ id: regions.id });
    return { data: { region_upsert: res[0].id } };
  },
  async upsertProvince(variables) {
    const res = await db.insert(provinces)
      .values({
        name: variables.name,
        slug: variables.slug,
        regionId: variables.regionId,
      })
      .onConflictDoUpdate({
        target: provinces.slug,
        set: { name: variables.name, regionId: variables.regionId }
      })
      .returning({ id: provinces.id });
    return { data: { province_upsert: res[0].id } };
  },
  async upsertCity(variables) {
    const res = await db.insert(cities)
      .values({
        name: variables.name,
        slug: variables.slug,
        provinceId: variables.provinceId,
      })
      .onConflictDoUpdate({
        target: cities.slug,
        set: { name: variables.name, provinceId: variables.provinceId }
      })
      .returning({ id: cities.id });
    return { data: { city_upsert: res[0].id } };
  },
  async upsertCategory(variables) {
    const res = await db.insert(categories)
      .values({
        name: variables.name,
        slug: variables.slug,
      })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: variables.name }
      })
      .returning({ id: categories.id });
    return { data: { category_upsert: res[0].id } };
  },
  async upsertSubcategory(variables) {
    const res = await db.insert(subcategories)
      .values({
        name: variables.name,
        slug: variables.slug,
        categoryId: variables.categoryId,
      })
      .onConflictDoUpdate({
        target: subcategories.slug,
        set: { name: variables.name, categoryId: variables.categoryId }
      })
      .returning({ id: subcategories.id });
    return { data: { subcategory_upsert: res[0].id } };
  },
};
