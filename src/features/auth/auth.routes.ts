// Auth Routes - Type-specific registration endpoints with file upload support
import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { AuthController } from './auth.controller';
import validationMiddleware from '../../middlewares/validation.middleware';
import { ClientRegistrationDto } from '../clients/client.registration.dto';
import { VideographerRegistrationDto } from '../videographers/videographer.registration.dto';
import { VideoEditorRegistrationDto } from '../videoeditors/videoeditor.registration.dto';
import { LoginDto } from './login.dto';
// import { registrationRateLimit, authRateLimit } from '../../middlewares/rate-limit.middleware';
import { SecurityMiddleware } from '../../middlewares/security.middleware';
import { registrationUpload } from '../../middlewares/upload.middleware';
import authMiddleware from '../../middlewares/auth.middleware';
import firebaseAuthMiddleware from '../../middlewares/firebase-auth.middleware';

export class AuthRoutes implements Route {
  public path = '/auth';
  public router = Router();
  private authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Client registration with file uploads
    this.router.post(
      `${this.path}/register/client`,
      // registrationRateLimit, // Disabled for testing
      SecurityMiddleware.essential,
      registrationUpload,
      validationMiddleware(ClientRegistrationDto, 'body', false, []),
      this.authController.registerClient
    );

    // Videographer registration with file uploads
    this.router.post(
      `${this.path}/register/videographer`,
      // registrationRateLimit, // Disabled for testing
      SecurityMiddleware.essential,
      registrationUpload,
      validationMiddleware(VideographerRegistrationDto, 'body', false, []),
      this.authController.registerVideographer
    );

    // Video editor registration with file uploads
    this.router.post(
      `${this.path}/register/videoeditor`,
      // registrationRateLimit, // Disabled for testing
      SecurityMiddleware.essential,
      registrationUpload,
      validationMiddleware(VideoEditorRegistrationDto, 'body', false, []),
      this.authController.registerVideoEditor
    );

    // Login
    this.router.post(
      `${this.path}/login`,
      // authRateLimit, // Disabled for testing
      SecurityMiddleware.essential,
      validationMiddleware(LoginDto, 'body', false, []),
      this.authController.login
    );

    // Firebase custom token generation (requires authentication)
    this.router.get(
      `${this.path}/firebase-token`,
      authMiddleware,
      this.authController.getFirebaseToken
    );

    // Firebase ID token verification
    this.router.post(
      `${this.path}/verify-firebase-token`,
      this.authController.verifyFirebaseToken
    );
  }
}

export default AuthRoutes;
