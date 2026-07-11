export const APP_TIME_ZONE = "Asia/Manila";
export const APP_LOCALE = "en-PH";

type DateValue = string | number | Date | null | undefined;

const toDate = (value: DateValue) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function formatAppDateTime(value: DateValue, fallback = "Not set") {
  const date = toDate(value);
  if (!date) return fallback;

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  }).format(date);
}

export function formatAppDate(value: DateValue, fallback = "Not set") {
  const date = toDate(value);
  if (!date) return fallback;

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
