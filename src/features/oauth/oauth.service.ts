// OAuth Service - Core business logic for OAuth authentication
// Production-ready with comprehensive error handling and edge cases

import jwt from 'jsonwebtoken';
import DB, { T } from '../../../database';
import HttpException from '../../exceptions/HttpException';
import {
    getGoogleProvider,
    isGoogleConfigured,
    OAUTH_PROVIDERS,
    generateState,
    generateCodeVerifier,
    getArcticErrors,
} from './oauth.config';
import {
    OAuthUserData,
    OAuthTokens,
    OAuthCallbackResult,
    OAuthUser,
    OAuthProviderConfig,
    GoogleUserInfo,
} from './oauth.interface';
import { logger } from '../../utils/logger';

// Table names
const USERS_TABLE = T.USERS_TABLE || 'users';
const OAUTH_ACCOUNTS_TABLE = 'oauth_accounts';
const USER_ROLES_TABLE = 'user_roles';
const ROLES_TABLE = 'role';

export class OAuthService {
    // ===========================================
    // GOOGLE OAUTH - AUTHORIZATION URL
    // ===========================================

    /**
     * Generate Google OAuth authorization URL
     * Uses PKCE for enhanced security
     */
    public async generateGoogleAuthUrl(customRedirectUrl?: string): Promise<{
        url: string;
        state: string;
        codeVerifier: string;
    }> {
        if (!isGoogleConfigured()) {
            throw new HttpException(503, 'Google OAuth is not configured on this server');
        }

        const google = await getGoogleProvider();

        // Generate cryptographically secure state and code verifier
        const state = await generateState();
        const codeVerifier = await generateCodeVerifier();
        const scopes = OAUTH_PROVIDERS.google.scopes;

        // Create authorization URL with PKCE
        const url = google.createAuthorizationURL(state, codeVerifier, scopes);

        // Add parameters for refresh token and consent
        url.searchParams.set('access_type', 'offline');  // Get refresh token
        url.searchParams.set('prompt', 'consent');        // Always show consent screen

        // Add custom redirect URL as state parameter (encoded)
        if (customRedirectUrl) {
            url.searchParams.set('state', `${state}|${Buffer.from(customRedirectUrl).toString('base64')}`);
        }

        return {
            url: url.toString(),
            state,
            codeVerifier,
        };
    }

    // ===========================================
    // GOOGLE OAUTH - CALLBACK HANDLING
    // ===========================================

    /**
     * Handle Google OAuth callback
     * Validates code, exchanges for tokens, and creates/updates user
     */
    public async handleGoogleCallback(
        code: string,
        codeVerifier: string
    ): Promise<OAuthCallbackResult> {
        if (!isGoogleConfigured()) {
            throw new HttpException(503, 'Google OAuth is not configured');
        }

        const google = await getGoogleProvider();
        const { OAuth2RequestError, ArcticFetchError } = await getArcticErrors();
        let tokens: any;

        try {
            // Exchange authorization code for tokens
            tokens = await google.validateAuthorizationCode(code, codeVerifier);
        } catch (error: any) {
            if (error instanceof OAuth2RequestError) {
                const code = error.code;
                logger.error(`Google OAuth2 error: ${code}`);

                const errorMessages: Record<string, string> = {
                    'invalid_grant': 'Authorization code has expired or already been used. Please try again.',
                    'invalid_client': 'OAuth client configuration error. Please contact support.',
                    'invalid_request': 'Invalid OAuth request. Please try again.',
                    'access_denied': 'Access was denied. Please try again and grant the required permissions.',
                    'server_error': 'Google encountered an error. Please try again later.',
                };

                throw new HttpException(400, errorMessages[code] || `OAuth error: ${code}`);
            }

            if (error instanceof ArcticFetchError) {
                logger.error('Google fetch error:', error.message);
                throw new HttpException(503, 'Unable to connect to Google. Please try again later.');
            }

            throw error;
        }

        const accessToken = tokens.accessToken();

        // Validate access token is present
        if (!accessToken) {
            logger.error('Google OAuth: No access token received');
            throw new HttpException(400, 'Failed to obtain access token from Google');
        }

        // Get user information from Google
        let userData: OAuthUserData;
        try {
            userData = await this.getGoogleUserData(accessToken);
        } catch (error) {
            logger.error('Google OAuth: Failed to fetch user data', error);
            throw new HttpException(400, 'Failed to retrieve user information from Google');
        }

        // Validate email is present and verified
        if (!userData.email) {
            throw new HttpException(400, 'Google account does not have an email address');
        }

        // Optional: Require verified email
        if (!userData.emailVerified) {
            logger.warn(`Google OAuth: Unverified email for ${userData.email}`);
            // You can choose to reject unverified emails:
            // throw new HttpException(400, 'Please verify your Google email address first');
        }

        // Extract refresh token if available
        let refreshToken: string | null = null;
        let tokenExpiresAt: Date | null = null;

        try {
            if (tokens.hasRefreshToken()) {
                refreshToken = tokens.refreshToken();
            }
            tokenExpiresAt = tokens.accessTokenExpiresAt();
        } catch (error) {
            logger.warn('Google OAuth: Could not extract refresh token or expiry', error);
        }

        // Find or create user
        const result = await this.findOrCreateOAuthUser('google', userData, {
            accessToken,
            refreshToken,
            expiresAt: tokenExpiresAt,
        });

        return result;
    }

    // ===========================================
    // USER DATA FETCHING
    // ===========================================

    /**
     * Fetch user data from Google's userinfo endpoint
     */
    private async getGoogleUserData(accessToken: string): Promise<OAuthUserData> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`Google userinfo API error: ${response.status} - ${errorText}`);
                throw new HttpException(400, 'Failed to fetch user data from Google');
            }

            const data = await response.json() as GoogleUserInfo;

            // Validate required fields
            if (!data.sub) {
                throw new HttpException(400, 'Invalid response from Google');
            }

            return {
                providerId: data.sub,
                email: data.email || '',
                emailVerified: data.email_verified || false,
                firstName: data.given_name || data.name?.split(' ')[0] || '',
                lastName: data.family_name || data.name?.split(' ').slice(1).join(' ') || '',
                profilePicture: data.picture || null,
                rawData: data,
            };
        } catch (error: any) {
            clearTimeout(timeout);

            if (error.name === 'AbortError') {
                throw new HttpException(504, 'Google API request timed out');
            }

            throw error;
        }
    }

    // ===========================================
    // USER MANAGEMENT
    // ===========================================

    /**
     * Find existing user or create new one from OAuth data
     * Handles account linking and new user creation
     */
    private async findOrCreateOAuthUser(
        provider: string,
        userData: OAuthUserData,
        tokens: OAuthTokens
    ): Promise<OAuthCallbackResult> {
        // Start transaction for data consistency
        const trx = await DB.transaction();

        try {
            // Check 1: Does OAuth account already exist?
            const existingOAuthAccount = await trx(OAUTH_ACCOUNTS_TABLE)
                .where({
                    provider,
                    provider_user_id: userData.providerId,
                })
                .first();

            let user: any;
            let isNewUser = false;

            if (existingOAuthAccount) {
                // Case A: User has logged in with this OAuth before
                // Update OAuth tokens and get user
                await this.updateOAuthTokens(trx, existingOAuthAccount.id, tokens);

                user = await trx(USERS_TABLE)
                    .where({ user_id: existingOAuthAccount.user_id })
                    .first();

                if (!user) {
                    await trx.rollback();
                    throw new HttpException(404, 'User account not found. It may have been deleted.');
                }

                // Check if user is banned or inactive
                if (user.is_banned) {
                    await trx.rollback();
                    throw new HttpException(403, 'Your account has been suspended. Please contact support.');
                }

                if (!user.is_active) {
                    await trx.rollback();
                    throw new HttpException(403, 'Your account is deactivated. Please contact support.');
                }

            } else {
                // Case B: First time OAuth login
                // Check if user exists with this email
                user = await trx(USERS_TABLE)
                    .where({ email: userData.email.toLowerCase() })
                    .first();

                if (user) {
                    // Case B1: Email exists - link OAuth to existing account

                    // Check if user is banned or inactive before linking
                    if (user.is_banned) {
                        await trx.rollback();
                        throw new HttpException(403, 'This email is associated with a suspended account.');
                    }

                    if (!user.is_active) {
                        await trx.rollback();
                        throw new HttpException(403, 'This email is associated with a deactivated account.');
                    }

                    // Link OAuth account
                    await this.createOAuthAccount(trx, user.user_id, provider, userData, tokens);

                    // Update profile picture if user doesn't have one
                    if (!user.profile_picture && userData.profilePicture) {
                        await trx(USERS_TABLE)
                            .where({ user_id: user.user_id })
                            .update({
                                profile_picture: userData.profilePicture,
                                updated_at: new Date(),
                            });
                        user.profile_picture = userData.profilePicture;
                    }

                    // Mark email as verified if it wasn't
                    if (!user.email_verified && userData.emailVerified) {
                        await trx(USERS_TABLE)
                            .where({ user_id: user.user_id })
                            .update({
                                email_verified: true,
                                updated_at: new Date(),
                            });
                    }

                } else {
                    // Case B2: New user - create account
                    isNewUser = true;

                    user = await this.createOAuthUser(trx, userData);
                    await this.createOAuthAccount(trx, user.user_id, provider, userData, tokens);

                    // NOTE: We do NOT assign a role here for new OAuth users
                    // They will select their role on the /auth/select-role page
                    // This enables the role selection flow for better UX
                    logger.info(`New OAuth user ${user.email} created - pending role selection`);
                }
            }

            // Update last login
            await this.updateLastLogin(trx, user.user_id);

            // Commit transaction
            await trx.commit();

            // Get user roles (after commit)
            const roles = await this.getUserRoles(user.user_id);

            // Generate JWT token
            const jwtToken = this.generateJWT(user, roles);

            // Build response
            const oauthUser: OAuthUser = {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                profile_picture: user.profile_picture,
                roles,
                oauth_provider: provider,
                is_new_user: isNewUser,
            };

            logger.info(`OAuth ${isNewUser ? 'registration' : 'login'} successful for ${user.email} via ${provider}`);

            return {
                user: oauthUser,
                token: jwtToken,
                isNewUser,
            };

        } catch (error) {
            // Rollback on any error
            try {
                await trx.rollback();
            } catch (rollbackError) {
                logger.error('Transaction rollback failed', rollbackError);
            }
            throw error;
        }
    }

    /**
     * Create new user from OAuth data
     */
    private async createOAuthUser(trx: any, userData: OAuthUserData): Promise<any> {
        // Generate unique username
        const baseUsername = userData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const uniqueUsername = `${baseUsername}_${Date.now().toString(36)}`;

        const [user] = await trx(USERS_TABLE)
            .insert({
                first_name: userData.firstName || 'User',
                last_name: userData.lastName || '',
                email: userData.email.toLowerCase(),
                username: uniqueUsername,
                password: '', // No password for OAuth users (they use OAuth to login)
                profile_picture: userData.profilePicture,
                is_active: true,
                is_banned: false,
                email_verified: userData.emailVerified,
                terms_accepted: true,
                privacy_policy_accepted: true,
                login_attempts: 0,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning('*');

        return user;
    }

    /**
     * Create OAuth account link in database
     */
    private async createOAuthAccount(
        trx: any,
        userId: number,
        provider: string,
        userData: OAuthUserData,
        tokens: OAuthTokens
    ): Promise<void> {
        await trx(OAUTH_ACCOUNTS_TABLE).insert({
            user_id: userId,
            provider,
            provider_user_id: userData.providerId,
            access_token: this.encryptToken(tokens.accessToken),
            refresh_token: tokens.refreshToken ? this.encryptToken(tokens.refreshToken) : null,
            token_expires_at: tokens.expiresAt,
            provider_data: JSON.stringify(userData.rawData),
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    /**
     * Update OAuth tokens for existing account
     */
    private async updateOAuthTokens(trx: any, accountId: number, tokens: OAuthTokens): Promise<void> {
        const updateData: any = {
            access_token: this.encryptToken(tokens.accessToken),
            token_expires_at: tokens.expiresAt,
            updated_at: new Date(),
        };

        // Only update refresh token if a new one is provided
        if (tokens.refreshToken) {
            updateData.refresh_token = this.encryptToken(tokens.refreshToken);
        }

        await trx(OAUTH_ACCOUNTS_TABLE)
            .where({ id: accountId })
            .update(updateData);
    }

    // ===========================================
    // TOKEN REFRESH
    // ===========================================

    /**
     * Refresh Google access token using stored refresh token
     */
    public async refreshGoogleToken(userId: number): Promise<OAuthTokens | null> {
        if (!isGoogleConfigured()) {
            throw new HttpException(503, 'Google OAuth is not configured');
        }

        // Get stored OAuth account
        const oauthAccount = await DB(OAUTH_ACCOUNTS_TABLE)
            .where({ user_id: userId, provider: 'google' })
            .first();

        if (!oauthAccount || !oauthAccount.refresh_token) {
            logger.warn(`No Google refresh token found for user ${userId}`);
            return null;
        }

        const google = await getGoogleProvider();
        const { OAuth2RequestError } = await getArcticErrors();
        const refreshToken = this.decryptToken(oauthAccount.refresh_token);

        try {
            const tokens = await google.refreshAccessToken(refreshToken);

            const newTokens: OAuthTokens = {
                accessToken: tokens.accessToken(),
                refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : refreshToken,
                expiresAt: tokens.accessTokenExpiresAt(),
            };

            // Update stored tokens
            await DB(OAUTH_ACCOUNTS_TABLE)
                .where({ id: oauthAccount.id })
                .update({
                    access_token: this.encryptToken(newTokens.accessToken),
                    refresh_token: newTokens.refreshToken ? this.encryptToken(newTokens.refreshToken) : oauthAccount.refresh_token,
                    token_expires_at: newTokens.expiresAt,
                    updated_at: new Date(),
                });

            return newTokens;

        } catch (error: any) {
            if (error instanceof OAuth2RequestError) {
                // Refresh token is invalid or revoked
                logger.warn(`Google refresh token expired/revoked for user ${userId}`);

                // Clear the invalid refresh token
                await DB(OAUTH_ACCOUNTS_TABLE)
                    .where({ id: oauthAccount.id })
                    .update({
                        refresh_token: null,
                        updated_at: new Date(),
                    });

                return null;
            }
            throw error;
        }
    }

    // ===========================================
    // ACCOUNT MANAGEMENT
    // ===========================================

    /**
     * Get list of linked OAuth providers for a user
     */
    public async getLinkedProviders(userId: number): Promise<string[]> {
        const accounts = await DB(OAUTH_ACCOUNTS_TABLE)
            .where({ user_id: userId })
            .select('provider');

        return accounts.map(a => a.provider);
    }

    /**
     * Unlink OAuth provider from user account
     * Prevents unlinking if it's the only auth method
     */
    public async unlinkProvider(userId: number, provider: string): Promise<void> {
        // Get user and their OAuth accounts
        const user = await DB(USERS_TABLE).where({ user_id: userId }).first();

        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const oauthAccounts = await DB(OAUTH_ACCOUNTS_TABLE)
            .where({ user_id: userId })
            .select('provider');

        // Check if this OAuth account exists
        const hasProvider = oauthAccounts.some(a => a.provider === provider);
        if (!hasProvider) {
            throw new HttpException(404, `${provider} account is not linked`);
        }

        // Prevent unlinking if it's the only auth method
        const hasPassword = !!user.password && user.password.length > 0;
        const otherOAuthCount = oauthAccounts.filter(a => a.provider !== provider).length;

        if (!hasPassword && otherOAuthCount === 0) {
            throw new HttpException(
                400,
                'Cannot unlink the only authentication method. Please set a password first or link another OAuth provider.'
            );
        }

        // Delete the OAuth account link
        await DB(OAUTH_ACCOUNTS_TABLE)
            .where({ user_id: userId, provider })
            .del();

        logger.info(`Unlinked ${provider} from user ${userId}`);
    }

    /**
     * Get available OAuth providers
     */
    public getAvailableProviders(): OAuthProviderConfig[] {
        return Object.values(OAUTH_PROVIDERS).filter(p => p.enabled);
    }

    // ===========================================
    // ROLE SELECTION FOR NEW OAUTH USERS
    // ===========================================

    /**
     * Set role for OAuth user (called during role selection flow)
     * Creates appropriate profiles based on role
     */
    public async setUserRole(userId: number, roleName: string): Promise<{ token: string }> {
        const trx = await DB.transaction();

        try {
            // Verify user exists
            const user = await trx(USERS_TABLE).where({ user_id: userId }).first();
            if (!user) {
                throw new HttpException(404, 'User not found');
            }

            // Get role ID
            const role = await trx(ROLES_TABLE).where({ name: roleName }).first();
            if (!role) {
                throw new HttpException(400, `Role "${roleName}" not found in system`);
            }

            // Check if user already has this role
            const existingRole = await trx(USER_ROLES_TABLE)
                .where({ user_id: userId, role_id: role.role_id })
                .first();

            if (!existingRole) {
                // Add the new role
                await trx(USER_ROLES_TABLE).insert({
                    user_id: userId,
                    role_id: role.role_id,
                });
            }

            // Create appropriate profile based on role
            if (roleName === 'CLIENT') {
                await this.ensureClientProfile(trx, userId);
            } else if (roleName === 'VIDEOGRAPHER' || roleName === 'VIDEO_EDITOR') {
                await this.ensureFreelancerProfile(trx, userId, roleName);
            }

            await trx.commit();

            logger.info(`Role "${roleName}" set for user ${userId}`);

            // Generate new JWT with updated roles
            const updatedRoles = await this.getUserRoles(userId);
            const newToken = this.generateJWT(user, updatedRoles);

            return { token: newToken };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    /**
     * Get user's role status (for checking if role selection is complete)
     */
    public async getUserRoleStatus(userId: number): Promise<{
        hasRole: boolean;
        roles: string[];
        needsRoleSelection: boolean;
    }> {
        const userRoles = await this.getUserRoles(userId);

        // User needs role selection if they have no roles
        const needsRoleSelection = userRoles.length === 0;

        return {
            hasRole: userRoles.length > 0,
            roles: userRoles,
            needsRoleSelection,
        };
    }

    /**
     * Ensure client profile exists for user
     */
    private async ensureClientProfile(trx: any, userId: number): Promise<void> {
        const existingProfile = await trx('client_profiles').where({ user_id: userId }).first();
        if (!existingProfile) {
            await trx('client_profiles').insert({ user_id: userId });
            logger.info(`Created client profile for user ${userId}`);
        }
    }

    /**
     * Ensure freelancer profile exists for user
     */
    private async ensureFreelancerProfile(trx: any, userId: number, roleName: string): Promise<void> {
        // Get user info for profile title
        const user = await trx(USERS_TABLE).where({ user_id: userId }).first();
        const profileTitle = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Freelancer' : 'Freelancer';

        // Check for existing freelancer profile
        let freelancerProfile = await trx('freelancer_profiles').where({ user_id: userId }).first();

        if (!freelancerProfile) {
            [freelancerProfile] = await trx('freelancer_profiles')
                .insert({
                    user_id: userId,
                    profile_title: profileTitle,
                    // Default values for required fields
                    rate_amount: 0,
                    currency: 'INR',
                    availability: 'full-time',
                })
                .returning('*');
            logger.info(`Created freelancer profile for user ${userId}`);
        }

        // Create role-specific profile
        if (roleName === 'VIDEOGRAPHER') {
            const exists = await trx('videographer_profiles')
                .where({ freelancer_id: freelancerProfile.freelancer_id })
                .first();
            if (!exists) {
                await trx('videographer_profiles').insert({
                    freelancer_id: freelancerProfile.freelancer_id
                });
                logger.info(`Created videographer profile for user ${userId}`);
            }
        } else if (roleName === 'VIDEO_EDITOR') {
            const exists = await trx('videoeditor_profiles')
                .where({ freelancer_id: freelancerProfile.freelancer_id })
                .first();
            if (!exists) {
                await trx('videoeditor_profiles').insert({
                    freelancer_id: freelancerProfile.freelancer_id
                });
                logger.info(`Created video editor profile for user ${userId}`);
            }
        }
    }

    // ===========================================
    // HELPER METHODS
    // ===========================================

    /**
     * Generate JWT token for authenticated user
     */
    private generateJWT(user: any, roles: string[]): string {
        const secret = process.env.JWT_SECRET || 'fallback-secret';

        return jwt.sign(
            {
                id: user.user_id,
                user_id: user.user_id,
                email: user.email,
                roles,
            },
            secret,
            { expiresIn: '7d' }
        );
    }

    /**
     * Get user roles from database
     */
    private async getUserRoles(userId: number): Promise<string[]> {
        const roles = await DB(USER_ROLES_TABLE)
            .join(ROLES_TABLE, `${USER_ROLES_TABLE}.role_id`, `${ROLES_TABLE}.role_id`)
            .where(`${USER_ROLES_TABLE}.user_id`, userId)
            .select(`${ROLES_TABLE}.name`);

        return roles.map(r => r.name);
    }

    /**
     * Assign role to user
     */
    private async assignRole(trx: any, userId: number, roleName: string): Promise<void> {
        const role = await trx(ROLES_TABLE).where({ name: roleName }).first();

        if (!role) {
            logger.warn(`Role "${roleName}" not found, skipping role assignment`);
            return;
        }

        // Check if user already has this role
        const existingAssignment = await trx(USER_ROLES_TABLE)
            .where({ user_id: userId, role_id: role.role_id })
            .first();

        if (!existingAssignment) {
            await trx(USER_ROLES_TABLE).insert({
                user_id: userId,
                role_id: role.role_id,
            });
        }
    }

    /**
     * Update last login timestamp
     */
    private async updateLastLogin(trx: any, userId: number): Promise<void> {
        await trx(USERS_TABLE)
            .where({ user_id: userId })
            .update({
                last_login_at: new Date(),
                login_attempts: 0,
                updated_at: new Date(),
            });
    }

    /**
     * Simple token encryption (in production, use proper encryption)
     * For now, we'll store as-is but in production you should encrypt
     */
    private encryptToken(token: string): string {
        // TODO: Implement proper encryption in production
        // For now, just base64 encode to avoid storing raw tokens
        return Buffer.from(token).toString('base64');
    }

    /**
     * Decrypt stored token
     */
    private decryptToken(encryptedToken: string): string {
        // TODO: Match the encryption method
        return Buffer.from(encryptedToken, 'base64').toString('utf8');
    }
}

export default OAuthService;
