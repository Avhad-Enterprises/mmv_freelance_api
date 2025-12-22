/**
 * Credit Rate Limiters
 * Protection against abuse and DoS attacks
 */

import rateLimit from 'express-rate-limit';
import { CREDIT_CONFIG } from '../constants';
import { RequestWithUser } from '../../../interfaces/auth.interface';

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
    // Use user_id from JWT if available, otherwise skip IP-based rate limiting
    keyGenerator: (req) => {
        const userId = (req as RequestWithUser).user?.user_id;
        if (userId) {
            return `user_${userId}`;
        }
        // Fallback: use a generic key (not IP-based to avoid the error)
        return 'anonymous';
    },
    skip: (req) => {
        // Skip rate limiting for unauthenticated requests (they'll fail auth anyway)
        return !(req as RequestWithUser).user?.user_id;
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
    // Use user_id from JWT for purchase limiting
    keyGenerator: (req) => {
        const userId = (req as RequestWithUser).user?.user_id;
        if (userId) {
            return `purchase_${userId}`;
        }
        return 'anonymous';
    },
    skip: (req) => {
        // Skip rate limiting for unauthenticated requests
        return !(req as RequestWithUser).user?.user_id;
    }
});
