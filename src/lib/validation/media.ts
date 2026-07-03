export const MAX_LOGO_SIZE_MB = 2;
export const MAX_COVER_SIZE_MB = 5;
export const MAX_GALLERY_SIZE_MB = 5;
export const MAX_DOCUMENT_SIZE_MB = 10;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export const validateLogo = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a JPG, PNG, or WEBP image.';
  }
  if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
    return `File is too large. Max size is ${MAX_LOGO_SIZE_MB}MB.`;
  }
  return null;
};

export const validateCover = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a JPG, PNG, or WEBP image.';
  }
  if (file.size > MAX_COVER_SIZE_MB * 1024 * 1024) {
    return `File is too large. Max size is ${MAX_COVER_SIZE_MB}MB.`;
  }
  return null;
};

export const validateGalleryImage = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a JPG, PNG, or WEBP image.';
  }
  if (file.size > MAX_GALLERY_SIZE_MB * 1024 * 1024) {
    return `File is too large. Max size is ${MAX_GALLERY_SIZE_MB}MB.`;
  }
  return null;
};

export const validateDocument = (file: File): string | null => {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a PDF, JPG, or PNG document.';
  }
  if (file.size > MAX_DOCUMENT_SIZE_MB * 1024 * 1024) {
    return `File is too large. Max size is ${MAX_DOCUMENT_SIZE_MB}MB.`;
  }
  return null;
};
