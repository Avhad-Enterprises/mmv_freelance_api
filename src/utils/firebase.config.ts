import * as admin from 'firebase-admin';
import { logger } from './logger';

/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for server-side operations
 */
class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }

  private initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      // Check if Firebase Admin is already initialized
      if (admin.apps.length > 0) {
        logger.info('Firebase Admin already initialized');
        this.initialized = true;
        return;
      }

      // Initialize with environment variables or service account
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      // Check if Firebase credentials are available
      if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
        logger.info('Firebase Admin is disabled. Firebase features will be unavailable.');
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
      });

      this.initialized = true;
      logger.info('Firebase Admin initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin:', error);
      throw error;
    }
  }

  public getAuth(): admin.auth.Auth {
    if (!this.initialized) {
      throw new Error('Firebase Admin is not initialized');
    }
    return admin.auth();
  }

  public getFirestore(): admin.firestore.Firestore {
    if (!this.initialized) {
      throw new Error('Firebase Admin is not initialized');
    }
    return admin.firestore();
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const firebaseAdmin = FirebaseAdmin.getInstance();
export default firebaseAdmin;
