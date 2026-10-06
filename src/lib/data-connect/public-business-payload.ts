import type { BusinessListing } from '@/types/business';
import { getOwnerModerationMessage, readModerationMetadata } from '@/lib/listing-policy';

const PRIVATE_BUSINESS_FIELDS = new Set([
  'ownerId',
  'owner',
  'ownerName',
  'ownerEmail',
  'ownerAccountStatus',
  'revisionReminderCount',
  'lastRevisionReminderAt',
  'lastRevisionReminderStatus',
  'lastRevisionReminderError',
  'documents',
  'moderatorNotes',
  'moderationReasonCode',
  'moderationPolicyVersion',
]);

export const sanitizePublicBusinessPayload = <T extends Record<string, unknown>>(business: T) =>
  Object.fromEntries(
    Object.entries(business).filter(([key]) => !PRIVATE_BUSINESS_FIELDS.has(key)),
  );

export const formatBusinessRow = (b: any): BusinessListing => {
  if (!b) return b;
  let parsedDocuments = [];
  if (b.documents) {
    try {
      parsedDocuments = typeof b.documents === 'string' ? JSON.parse(b.documents) : b.documents;
    } catch (error) {
      console.error('Error parsing business documents JSON:', error);
    }
  }
  let parsedGallery = [];
  if (b.gallery) {
    try {
      parsedGallery = typeof b.gallery === 'string' ? JSON.parse(b.gallery) : b.gallery;
    } catch (error) {
      console.error('Error parsing business gallery JSON:', error);
    }
  }
  return {
    ...b,
    moderatorNotes: getOwnerModerationMessage(b.moderatorNotes),
    moderationReasonCode: readModerationMetadata(b.moderatorNotes)?.decision?.reasonCode,
    moderationPolicyVersion: readModerationMetadata(b.moderatorNotes)?.decision?.policyVersion,
    ownerName: b.owner?.displayName || b.owner?.email || 'Not assigned',
    ownerEmail: b.owner?.email || undefined,
    ownerAccountStatus: b.owner?.accountStatus || undefined,
    categoryName: b.category?.name || 'Not assigned',
    categorySlug: b.category?.slug || undefined,
    subcategoryName: b.subcategory?.name || 'Not assigned',
    subcategorySlug: b.subcategory?.slug || undefined,
    cityName: b.city?.name || 'Not assigned',
    citySlug: b.city?.slug || undefined,
    provinceName: b.province?.name || 'Not assigned',
    provinceSlug: b.province?.slug || undefined,
    regionName: b.region?.name || 'Not assigned',
    regionSlug: b.region?.slug || undefined,
    documents: parsedDocuments,
    gallery: parsedGallery,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : (b.createdAt || new Date().toISOString()),
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : (b.updatedAt || new Date().toISOString()),
  } as unknown as BusinessListing;
};

export const formatPublicBusinessRow = (business: any) =>
  sanitizePublicBusinessPayload(
    formatBusinessRow(business) as unknown as Record<string, unknown>,
  ) as unknown as BusinessListing;
