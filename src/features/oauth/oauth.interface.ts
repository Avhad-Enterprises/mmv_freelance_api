// OAuth TypeScript Interfaces
// This file defines all types used in the OAuth module

/**
 * User data extracted from OAuth provider response
 */
export interface OAuthUserData {
    providerId: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    rawData: Record<string, any>;
}

/**
 * OAuth tokens from provider
 */
export interface OAuthTokens {
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
}

/**
 * OAuth account record in database
 */
export interface OAuthAccountRecord {
    id: number;
    user_id: number;
    provider: string;
    provider_user_id: string;
    access_token: string | null;
    refresh_token: string | null;
    token_expires_at: Date | null;
    provider_data: Record<string, any> | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * Result returned after successful OAuth authentication
 */
export interface OAuthCallbackResult {
    user: OAuthUser;
    token: string;
    isNewUser: boolean;
}

/**
 * User object returned in OAuth response
 */
export interface OAuthUser {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_picture: string | null;
    roles: string[];
    oauth_provider: string;
    is_new_user?: boolean;
}

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
    name: string;
    displayName: string;
    enabled: boolean;
    scopes: string[];
    icon?: string;
}

/**
 * Available OAuth providers
 */
export type OAuthProvider = 'google' | 'facebook' | 'apple';

/**
 * OAuth state data stored in session/cookie
 */
export interface OAuthStateData {
    state: string;
    codeVerifier?: string;  // For PKCE (Google)
    redirectUrl?: string;   // Where to redirect after OAuth
    createdAt: number;      // Timestamp for expiration check
}

/**
 * Google user info response
 */
export interface GoogleUserInfo {
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale?: string;
}

/**
 * Facebook user info response (from Graph API)
 */
export interface FacebookUserInfo {
    id: string;
    name: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    picture?: {
        data: {
            url: string;
            width: number;
            height: number;
            is_silhouette: boolean;
        };
    };
}

/**
 * Apple ID token payload (decoded JWT)
 */
export interface AppleIdToken {
    iss: string;            // "https://appleid.apple.com"
    aud: string;            // Your client_id (Service ID)
    exp: number;            // Expiration time
    iat: number;            // Issued at
    sub: string;            // User ID (unique, stable)
    email?: string;         // User email (may be private relay)
    email_verified?: string; // "true" or "false"
    is_private_email?: string; // "true" if using private relay
    auth_time: number;      // When the user authenticated
    nonce_supported: boolean;
}

/**
 * Apple user data (only sent on first authorization)
 */
export interface AppleUserData {
    name?: {
        firstName?: string;
        lastName?: string;
    };
    email?: string;
}

/**
 * OAuth error types
 */
export type OAuthErrorCode =
    | 'access_denied'
    | 'invalid_state'
    | 'invalid_request'
    | 'invalid_grant'
    | 'server_error'
    | 'temporarily_unavailable'
    | 'email_not_verified'
    | 'account_disabled'
    | 'provider_error'
    | 'token_expired'
    | 'unknown_error';

/**
 * OAuth error response
 */
export interface OAuthError {
    code: OAuthErrorCode;
    message: string;
    provider?: string;
    details?: string;
}

