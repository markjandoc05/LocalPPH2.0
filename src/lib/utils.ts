import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getShortDesc(description: string | null | undefined): string {
  if (!description) return '';
  const trimmed = description.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed.short || parsed.description || description;
    } catch (e) {
      // ignore and fallback
    }
  }
  return description;
}

export function getFullDesc(description: string | null | undefined): string {
  if (!description) return '';
  const trimmed = description.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed.full || parsed.description || description;
    } catch (e) {
      // ignore and fallback
    }
  }
  return description;
}

