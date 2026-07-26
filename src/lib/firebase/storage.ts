import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './config';
import { MediaUploadResult } from '@/types/media';

type UploadPermission = {
  allowed: true;
  uploadPath: string;
  ownerId: string;
  businessId: string;
  category: string;
};

const requestPermission = async (businessId: string, category: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');
  const token = await user.getIdToken();
  const res = await fetch('/api/business/upload-permission', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ businessId, category })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'You do not have permission to upload files for this business.');
  }
  return await res.json() as UploadPermission;
};

const sanitizeFileName = (fileName: string) => {
  const sanitized = fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\-.]+/, '')
    .slice(0, 120);

  return sanitized || 'upload';
};

const uploadFile = async (
  file: File, 
  businessId: string,
  category: string,
  onProgress?: (progress: number) => void
): Promise<MediaUploadResult> => {
  if (!auth.currentUser) {
    throw new Error('Please log in before uploading files.');
  }

  try {
    await auth.currentUser.getIdToken(true);
  } catch {
    throw new Error('Upload failed. Please make sure you are logged in and try again.');
  }

  const permission = await requestPermission(businessId, category);
  const path = `${permission.uploadPath}${crypto.randomUUID()}_${sanitizeFileName(file.name)}`;
  
  // Check if storage is initialized
  const isMockOrUnconfigured = !storage;

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
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      ownerId: permission.ownerId,
      businessId: permission.businessId,
      category: permission.category,
    },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error: any) => {
        console.error('Upload error:', error);
        if (error.code === 'storage/unauthorized') {
          reject(new Error('Upload failed. Please make sure you are logged in and try again.'));
        } else {
          reject(error);
        }
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
  return uploadFile(file, businessId, 'logo', onProgress);
};

export const uploadBusinessCover = (file: File, businessId: string, onProgress?: (p: number) => void) => {
  return uploadFile(file, businessId, 'cover', onProgress);
};

export const uploadBusinessGalleryImage = (file: File, businessId: string, onProgress?: (p: number) => void) => {
  return uploadFile(file, businessId, 'gallery', onProgress);
};

export const uploadBusinessDocument = (file: File, businessId: string, onProgress?: (p: number) => void) => {
  return uploadFile(file, businessId, 'documents', onProgress);
};

export const deleteBusinessMedia = async (filePath: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');
  const token = await user.getIdToken();
  
  const res = await fetch('/api/business/delete-media', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filePath })
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'You do not have permission to delete files for this business.');
  }
};

export const getPublicDownloadUrl = async (path: string): Promise<string> => {
  const isMockOrUnconfigured = !storage;
  if (isMockOrUnconfigured) {
    console.warn('⚠️ Developer Warning: Firebase Storage not configured. Returning empty string for URL.');
    return '';
  }
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};
