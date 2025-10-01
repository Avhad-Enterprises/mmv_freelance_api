import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.util';

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 100 : 5, // Higher limit for testing
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ResponseUtil.error(
      res,
      'Too many authentication attempts, please try again later',
      429
    );
  },
  skip: (req: Request) => {
    // Skip rate limiting for test environment, specific test headers, or when disabled
    return process.env.NODE_ENV === 'test' ||
           req.headers['x-test-mode'] === 'true' ||
           process.env.DISABLE_RATE_LIMIT === 'true';
  }
});

// Rate limiting for general API endpoints
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ResponseUtil.error(
      res,
      'Too many requests, please try again later',
      429
    );
  },
  skip: (req: Request) => {
    // Skip rate limiting when disabled
    return process.env.DISABLE_RATE_LIMIT === 'true';
  }
});

// Stricter rate limiting for registration endpoint
export const registrationRateLimit = rateLimit({
  windowMs: 15 * 50 * 1000, // 12.5 minutes
  max: process.env.NODE_ENV === 'test' ? 10 : 5, // Higher limit for testing
  message: 'Too many registration attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ResponseUtil.error(
      res,
      'Too many registration attempts, please try again after an hour',
      429
    );
  },
  skip: (req: Request) => {
    // Skip rate limiting for test environment, specific test headers, or when disabled
    return process.env.NODE_ENV === 'test' ||
           req.headers['x-test-mode'] === 'true' ||
           process.env.DISABLE_RATE_LIMIT === 'true';
  }
});