import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

export const adminApp = !getApps().length 
  ? initializeApp({
      credential: applicationDefault()
    })
  : getApps()[0];

export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
