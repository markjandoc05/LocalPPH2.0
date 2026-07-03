export type BusinessMediaType = 'logo' | 'cover' | 'gallery' | 'document';

export interface BusinessPhoto {
  id: string;
  url: string;
  path: string;
  type: BusinessMediaType;
  caption?: string;
  uploadedAt: string;
}

export interface BusinessDocument {
  id: string;
  url: string;
  path: string;
  name: string;
  type: string; // e.g., 'application/pdf', 'image/jpeg'
  size: number;
  uploadedAt: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export interface MediaUploadResult {
  url: string;
  path: string;
  fileName: string;
}
