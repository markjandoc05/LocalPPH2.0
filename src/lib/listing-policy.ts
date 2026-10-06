import type { BusinessStatus } from '@/types/business';
import { DTI_SEC_REVISION_MESSAGE } from './listing-revision-reminders';

export const LISTING_POLICY_VERSION = '2026-10-06';
export const LISTING_POLICY_TEXT = 'LocalPages.ph does not accept businesses directly operating, promoting, or facilitating casino or gambling services, including gambling agents and affiliates. Hotels, restaurants, and ordinary suppliers are not excluded solely by association.';
export const MISSING_REGISTRATION_DOCUMENTS_MESSAGE = 'Thank you for submitting your business to LocalPages. We couldn’t find a business registration document in your submission. Please upload your DTI, SEC, or other applicable business registration document, then resubmit your listing for review.';
export const MODERATION_NOTES_PREFIX = 'LOCALPAGES_MODERATION_V1::';
export const OWNER_EDITABLE_STATUSES: BusinessStatus[] = ['DRAFT', 'REVISION_REQUESTED'];
export type ReviewStatus = 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' | 'SUSPENDED';
export type ReviewAction = 'APPROVE' | 'REJECT' | 'REVISION' | 'SUSPEND';
export const REVIEW_ACTION_STATUS: Record<ReviewAction, ReviewStatus> = {
  APPROVE: 'APPROVED', REJECT: 'REJECTED', REVISION: 'REVISION_REQUESTED', SUSPEND: 'SUSPENDED',
};
export const MODERATION_PRESETS = [
  { code: 'GAMBLING_RELATED_BUSINESS', label: 'Casino / gambling services', statuses: ['REJECTED', 'SUSPENDED'], message: 'Thank you for listing your business on LocalPages.ph.\n\nWe’re unable to publish your listing because our directory does not accept businesses that directly operate, promote, or facilitate casino or gambling services, including gambling agents and affiliates.\n\nIf you believe your business was classified incorrectly, please request a review through your business dashboard and explain the services you provide.\n\nThank you for your understanding.' },
  { code: 'DUPLICATE_LISTING', label: 'Duplicate listing', statuses: ['REJECTED'], message: 'This business already has a listing on LocalPages.ph. Please manage the existing listing instead. If you believe these are separate businesses, request a review and explain the difference.' },
  { code: 'MISSING_REGISTRATION_DOCUMENTS', label: 'Missing DTI / SEC or business registration', statuses: ['REVISION_REQUESTED'], message: MISSING_REGISTRATION_DOCUMENTS_MESSAGE },
  { code: 'DTI_SEC_DOCUMENT_REQUEST', label: 'DTI /SEC document request', statuses: ['REVISION_REQUESTED'], message: DTI_SEC_REVISION_MESSAGE },
  { code: 'INCOMPLETE_LISTING_DETAILS', label: 'Incomplete listing details', statuses: ['REVISION_REQUESTED'], message: 'Please complete the missing business information identified by our reviewer, then resubmit your listing for approval.' },
  { code: 'OTHER', label: 'Other — write a reason', statuses: ['REJECTED', 'REVISION_REQUESTED', 'SUSPENDED'], message: '' },
] as const;
export type ModerationReasonCode = typeof MODERATION_PRESETS[number]['code'];

const allowedTransitions: Partial<Record<BusinessStatus, ReviewStatus[]>> = {
  PENDING: ['APPROVED', 'REJECTED', 'REVISION_REQUESTED'],
  REVISION_REQUESTED: ['APPROVED', 'REJECTED'],
  REJECTED: ['APPROVED', 'REVISION_REQUESTED'],
  SUSPENDED: ['APPROVED', 'REVISION_REQUESTED'],
  INACTIVE: ['APPROVED'],
  APPROVED: ['SUSPENDED'],
};
export const canReviewListing = (from: BusinessStatus, to: ReviewStatus) => allowedTransitions[from]?.includes(to) ?? false;

export class ListingPolicyError extends Error {
  constructor(message: string, public status = 400) { super(message); this.name = 'ListingPolicyError'; }
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const requirePolicyRequestId = (value: unknown) => {
  if (typeof value !== 'string' || !uuidPattern.test(value)) throw new ListingPolicyError('A valid request ID is required.');
  return value;
};
export interface ModerationRequest {
  decisionId: string;
  expectedStatus: BusinessStatus;
  expectedUpdatedAt: string;
  reasonCode?: ModerationReasonCode;
  moderatorNotes?: string;
}
export interface ModerationDecision {
  id: string; status: ReviewStatus; reasonCode?: ModerationReasonCode; ownerMessage: string;
  reviewerId: string; policyVersion: string; decidedAt: string;
}
export interface ListingModerationMetadata {
  version: 1;
  ownerMessage: string;
  decision?: ModerationDecision;
  acknowledgement?: { policyVersion: string; acceptedAt: string };
}
export const readModerationMetadata = (notes?: string | null): ListingModerationMetadata | null => {
  if (!notes?.startsWith(MODERATION_NOTES_PREFIX)) return null;
  try {
    const data = JSON.parse(notes.slice(MODERATION_NOTES_PREFIX.length));
    return data?.version === 1 && typeof data.ownerMessage === 'string' ? data : null;
  } catch { return null; }
};
export const getOwnerModerationMessage = (notes?: string | null) => readModerationMetadata(notes)?.ownerMessage ?? notes ?? '';
export const serializeModerationMetadata = (data: ListingModerationMetadata) => MODERATION_NOTES_PREFIX + JSON.stringify(data);

export const validateModerationRequest = (status: unknown, request: Partial<ModerationRequest>) => {
  if (!Object.values(REVIEW_ACTION_STATUS).includes(status as ReviewStatus)) throw new ListingPolicyError('Unsupported listing review status.');
  requirePolicyRequestId(request.decisionId);
  if (!request.expectedStatus || !Object.hasOwn(allowedTransitions, request.expectedStatus)) throw new ListingPolicyError('The reviewed listing status is required. Refresh the listing.');
  if (typeof request.expectedUpdatedAt !== 'string' || !Number.isFinite(Date.parse(request.expectedUpdatedAt))) throw new ListingPolicyError('The reviewed listing version is required. Refresh the listing.');
  const message = typeof request.moderatorNotes === 'string' ? request.moderatorNotes.trim() : '';
  if (status === 'APPROVED') {
    if (request.reasonCode || message) throw new ListingPolicyError('Approval does not accept a rejection reason.');
  } else {
    const preset = MODERATION_PRESETS.find((item) => item.code === request.reasonCode);
    if (!preset || !(preset.statuses as readonly string[]).includes(String(status))) throw new ListingPolicyError('Choose a reason allowed for this review action. Missing information and documents require a revision request.');
    if (!message || message.length > 5000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(message)) throw new ListingPolicyError('An owner-facing reason of 1–5,000 characters is required.');
  }
  return { ...request, moderatorNotes: message } as ModerationRequest;
};
export const assertOwnerCanEditListing = (status: BusinessStatus) => {
  if (!OWNER_EDITABLE_STATUSES.includes(status)) throw new ListingPolicyError(status === 'APPROVED'
    ? 'Your approved listing remains published. Request changes through support; published content cannot be overwritten.'
    : 'This listing is under review or has a moderation decision. Request a review instead of editing or resubmitting it.', 409);
};
export const assertPolicyAcknowledgement = (version: unknown) => {
  if (version !== LISTING_POLICY_VERSION) throw new ListingPolicyError('Please acknowledge the current listing policy before submitting.');
};
export const getListingSupportId = (category: string, message: string) => {
  if (!['LISTING_REVIEW', 'LISTING_CHANGE'].includes(category)) return null;
  const id = /^Listing ID: ([^\n]+)\n/.exec(message)?.[1];
  return id && uuidPattern.test(id) ? id : null;
};
