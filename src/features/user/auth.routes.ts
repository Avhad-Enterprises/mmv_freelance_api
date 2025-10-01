import { Router } from "express";
import Route from "../../interfaces/route.interface";
import validationMiddleware from "../../middlewares/validation.middleware";
import UsersController from "./user.controller";
import { UserRegistrationDto, UserLoginDto } from "./user.registration.dto";
import { registrationRateLimit, authRateLimit } from "../../middlewares/rate-limit.middleware";
import { SecurityMiddleware } from "../../middlewares/security.middleware";
import { BusinessValidationMiddleware } from "../../middlewares/business-validation.middleware";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'));
    }
  }
});

class AuthRoute implements Route {
  public path = "/auth";
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Multi-step registration endpoint with backend-specific validation
    this.router.post(
      `${this.path}/register`,
      registrationRateLimit, // Prevent registration spam
      SecurityMiddleware.essential, // XSS, SQL injection, request size protection
      upload.fields([
        { name: 'id_document', maxCount: 1 },
        { name: 'business_documents', maxCount: 5 },
        { name: 'profile_picture', maxCount: 1 }
      ]),
      validationMiddleware(UserRegistrationDto, 'body', false, []),
      BusinessValidationMiddleware.registrationValidation, // Business logic validation
      this.usersController.register
    );

    // Login endpoint with backend security
    this.router.post(
      `${this.path}/login`,
      authRateLimit, // Prevent brute force attacks
      SecurityMiddleware.essential, // XSS, SQL injection protection
      validationMiddleware(UserLoginDto, 'body', false, []),
      this.usersController.Login
    );
  }
}

export default AuthRoute;