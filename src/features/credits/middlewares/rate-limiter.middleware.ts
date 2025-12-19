/**
 * Credit Rate Limiters
 * Protection against abuse and DoS attacks
 */

import rateLimit from 'express-rate-limit';
import { CREDIT_CONFIG } from '../constants';

/**
 * Rate limiter for general credit operations
 * 10 requests per minute
 */
export const creditOperationsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: CREDIT_CONFIG.MAX_OPERATIONS_PER_MINUTE,
    message: {
        success: false,
        error: 'Too many credit operations. Please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return (req as any).user?.user_id?.toString() || req.ip || 'unknown';
    }
});

/**
 * Rate limiter for purchase operations
 * 5 purchases per hour
 */
export const purchaseLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: CREDIT_CONFIG.MAX_PURCHASES_PER_HOUR,
    message: {
        success: false,
        error: 'Too many purchase attempts. Please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return (req as any).user?.user_id?.toString() || req.ip || 'unknown';
    }
});
