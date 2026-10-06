import { provider } from "./provider";
import { BusinessListing } from "@/types/business";

// Wrapper service around the Data Connect operations (or mocks)

export const getMyBusinesses = async (
  userId: string,
): Promise<BusinessListing[]> => {
  const result = await provider.getMyBusinesses({ ownerId: userId });
  return result.data.businesses as BusinessListing[];
};

export const getBusinessById = async (
  id: string,
): Promise<BusinessListing | null> => {
  const result = await provider.getBusinessById({ id });
  return result.data.business as BusinessListing | null;
};

export const createBusinessDraftWithResult = async (data: Partial<BusinessListing>) => {
  const result = await provider.createBusinessDraft(data);
  return { id: result.data.business_insert, created: result.data.business_created !== false };
};

export const createBusinessDraft = async (data: Partial<BusinessListing>) =>
  (await createBusinessDraftWithResult(data)).id;

export const updateBusiness = async (id: string, data: any) => {
  const result = await provider.updateBusiness({ id, data });
  return result.data.business_update;
};

export const submitBusiness = async (id: string) => {
  const result = await provider.submitBusiness({ id });
  return result.data.business_update;
};

export const resubmitBusiness = async (id: string) => {
  // same action right now
  const result = await provider.submitBusiness({ id });
  return result.data.business_update;
};

export const getMyBusinessInquiries = async (ownerId: string) => {
  const result = await provider.getMyBusinessInquiries({ ownerId });
  return result.data.inquiries;
};

export const respondBusinessInquiry = async (
  id: string,
  ownerId: string,
  response: string,
) => {
  const result = await provider.respondBusinessInquiry({ id, ownerId, response });
  return result.data.inquiry_update;
};

export const markBusinessInquiryRead = async (id: string, ownerId: string) => {
  const result = await provider.markBusinessInquiryRead({ id, ownerId });
  return result.data.inquiry_update;
};

export const deleteBusinessInquiry = async (id: string, ownerId: string) => {
  const result = await provider.deleteBusinessInquiry({ id, ownerId });
  return result.data.inquiry_delete;
};
