import { Router } from "express";
import Route from "../../interfaces/route.interface";
import validationMiddleware from "../../middlewares/validation.middleware";
import UsersController from "./user.controller";
import { UserRegistrationDto, UserLoginDto } from "./user.registration.dto";
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
    // Multi-step registration endpoint (temporarily without validation)
    this.router.post(
      `${this.path}/register`,
      upload.fields([
        { name: 'id_document', maxCount: 1 },
        { name: 'business_documents', maxCount: 5 }
      ]),
      this.usersController.register
    );

    // Login endpoint (alternative to /users/loginf)
    this.router.post(
      `${this.path}/login`,
      this.usersController.Login
    );
  }
}

export default AuthRoute;