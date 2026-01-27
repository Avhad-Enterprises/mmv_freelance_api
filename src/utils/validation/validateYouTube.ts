import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Checks if a URL is a valid YouTube link with enhanced security validation
 * @param url - The URL to check
 * @returns boolean indicating if URL is a YouTube link
 */
export function isYouTubeURL(url: string): boolean {
    if (!url) return false;

    const trimmedURL = url.trim();
    
    // Enhanced regex for more precise YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/[\w\-?&=%./]*$/i;
    
    if (!youtubeRegex.test(trimmedURL)) {
        return false;
    }

    try {
        // Additional validation using URL constructor for security
        let urlToCheck = trimmedURL;
        if (!/^https?:\/\//i.test(urlToCheck)) {
            urlToCheck = `https://${urlToCheck}`;
        }

        const urlObject = new URL(urlToCheck);
        const hostname = urlObject.hostname.toLowerCase();
        
        // Only allow specific YouTube domains for security
        const allowedDomains = [
            'youtube.com',
            'www.youtube.com',
            'm.youtube.com',
            'youtu.be'
        ];
        
        return allowedDomains.includes(hostname);
    } catch {
        return false;
    }
}

/**
 * Validates that all URLs in an array are YouTube links
 * @param urls - Array of URLs to validate
 * @param requireAtLeastOne - Whether at least one valid YouTube link is required
 * @returns validation result object
 */
export function validateYouTubeURLArray(urls: string[], requireAtLeastOne: boolean = true) {
    if (!Array.isArray(urls)) {
        return { valid: false, message: 'Portfolio links must be an array' };
    }

    const nonEmptyUrls = urls.filter(url => url && url.trim());
    
    if (requireAtLeastOne && nonEmptyUrls.length === 0) {
        return { valid: false, message: 'At least one portfolio link is required' };
    }

    const invalidUrls = nonEmptyUrls.filter(url => !isYouTubeURL(url));
    
    if (invalidUrls.length > 0) {
        return { 
            valid: false, 
            message: `Only YouTube links are allowed. Invalid URLs: ${invalidUrls.join(', ')}` 
        };
    }

    return { valid: true };
}

/**
 * Custom validator decorator for YouTube URLs
 * @param requireAtLeastOne - Whether at least one valid YouTube link is required
 * @param validationOptions - Standard validation options
 */
export function IsYouTubeURLArray(requireAtLeastOne: boolean = true, validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isYouTubeURLArray',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const result = validateYouTubeURLArray(value, requireAtLeastOne);
                    return result.valid;
                },
                defaultMessage(args: ValidationArguments) {
                    const result = validateYouTubeURLArray(args.value, requireAtLeastOne);
                    return result.message || 'Invalid YouTube URL array';
                },
            },
        });
    };
}