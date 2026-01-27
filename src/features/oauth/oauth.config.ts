// OAuth Provider Configuration
// Centralized configuration for all OAuth providers with feature flags

import { OAuthProviderConfig, OAuthProvider } from './oauth.interface';
import jwt from 'jsonwebtoken';

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

    // Log OAuth provider status
}

// ===========================================
// FEATURE FLAGS
// ===========================================

/**
 * Check if a provider is enabled via environment variable
 * Format: OAUTH_{PROVIDER}_ENABLED=true/false
 */
function isProviderEnabled(provider: string): boolean {
    const envVar = `OAUTH_${provider.toUpperCase()}_ENABLED`;
    const value = process.env[envVar];

    // Default to true if env var not set but credentials exist
    if (value === undefined) {
        return false; // Explicit opt-in required
    }

    return value.toLowerCase() === 'true';
}

export function isGoogleEnabled(): boolean {
    return isProviderEnabled('GOOGLE') && isGoogleConfigured();
}

export function isFacebookEnabled(): boolean {
    return isProviderEnabled('FACEBOOK') && isFacebookConfigured();
}

export function isAppleEnabled(): boolean {
    return isProviderEnabled('APPLE') && isAppleConfigured();
}

// ===========================================
// PROVIDER CONFIGURATIONS (Dynamic based on feature flags)
// ===========================================

/**
 * Get OAuth provider configurations
 * Dynamically returns enabled status based on env vars
 */
export function getOAuthProviders(): Record<OAuthProvider, OAuthProviderConfig> {
    return {
        google: {
            name: 'google',
            displayName: 'Google',
            enabled: isGoogleEnabled(),
            scopes: ['openid', 'profile', 'email'],
            icon: 'google',
        },
        facebook: {
            name: 'facebook',
            displayName: 'Facebook',
            enabled: isFacebookEnabled(),
            scopes: ['email', 'public_profile'],
            icon: 'facebook',
        },
        apple: {
            name: 'apple',
            displayName: 'Apple',
            enabled: isAppleEnabled(),
            scopes: ['name', 'email'],
            icon: 'apple',
        },
    };
}

// Keep OAUTH_PROVIDERS for backward compatibility (but make it a getter)
export const OAUTH_PROVIDERS = new Proxy({} as Record<OAuthProvider, OAuthProviderConfig>, {
    get: (_, prop: string) => {
        const providers = getOAuthProviders();
        return providers[prop as OAuthProvider];
    },
    ownKeys: () => ['google', 'facebook', 'apple'],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
});

// ===========================================
// ARCTIC MODULE (ESM IMPORT)
// ===========================================

// Cache for the arctic module
let arcticModule: typeof import('arctic') | null = null;

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

// ===========================================
// GOOGLE PROVIDER
// ===========================================

let googleProviderInstance: any = null;

/**
 * Check if Google OAuth credentials are configured
 */
export function isGoogleConfigured(): boolean {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Initialize Google OAuth provider (singleton pattern)
 */
export async function getGoogleProvider(): Promise<any> {
    if (googleProviderInstance) {
        return googleProviderInstance;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/v1/oauth/google/callback`;

    if (!clientId || !clientSecret) {
        throw new Error(
            'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
        );
    }

    const arctic = await getArctic();
    googleProviderInstance = new arctic.Google(clientId, clientSecret, redirectUri);
    return googleProviderInstance;
}

// ===========================================
// FACEBOOK PROVIDER
// ===========================================

let facebookProviderInstance: any = null;

/**
 * Check if Facebook OAuth credentials are configured
 */
export function isFacebookConfigured(): boolean {
    return !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
}

/**
 * Initialize Facebook OAuth provider (singleton pattern)
 */
export async function getFacebookProvider(): Promise<any> {
    if (facebookProviderInstance) {
        return facebookProviderInstance;
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI ||
        `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/v1/oauth/facebook/callback`;

    if (!appId || !appSecret) {
        throw new Error(
            'Facebook OAuth is not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.'
        );
    }

    const arctic = await getArctic();
    facebookProviderInstance = new arctic.Facebook(appId, appSecret, redirectUri);
    return facebookProviderInstance;
}

// ===========================================
// APPLE PROVIDER
// ===========================================

let appleProviderInstance: any = null;

/**
 * Check if Apple OAuth credentials are configured
 */
export function isAppleConfigured(): boolean {
    return !!(
        process.env.APPLE_CLIENT_ID &&
        process.env.APPLE_TEAM_ID &&
        process.env.APPLE_KEY_ID &&
        process.env.APPLE_PRIVATE_KEY
    );
}

/**
 * Generate Apple client secret (JWT)
 * Apple requires a JWT signed with your private key instead of a static client secret
 */
export function generateAppleClientSecret(): string {
    const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

    const token = jwt.sign({}, privateKey, {
        algorithm: 'ES256',
        expiresIn: '180d', // Apple recommends max 6 months
        audience: 'https://appleid.apple.com',
        issuer: process.env.APPLE_TEAM_ID!,
        subject: process.env.APPLE_CLIENT_ID!,
        keyid: process.env.APPLE_KEY_ID!,
    });

    return token;
}

/**
 * Initialize Apple OAuth provider (singleton pattern)
 */
export async function getAppleProvider(): Promise<any> {
    if (appleProviderInstance) {
        return appleProviderInstance;
    }

    const clientId = process.env.APPLE_CLIENT_ID;
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    const privateKeyString = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const redirectUri = process.env.APPLE_REDIRECT_URI ||
        `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/v1/oauth/apple/callback`;

    if (!clientId || !teamId || !keyId || !privateKeyString) {
        throw new Error(
            'Apple OAuth is not configured. Please set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY environment variables.'
        );
    }

    const arctic = await getArctic();

    // Convert private key string to Uint8Array (required by Arctic)
    const privateKeyBuffer = new TextEncoder().encode(privateKeyString);

    // Arctic's Apple provider takes credentials and generates the client secret internally
    appleProviderInstance = new arctic.Apple(clientId, teamId, keyId, privateKeyBuffer, redirectUri);
    return appleProviderInstance;
}

// ===========================================
// COMMON UTILITIES
// ===========================================

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
