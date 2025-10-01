// Auth Controller - Type-specific registration endpoints with file upload support
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { MulterFile } from '../../interfaces/file-upload.interface';

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
}
