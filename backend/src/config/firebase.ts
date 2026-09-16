import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');

let app;
if (!getApps().length) {
  let credentialOption;
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      credentialOption = cert(serviceAccount);
    } catch (error) {
      console.warn('⚠️ WARNING: firebase-service-account.json is invalid or unparseable. Operating without cert credential.');
    }
  } else {
    console.warn('⚠️ WARNING: firebase-service-account.json not found. Firebase Admin SDK initialized without service account cert.');
  }

  app = initializeApp(credentialOption ? { credential: credentialOption } : {});
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
