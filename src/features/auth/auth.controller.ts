// Auth Controller - Type-specific registration endpoints with file upload support
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { MulterFile } from '../../interfaces/file-upload.interface';
import { RequestWithUser } from '../../interfaces/auth.interface';
import { firebaseAdmin } from '../../utils/firebase.config';
import admin from '../firebase-admin/firebase-admin';
import { logger } from '../../utils/logger';

export class AuthController {
  private authService = new AuthService();

  /**
   * POST /auth/register/client
   */
  public registerClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: MulterFile[] };
      const result = await this.authService.registerClient(req.body, files);
      
      res.status(201).json({
        success: true,
        message: 'Client registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/register/videographer
   */
  public registerVideographer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: MulterFile[] };
      const result = await this.authService.registerVideographer(req.body, files);
      
      res.status(201).json({
        success: true,
        message: 'Videographer registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/register/videoeditor
   */
  public registerVideoEditor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: MulterFile[] };
      const result = await this.authService.registerVideoEditor(req.body, files);
      
      res.status(201).json({
        success: true,
        message: 'Video editor registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/login
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const result = await this.authService.login(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/firebase-token
   * Generate Firebase custom token for authenticated user
   */
  public getFirebaseToken = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.user_id) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
        return;
      }

      // Check if Firebase Admin is initialized
      if (!firebaseAdmin.isInitialized()) {
        logger.error('Firebase Admin is not initialized');
        res.status(503).json({
          success: false,
          message: 'Firebase authentication service is unavailable',
        });
        return;
      }

      const userId = String(req.user.user_id);
      
      // Create custom claims (optional)
      const customClaims: any = {
        email: req.user.email,
      };

      // Add first name if available
      if (req.user.first_name) {
        customClaims.firstName = req.user.first_name;
      }

      // Add role information if available
      if (req.user.roles && req.user.roles.length > 0) {
        customClaims.roles = req.user.roles;
      }

      // Generate custom Firebase token
      const auth = firebaseAdmin.getAuth();
      const customToken = await auth.createCustomToken(userId, customClaims);

      logger.info(`Firebase custom token generated for user: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Firebase token generated successfully',
        data: {
          customToken,
        },
      });
    } catch (error) {
      logger.error('Error generating Firebase token:', error);
      next(error);
    }
  };

  /**
   * POST /auth/verify-firebase-token
   * Verify Firebase ID token and return decoded user data
   */
  public verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      if (!idToken) {
        res.status(401).json({
          success: false,
          message: 'Invalid token format',
        });
        return;
      }

      // Check if Firebase Admin is initialized
      try {
        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        logger.info(`Firebase ID token verified for user: ${decodedToken.uid}`);

        res.status(200).json({
          success: true,
          message: 'Token verified successfully',
          data: {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            name: decodedToken.name,
            picture: decodedToken.picture,
            customClaims: decodedToken,
          },
        });
      } catch (verifyError: any) {
        logger.error('Firebase token verification failed:', verifyError);
        
        if (verifyError.code === 'auth/id-token-expired') {
          res.status(401).json({
            success: false,
            message: 'Token has expired',
          });
        } else if (verifyError.code === 'auth/id-token-revoked') {
          res.status(401).json({
            success: false,
            message: 'Token has been revoked',
          });
        } else if (verifyError.code === 'auth/argument-error') {
          res.status(401).json({
            success: false,
            message: 'Invalid token format',
          });
        } else {
          res.status(503).json({
            success: false,
            message: 'Firebase authentication service is unavailable',
          });
        }
        return;
      }
    } catch (error) {
      logger.error('Error verifying Firebase token:', error);
      next(error);
    }
  };
}
