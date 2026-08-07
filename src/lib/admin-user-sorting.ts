type UserRegistrationRecord = {
  id?: string;
  email?: string;
  createdAt?: string | null;
};

export type RegistrationSortDirection = 'asc' | 'desc';

export const getRegistrationTime = (value?: string | null) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

export const compareUsersByRegistration = (
  a: UserRegistrationRecord,
  b: UserRegistrationRecord,
  direction: RegistrationSortDirection,
) => {
  const aTime = getRegistrationTime(a.createdAt);
  const bTime = getRegistrationTime(b.createdAt);

  // Accounts without a usable registration timestamp remain at the end.
  if (aTime === null && bTime === null) {
    return String(a.email || a.id || '').localeCompare(String(b.email || b.id || ''));
  }
  if (aTime === null) return 1;
  if (bTime === null) return -1;

  const dateDifference = direction === 'asc' ? aTime - bTime : bTime - aTime;
  if (dateDifference !== 0) return dateDifference;

  return String(a.email || a.id || '').localeCompare(String(b.email || b.id || ''));
};
