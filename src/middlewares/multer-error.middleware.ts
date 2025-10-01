// Multer Error Handler Middleware
// Converts multer errors to proper HTTP exceptions

import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';
import multer from 'multer';

const multerErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  // Handle multer-specific errors
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        next(new HttpException(400, 'File too large. Maximum size is 10MB.'));
        return;
      case 'LIMIT_FILE_COUNT':
        next(new HttpException(400, 'Too many files uploaded.'));
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        next(new HttpException(400, 'Unexpected file field.'));
        return;
      default:
        next(new HttpException(400, `File upload error: ${error.message}`));
        return;
    }
  }

  // Handle custom file filter errors (from our fileFilter function)
  if (error.message && (
    error.message.includes('Profile picture must be an image file') ||
    error.message.includes('Documents must be image or PDF files') ||
    error.message.includes('Unexpected field')
  )) {
    next(new HttpException(400, error.message));
    return;
  }

  // If not a multer error, pass to next middleware
  next(error);
};

export default multerErrorHandler;