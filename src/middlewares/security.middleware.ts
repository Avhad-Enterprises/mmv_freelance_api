import { Request, Response, NextFunction } from 'express';
import xss from 'xss';
import { ResponseUtil } from '../utils/response.util';

/**
 * Backend-specific security middleware for server-side protection
 * Frontend should handle client-side validation (email format, password strength, etc.)
 */
export class SecurityMiddleware {
  
  /**
   * Sanitize HTML input to prevent XSS attacks (Backend Critical)
   * This must be done server-side regardless of frontend validation
   */
  static sanitizeHtml = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Sanitize all string values in request body
      if (req.body && typeof req.body === 'object') {
        req.body = SecurityMiddleware.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = SecurityMiddleware.sanitizeObject(req.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Recursively sanitize object properties using xss library
   */
  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      // Use xss library to sanitize - removes malicious scripts
      return xss(obj, {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      }).trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => SecurityMiddleware.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = SecurityMiddleware.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Prevent SQL injection by validating input patterns (Backend Critical)
   * This is essential server-side security that cannot be handled by frontend
   */
  static preventSqlInjection = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
      
      const checkForSqlInjection = (obj: any): boolean => {
        if (typeof obj === 'string') {
          return sqlInjectionPattern.test(obj);
        }
        
        if (Array.isArray(obj)) {
          return obj.some(item => checkForSqlInjection(item));
        }
        
        if (obj && typeof obj === 'object') {
          return Object.values(obj).some(value => checkForSqlInjection(value));
        }
        
        return false;
      };

      if (checkForSqlInjection(req.body) || checkForSqlInjection(req.query)) {
        ResponseUtil.error(
          res,
          'Request rejected for security reasons',
          400
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate request size to prevent DoS attacks (Backend Critical)
   */
  static validateRequestSize = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      const contentLength = parseInt(req.get('content-length') || '0');
      
      if (contentLength > maxSize) {
        ResponseUtil.error(
          res,
          'Request payload too large',
          413
        );
        return;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Essential backend security middleware stack
   * Focuses only on server-side security requirements
   */
  static essential = [
    SecurityMiddleware.validateRequestSize,
    SecurityMiddleware.sanitizeHtml,
    SecurityMiddleware.preventSqlInjection
  ];
}