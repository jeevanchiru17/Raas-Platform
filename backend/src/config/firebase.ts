import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

let db: admin.firestore.Firestore | null = null;
let firebaseAdmin: typeof admin | null = null;

try {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../service-account-key.json');
  
  if (fs.existsSync(credentialsPath) || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // If it's a JSON string or dynamic credentials, or if the file exists:
    const serviceAccount = require(credentialsPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.GOOGLE_CLOUD_PROJECT
    });
    db = admin.firestore();
    firebaseAdmin = admin;
  } else {
    console.warn('Firebase key file not found. Running in local fallback mode.');
  }
} catch (error: any) {
  console.warn('Firebase initialization skipped (for development):', error.message);
}

export { firebaseAdmin as admin, db };
