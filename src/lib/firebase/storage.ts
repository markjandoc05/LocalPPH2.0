import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { MediaUploadResult } from '@/types/media';

// TODO: Add production storage security rules allowing writes only by business owners and reads by public.

const uploadFile = async (
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<MediaUploadResult> => {
  // If not configured properly (or using dummy key during build)
  const isMockOrUnconfigured = !storage || !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'dummy-api-key-for-build';

  if (isMockOrUnconfigured) {
    console.error('⚠️ Developer Error: Firebase Storage is not configured. Mocking upload success to prevent UI crash.');
    if (onProgress) {
      onProgress(100);
    }
    return Promise.resolve({
      url: URL.createObjectURL(file), // mock url for preview
      path,
      fileName: file.name
    });
  }

  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url,
          path,
          fileName: file.name
        });
      }
    );
  });
};

export const uploadBusinessLogo = (file: File, businessId: string, onProgress?: (p: number) => void) => {
  const path = `businesses/${businessId}/logo/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

export const uploadBusinessCover = (file: File, businessId: string, onProgress?: (p: number) => void) => {
  const path = `businesses/${businessId}/cover/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

export const uploadBusinessGalleryImage = (file: File, businessId: string, onProgress?: (p: number) => void) => {
  const path = `businesses/${businessId}/gallery/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

export const uploadBusinessDocument = (file: File, businessId: string, onProgress?: (p: number) => void) => {
  const path = `businesses/${businessId}/documents/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

export const deleteBusinessMedia = async (path: string): Promise<void> => {
  const isMockOrUnconfigured = !storage || !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'dummy-api-key-for-build';
  if (isMockOrUnconfigured) {
    console.warn('⚠️ Developer Warning: Firebase Storage not configured. Mocking delete success.');
    return;
  }
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export const getPublicDownloadUrl = async (path: string): Promise<string> => {
  const isMockOrUnconfigured = !storage || !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'dummy-api-key-for-build';
  if (isMockOrUnconfigured) {
    console.warn('⚠️ Developer Warning: Firebase Storage not configured. Returning empty string for URL.');
    return '';
  }
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};
