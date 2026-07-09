import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isProfileComplete(user: any): boolean {
  const requiredFields = [
    'firstName', 'lastName', 'displayName', 'mobileNumber', 
    'addressLine1', 'barangay', 'city', 'province', 'region', 'zipCode'
  ];
  return requiredFields.every(field => !!user[field]);
}
