import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Only initialize Firebase Admin if all required credentials are present
if (process.env.PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.warn('Firebase Admin initialization failed:', error.message);
    }
} else {
    console.warn('Firebase Admin not initialized - missing required environment variables (PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)');
}

export const verifyIdToken = async (token: string) => {
    if (!admin.apps.length) {
        throw new Error('Firebase Admin not initialized');
    }
    return await admin.auth().verifyIdToken(token);
};
