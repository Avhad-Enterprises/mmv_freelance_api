import { NextFunction, Response, Request } from 'express';
import admin from '../features/firebase-admin/firebase-admin';
import HttpException from '../exceptions/HttpException';

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID tokens from Authorization header
 * Attaches decoded token to req.firebaseUser
 */

export interface RequestWithFirebaseUser extends Request {
  firebaseUser?: admin.auth.DecodedIdToken;
}

const firebaseAuthMiddleware = async (
  req: RequestWithFirebaseUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization token is required. Format: Bearer <token>',
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken || idToken.trim() === '') {
      res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
      return;
    }

    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Attach decoded token to request
      req.firebaseUser = decodedToken;

      // Continue to next middleware
      next();
    } catch (verifyError: any) {
      // Handle specific Firebase auth errors
      if (verifyError.code === 'auth/id-token-expired') {
        res.status(401).json({
          success: false,
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        });
      } else if (verifyError.code === 'auth/id-token-revoked') {
        res.status(401).json({
          success: false,
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED',
        });
      } else if (verifyError.code === 'auth/argument-error') {
        res.status(401).json({
          success: false,
          message: 'Invalid token format',
          code: 'INVALID_TOKEN',
        });
      } else if (verifyError.code === 'auth/invalid-credential') {
        res.status(401).json({
          success: false,
          message: 'Invalid authentication credentials',
          code: 'INVALID_CREDENTIAL',
        });
      } else {
        // Firebase service unavailable or other errors
        console.error('Firebase token verification error:', verifyError);
        res.status(503).json({
          success: false,
          message: 'Firebase authentication service is unavailable',
          code: 'SERVICE_UNAVAILABLE',
        });
      }
      return;
    }
  } catch (error) {
    console.error('Unexpected error in Firebase auth middleware:', error);
    next(new HttpException(500, 'Internal server error during authentication'));
  }
};

export default firebaseAuthMiddleware;
