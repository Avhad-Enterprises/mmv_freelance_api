// OAuth Provider Configuration
// Centralized configuration for all OAuth providers

import { OAuthProviderConfig, OAuthProvider } from './oauth.interface';

// ===========================================
// ENVIRONMENT VARIABLE VALIDATION
// ===========================================

/**
 * Validate required OAuth environment variables
 */
export function validateOAuthConfig(): void {
    const requiredVars = [
        'JWT_SECRET',
        'FRONTEND_URL',
    ];

    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        console.warn(`⚠️ Missing required OAuth environment variables: ${missing.join(', ')}`);
    }
}

// ===========================================
// PROVIDER CONFIGURATIONS
// ===========================================

/**
 * OAuth provider configurations
 * Add new providers (Facebook, Apple) here in the future
 */
export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
    google: {
        name: 'google',
        displayName: 'Google',
        enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        scopes: ['openid', 'profile', 'email'],
        icon: 'google',
    },
    facebook: {
        name: 'facebook',
        displayName: 'Facebook',
        enabled: false, // Will be implemented later
        scopes: ['email', 'public_profile'],
        icon: 'facebook',
    },
    apple: {
        name: 'apple',
        displayName: 'Apple',
        enabled: false, // Will be implemented later
        scopes: ['name', 'email'],
        icon: 'apple',
    },
};

// ===========================================
// GOOGLE PROVIDER INITIALIZATION (LAZY LOADED)
// ===========================================

// Cache for the arctic module and provider instance
let arcticModule: typeof import('arctic') | null = null;
let googleProviderInstance: any = null;

/**
 * Dynamically import Arctic (ESM module)
 * Uses Function constructor to prevent ts-node from transpiling import() to require()
 */
async function getArctic(): Promise<typeof import('arctic')> {
    if (!arcticModule) {
        // Use Function constructor to create a true dynamic import
        // This prevents ts-node from transpiling import() to require()
        const importModule = new Function('modulePath', 'return import(modulePath)');
        arcticModule = await importModule('arctic');
    }
    return arcticModule;
}

/**
 * Initialize Google OAuth provider (singleton pattern)
 * Uses dynamic import for ESM compatibility
 */
export async function getGoogleProvider(): Promise<any> {
    if (googleProviderInstance) {
        return googleProviderInstance;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.FRONTEND_URL || 'http://localhost:8000'}/api/v1/oauth/google/callback`;

    if (!clientId || !clientSecret) {
        throw new Error(
            'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
        );
    }

    const arctic = await getArctic();
    googleProviderInstance = new arctic.Google(clientId, clientSecret, redirectUri);
    return googleProviderInstance;
}

/**
 * Check if Google OAuth is configured
 */
export function isGoogleConfigured(): boolean {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Generate state for CSRF protection
 */
export async function generateState(): Promise<string> {
    const arctic = await getArctic();
    return arctic.generateState();
}

/**
 * Generate PKCE code verifier
 */
export async function generateCodeVerifier(): Promise<string> {
    const arctic = await getArctic();
    return arctic.generateCodeVerifier();
}

/**
 * Get Arctic error classes for error handling
 */
export async function getArcticErrors() {
    const arctic = await getArctic();
    return {
        OAuth2RequestError: arctic.OAuth2RequestError,
        ArcticFetchError: arctic.ArcticFetchError,
    };
}

// ===========================================
// COOKIE CONFIGURATION
// ===========================================

/**
 * Cookie options for OAuth state storage
 * These cookies are used to store state and code_verifier for CSRF protection
 */
export const OAUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 10 * 60 * 1000, // 10 minutes
};

/**
 * Cookie names
 */
export const OAUTH_COOKIES = {
    STATE: 'oauth_state',
    CODE_VERIFIER: 'oauth_code_verifier',
    REDIRECT_URL: 'oauth_redirect',
};

// ===========================================
// URL CONFIGURATION
// ===========================================

/**
 * Get frontend URLs for OAuth redirects
 */
export function getOAuthUrls() {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
        success: process.env.OAUTH_FRONTEND_SUCCESS_URL || `${baseUrl}/auth/callback`,
        error: process.env.OAUTH_FRONTEND_ERROR_URL || `${baseUrl}/auth/error`,
    };
}

/**
 * Validate redirect URL is allowed
 */
export function isAllowedRedirectUrl(url: string): boolean {
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.ADMIN_PANEL_URL,
        'http://localhost:3000',
        'http://localhost:3001',
    ].filter(Boolean);

    try {
        const parsedUrl = new URL(url);
        return allowedOrigins.some(origin => {
            if (!origin) return false;
            const allowedUrl = new URL(origin);
            return parsedUrl.origin === allowedUrl.origin;
        });
    } catch {
        return false;
    }
}

// ===========================================
// RATE LIMITING CONFIGURATION
// ===========================================

export const OAUTH_RATE_LIMITS = {
    // Max OAuth attempts per IP per time window
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
};

// ===========================================
// TOKEN CONFIGURATION
// ===========================================

export const TOKEN_CONFIG = {
    // JWT expiration for OAuth users
    jwtExpiresIn: '7d',

    // How long before token expiry to refresh OAuth tokens (in seconds)
    refreshThreshold: 5 * 60, // 5 minutes
};
