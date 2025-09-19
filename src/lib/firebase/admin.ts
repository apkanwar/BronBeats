import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

function getFirebaseAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const credentialsJson = process.env.FIREBASE_ADMIN_CREDENTIALS;

  if (!credentialsJson) {
    throw new Error('FIREBASE_ADMIN_CREDENTIALS is not set.');
  }

  const credential = cert(JSON.parse(credentialsJson));
  adminApp = getApps().length === 0 ? initializeApp({ credential }) : getApps()[0];
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (adminDb) {
    return adminDb;
  }

  const app = getFirebaseAdminApp();
  adminDb = getFirestore(app);
  return adminDb;
}
