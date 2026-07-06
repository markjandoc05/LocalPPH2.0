import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const config = firebaseConfig;

const app = !getApps().length ? initializeApp(config) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);

const db = (config as any).firestoreDatabaseId ? getFirestore(app, (config as any).firestoreDatabaseId) : getFirestore(app);

export { app, auth, storage, db };
