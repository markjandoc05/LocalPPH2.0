export interface ProfileCompletionUser {
  firstName?: string | null;
  lastName?: string | null;
  mobileNumber?: string | null;
  addressLine1?: string | null;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  region?: string | null;
  zipCode?: string | null;
}

const hasValue = (value?: string | null) => !!value?.trim();

export const getMissingProfileFields = (user?: ProfileCompletionUser | null) => {
  if (!user) {
    return ['Personal Information', 'Contact Number', 'Address'];
  }

  const missing: string[] = [];

  if (!hasValue(user.firstName) || !hasValue(user.lastName)) {
    missing.push('Personal Information');
  }

  if (!hasValue(user.mobileNumber)) {
    missing.push('Contact Number');
  }

  if (
    !hasValue(user.addressLine1) ||
    !hasValue(user.barangay) ||
    !hasValue(user.city) ||
    !hasValue(user.province) ||
    !hasValue(user.region) ||
    !hasValue(user.zipCode)
  ) {
    missing.push('Address');
  }

  return missing;
};

export const isProfileComplete = (user?: ProfileCompletionUser | null) =>
  getMissingProfileFields(user).length === 0;
