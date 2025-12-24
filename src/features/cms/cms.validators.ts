import { isURL } from 'validator';
import HttpException from '../../exceptions/HttpException';
import { VALIDATION_RULES } from './cms.types';

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
 * Validates string length
 */
export function validateStringLength(value: string, fieldName: string, maxLength: number = VALIDATION_RULES.STRING_MAX_LENGTH): void {
    if (value && value.length > maxLength) {
        throw new HttpException(400, `${fieldName} exceeds maximum length of ${maxLength} characters`);
    }
}

/**
 * Validates text content length
 */
export function validateTextLength(value: string, fieldName: string): void {
    if (value && value.length > VALIDATION_RULES.TEXT_MAX_LENGTH) {
        throw new HttpException(400, `${fieldName} exceeds maximum length of ${VALIDATION_RULES.TEXT_MAX_LENGTH} characters`);
    }
}

/**
 * Validates metadata object
 */
export function validateMetadata(metadata: any): void {
    if (metadata !== null && typeof metadata !== 'object') {
        throw new HttpException(400, 'Metadata must be a valid JSON object');
    }
    
    // Prevent excessive metadata size
    if (metadata) {
        const jsonString = JSON.stringify(metadata);
        if (jsonString.length > 10000) {
            throw new HttpException(400, 'Metadata exceeds maximum size');
        }
    }
}

/**
 * Sanitizes all string fields in an object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };
    
    Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeHtml(sanitized[key]);
        }
    });
    
    return sanitized;
}
