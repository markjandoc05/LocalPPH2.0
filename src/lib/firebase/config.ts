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

// Validate Connection to Firestore
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'check'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

export { app, auth, storage, db };
