import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');


let firebaseApp: admin.app.App | null = null;

try {
  let serviceAccount: any;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Replace literal \n with actual newlines if present
    if (typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    console.log('Firebase Admin SDK: Using credentials from environment variable.');
  } else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('Firebase Admin SDK: Using credentials from serviceAccountKey.json.');
  }

  if (serviceAccount) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } else {
    console.warn('Firebase service account credentials not found. Push notifications will be disabled.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

export default firebaseApp;
