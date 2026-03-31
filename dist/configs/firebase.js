import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');
let firebaseApp = null;
if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully.');
    }
    catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
    }
}
else {
    console.warn('Firebase serviceAccountKey.json not found. Push notifications will be disabled.');
}
export default firebaseApp;
//# sourceMappingURL=firebase.js.map