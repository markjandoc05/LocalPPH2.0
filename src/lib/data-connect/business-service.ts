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

export const createBusinessDraft = async (data: any) => {
  const result = await provider.createBusinessDraft(data);
  return result.data.business_insert;
};

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
