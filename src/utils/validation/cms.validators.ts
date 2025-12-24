import { isURL } from 'validator';
import HttpException from '../../exceptions/HttpException';

/**
 * CMS-specific validation utilities
 */

// Validation constants
export const VALIDATION_RULES = {
    STRING_MAX_LENGTH: 255,
    TEXT_MAX_LENGTH: 500,
    LONG_TEXT_MAX_LENGTH: 2048,
    DESCRIPTION_MAX_LENGTH: 5000,
    URL_MAX_LENGTH: 2048,
    RATING_MIN: 1,
    RATING_MAX: 5,
    SORT_ORDER_MIN: 0,
    SORT_ORDER_MAX: 9999,
    MAX_SKILLS_COUNT: 20,
    MAX_TAGS_COUNT: 10
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
    if (!input) return input;
    
    // Basic XSS prevention - remove script tags and event handlers
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
}

/**
 * Validates URL format and protocol
 */
export function validateUrl(url: string, fieldName: string = 'URL'): void {
    if (!url) return;
    
    if (url.length > VALIDATION_RULES.URL_MAX_LENGTH) {
        throw new HttpException(400, `${fieldName} exceeds maximum length of ${VALIDATION_RULES.URL_MAX_LENGTH} characters`);
    }
    
    if (!isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
        throw new HttpException(400, `${fieldName} must be a valid HTTP(S) URL`);
    }
    
    // Prevent javascript: and data: URLs
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
        throw new HttpException(400, `${fieldName} contains invalid protocol`);
    }
}

/**
 * Validates rating is within acceptable range
 */
export function validateRating(rating: number): void {
    if (rating < VALIDATION_RULES.RATING_MIN || rating > VALIDATION_RULES.RATING_MAX) {
        throw new HttpException(400, `Rating must be between ${VALIDATION_RULES.RATING_MIN} and ${VALIDATION_RULES.RATING_MAX}`);
    }
}

/**
 * Validates sort order is within acceptable range
 */
export function validateSortOrder(sortOrder: number): void {
    if (sortOrder < VALIDATION_RULES.SORT_ORDER_MIN || sortOrder > VALIDATION_RULES.SORT_ORDER_MAX) {
        throw new HttpException(400, `Sort order must be between ${VALIDATION_RULES.SORT_ORDER_MIN} and ${VALIDATION_RULES.SORT_ORDER_MAX}`);
    }
}

/**
 * Validates array of skills
 */
export function validateSkills(skills: string[]): void {
    if (!Array.isArray(skills)) {
        throw new HttpException(400, 'Skills must be an array');
    }
    
    if (skills.length > VALIDATION_RULES.MAX_SKILLS_COUNT) {
        throw new HttpException(400, `Maximum ${VALIDATION_RULES.MAX_SKILLS_COUNT} skills allowed`);
    }
    
    skills.forEach((skill, index) => {
        if (typeof skill !== 'string') {
            throw new HttpException(400, `Skill at index ${index} must be a string`);
        }
        if (skill.length > VALIDATION_RULES.STRING_MAX_LENGTH) {
            throw new HttpException(400, `Skill at index ${index} exceeds maximum length`);
        }
    });
}

/**
 * Validates array of tags
 */
export function validateTags(tags: string[]): void {
    if (!Array.isArray(tags)) {
        throw new HttpException(400, 'Tags must be an array');
    }
    
    if (tags.length > VALIDATION_RULES.MAX_TAGS_COUNT) {
        throw new HttpException(400, `Maximum ${VALIDATION_RULES.MAX_TAGS_COUNT} tags allowed`);
    }
    
    tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
            throw new HttpException(400, `Tag at index ${index} must be a string`);
        }
        if (tag.length > VALIDATION_RULES.STRING_MAX_LENGTH) {
            throw new HttpException(400, `Tag at index ${index} exceeds maximum length`);
        }
    });
}

/**
 * Validates reorder items array
 */
export function validateReorderItems(items: Array<{ cms_id: number; sort_order: number }>): void {
    if (!Array.isArray(items)) {
        throw new HttpException(400, 'Items must be an array');
    }

    if (items.length === 0) {
        throw new HttpException(400, 'Items array cannot be empty');
    }

    items.forEach((item, index) => {
        if (!item.cms_id || typeof item.cms_id !== 'number') {
            throw new HttpException(400, `Invalid cms_id at index ${index}`);
        }
        if (typeof item.sort_order !== 'number') {
            throw new HttpException(400, `Invalid sort_order at index ${index}`);
        }
        validateSortOrder(item.sort_order);
    });
}
