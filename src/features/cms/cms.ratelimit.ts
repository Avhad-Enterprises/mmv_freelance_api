import { Request, Response, NextFunction } from 'express';
import HttpException from '../../exceptions/HttpException';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

/**
 * Simple in-memory rate limiter
 * In production, use Redis-based rate limiter for distributed systems
 */
class RateLimiter {
    private store: RateLimitStore = {};
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Cleanup expired entries every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    }

    private cleanup(): void {
        const now = Date.now();
        Object.keys(this.store).forEach(key => {
            if (this.store[key].resetTime < now) {
                delete this.store[key];
            }
        });
    }

    public check(key: string, limit: number, windowMs: number): boolean {
        const now = Date.now();
        const entry = this.store[key];

        if (!entry || entry.resetTime < now) {
            // Create new entry
            this.store[key] = {
                count: 1,
                resetTime: now + windowMs
            };
            return true;
        }

        if (entry.count < limit) {
            entry.count++;
            return true;
        }

        return false;
    }

    public getResetTime(key: string): number | null {
        const entry = this.store[key];
        return entry ? entry.resetTime : null;
    }

    public destroy(): void {
        clearInterval(this.cleanupInterval);
        this.store = {};
    }
}

const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware factory
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @param keyGenerator - Function to generate unique key for each client
 */
export function createRateLimiter(
    limit: number,
    windowMs: number,
    keyGenerator: (req: Request) => string = (req) => req.ip || 'unknown'
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const key = `ratelimit:${keyGenerator(req)}`;
        
        if (rateLimiter.check(key, limit, windowMs)) {
            next();
        } else {
            const resetTime = rateLimiter.getResetTime(key);
            const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
            
            res.setHeader('Retry-After', retryAfter.toString());
            res.setHeader('X-RateLimit-Limit', limit.toString());
            res.setHeader('X-RateLimit-Remaining', '0');
            res.setHeader('X-RateLimit-Reset', resetTime ? new Date(resetTime).toISOString() : '');
            
            next(new HttpException(429, 'Too many requests, please try again later'));
        }
    };
}

/**
 * Preset rate limiters for different endpoints
 */
export const rateLimiters = {
    // Public endpoints: 100 requests per 15 minutes per IP
    public: createRateLimiter(100, 15 * 60 * 1000),
    
    // Admin read endpoints: 300 requests per 15 minutes per user
    adminRead: createRateLimiter(300, 15 * 60 * 1000, (req) => {
        const user = (req as any).user;
        return user ? `user:${user.user_id}` : req.ip || 'unknown';
    }),
    
    // Admin write endpoints: 100 requests per 15 minutes per user
    adminWrite: createRateLimiter(100, 15 * 60 * 1000, (req) => {
        const user = (req as any).user;
        return user ? `user:${user.user_id}` : req.ip || 'unknown';
    }),
    
    // Bulk operations: 20 requests per hour per user
    bulk: createRateLimiter(20, 60 * 60 * 1000, (req) => {
        const user = (req as any).user;
        return user ? `user:${user.user_id}` : req.ip || 'unknown';
    })
};

export default rateLimiters;
