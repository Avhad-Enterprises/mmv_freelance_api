// OAuth Controller - Request handlers for OAuth endpoints
// Handles login redirects, callbacks, and provider management

import { Request, Response, NextFunction } from 'express';
import { OAuthService } from './oauth.service';
import {
    OAUTH_COOKIE_OPTIONS,
    OAUTH_COOKIES,
    getOAuthUrls,
    isAllowedRedirectUrl,
    isGoogleConfigured,
    isGoogleEnabled,
    isFacebookConfigured,
    isFacebookEnabled,
    isAppleConfigured,
    isAppleEnabled,
} from './oauth.config';
import { OAuthErrorCode, AppleUserData } from './oauth.interface';
import HttpException from '../../exceptions/HttpException';
import { logger } from '../../utils/logger';

export class OAuthController {
    private oauthService = new OAuthService();

    // ===========================================
    // GOOGLE OAUTH ENDPOINTS
    // ===========================================

    /**
     * GET /oauth/google
     * Initiates Google OAuth flow - redirects user to Google consent screen
     */
    public googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check if Google OAuth is configured
            if (!isGoogleConfigured()) {
                throw new HttpException(503, 'Google login is not available at this time');
            }

            // Optional: Get custom redirect URL from query params
            const customRedirect = req.query.redirect as string | undefined;

            // Validate redirect URL if provided
            if (customRedirect && !isAllowedRedirectUrl(customRedirect)) {
                throw new HttpException(400, 'Invalid redirect URL');
            }

            // Generate authorization URL with state and PKCE
            const { url, state, codeVerifier } = await this.oauthService.generateGoogleAuthUrl(customRedirect);

            // Store state and code verifier in secure HTTP-only cookies
            // These are used to validate the callback and prevent CSRF attacks
            res.cookie(OAUTH_COOKIES.STATE, state, OAUTH_COOKIE_OPTIONS);
            res.cookie(OAUTH_COOKIES.CODE_VERIFIER, codeVerifier, OAUTH_COOKIE_OPTIONS);

            // Store custom redirect URL if provided
            if (customRedirect) {
                res.cookie(OAUTH_COOKIES.REDIRECT_URL, customRedirect, OAUTH_COOKIE_OPTIONS);
            }

            // Redirect user to Google consent screen
            res.redirect(url);

        } catch (error) {
            logger.error('Google OAuth initiation failed:', error);
            next(error);
        }
    };

    /**
     * GET /oauth/google/callback
     * Handles Google OAuth callback after user grants permission
     */
    public googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { code, state, error, error_description } = req.query;

            // Handle errors from Google (user denied access, etc.)
            if (error) {
                logger.warn(`Google OAuth error: ${error} - ${error_description}`);
                return this.handleOAuthError(res, error as string, error_description as string);
            }

            // Get stored values from cookies
            const storedState = req.cookies[OAUTH_COOKIES.STATE];
            const codeVerifier = req.cookies[OAUTH_COOKIES.CODE_VERIFIER];
            const customRedirect = req.cookies[OAUTH_COOKIES.REDIRECT_URL];

            // Clear OAuth cookies immediately (they're single-use)
            res.clearCookie(OAUTH_COOKIES.STATE);
            res.clearCookie(OAUTH_COOKIES.CODE_VERIFIER);
            res.clearCookie(OAUTH_COOKIES.REDIRECT_URL);

            // Validate required parameters
            if (!code) {
                logger.warn('Google OAuth callback missing authorization code');
                return this.handleOAuthError(res, 'invalid_request', 'Missing authorization code');
            }

            if (!state) {
                logger.warn('Google OAuth callback missing state parameter');
                return this.handleOAuthError(res, 'invalid_request', 'Missing state parameter');
            }

            // CSRF Protection: Validate state parameter
            // State might contain custom redirect URL (format: state|base64_redirect)
            let actualState = state as string;
            if (actualState.includes('|')) {
                actualState = actualState.split('|')[0];
            }

            if (!storedState) {
                logger.warn('Google OAuth callback missing stored state cookie');
                return this.handleOAuthError(res, 'invalid_state', 'Session expired. Please try again.');
            }

            if (actualState !== storedState) {
                logger.warn(`Google OAuth state mismatch: expected ${storedState}, got ${actualState}`);
                return this.handleOAuthError(res, 'invalid_state', 'State validation failed');
            }

            // Validate code verifier exists (required for PKCE)
            if (!codeVerifier) {
                logger.warn('Google OAuth callback missing code verifier');
                return this.handleOAuthError(res, 'invalid_request', 'PKCE verification failed. Please try again.');
            }

            // Exchange code for tokens and get/create user
            const result = await this.oauthService.handleGoogleCallback(
                code as string,
                codeVerifier
            );

            // Redirect to frontend with token
            this.handleOAuthSuccess(res, result, customRedirect);

        } catch (error: any) {
            logger.error('Google OAuth callback error:', error);

            // Don't expose internal errors to frontend
            const message = error instanceof HttpException ? error.message : 'Authentication failed';
            this.handleOAuthError(res, 'server_error', message);
        }
    };

    // ===========================================
    // FACEBOOK OAUTH ENDPOINTS
    // ===========================================

    /**
     * GET /oauth/facebook
     * Initiates Facebook OAuth flow - redirects user to Facebook login
     */
    public facebookLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check if Facebook OAuth is enabled
            if (!isFacebookEnabled()) {
                throw new HttpException(503, 'Facebook login is not available at this time');
            }

            // Optional: Get custom redirect URL from query params
            const customRedirect = req.query.redirect as string | undefined;

            // Validate redirect URL if provided
            if (customRedirect && !isAllowedRedirectUrl(customRedirect)) {
                throw new HttpException(400, 'Invalid redirect URL');
            }

            // Generate authorization URL with state
            const { url, state } = await this.oauthService.generateFacebookAuthUrl(customRedirect);

            // Store state in secure HTTP-only cookie
            res.cookie(OAUTH_COOKIES.STATE, state, OAUTH_COOKIE_OPTIONS);

            // Store custom redirect URL if provided
            if (customRedirect) {
                res.cookie(OAUTH_COOKIES.REDIRECT_URL, customRedirect, OAUTH_COOKIE_OPTIONS);
            }

            // Redirect user to Facebook login
            res.redirect(url);

        } catch (error) {
            logger.error('Facebook OAuth initiation failed:', error);
            next(error);
        }
    };

    /**
     * GET /oauth/facebook/callback
     * Handles Facebook OAuth callback after user grants permission
     */
    public facebookCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { code, state, error, error_description } = req.query;

            // Handle errors from Facebook (user denied access, etc.)
            if (error) {
                logger.warn(`Facebook OAuth error: ${error} - ${error_description}`);
                return this.handleOAuthError(res, error as string, error_description as string);
            }

            // Get stored values from cookies
            const storedState = req.cookies[OAUTH_COOKIES.STATE];
            const customRedirect = req.cookies[OAUTH_COOKIES.REDIRECT_URL];

            // Clear OAuth cookies immediately (they're single-use)
            res.clearCookie(OAUTH_COOKIES.STATE);
            res.clearCookie(OAUTH_COOKIES.REDIRECT_URL);

            // Validate required parameters
            if (!code) {
                logger.warn('Facebook OAuth callback missing authorization code');
                return this.handleOAuthError(res, 'invalid_request', 'Missing authorization code');
            }

            if (!state) {
                logger.warn('Facebook OAuth callback missing state parameter');
                return this.handleOAuthError(res, 'invalid_request', 'Missing state parameter');
            }

            // CSRF Protection: Validate state parameter
            let actualState = state as string;
            if (actualState.includes('|')) {
                actualState = actualState.split('|')[0];
            }

            if (!storedState) {
                logger.warn('Facebook OAuth callback missing stored state cookie');
                return this.handleOAuthError(res, 'invalid_state', 'Session expired. Please try again.');
            }

            if (actualState !== storedState) {
                logger.warn(`Facebook OAuth state mismatch: expected ${storedState}, got ${actualState}`);
                return this.handleOAuthError(res, 'invalid_state', 'State validation failed');
            }

            // Exchange code for tokens and get/create user
            const result = await this.oauthService.handleFacebookCallback(code as string);

            // Redirect to frontend with token
            this.handleOAuthSuccess(res, result, customRedirect);

        } catch (error: any) {
            logger.error('Facebook OAuth callback error:', error);

            // Don't expose internal errors to frontend
            const message = error instanceof HttpException ? error.message : 'Authentication failed';
            this.handleOAuthError(res, 'server_error', message);
        }
    };

    // ===========================================
    // APPLE OAUTH ENDPOINTS
    // ===========================================

    /**
     * GET /oauth/apple
     * Initiates Apple OAuth flow - redirects user to Apple login
     */
    public appleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check if Apple OAuth is enabled
            if (!isAppleEnabled()) {
                throw new HttpException(503, 'Apple login is not available at this time');
            }

            // Optional: Get custom redirect URL from query params
            const customRedirect = req.query.redirect as string | undefined;

            // Validate redirect URL if provided
            if (customRedirect && !isAllowedRedirectUrl(customRedirect)) {
                throw new HttpException(400, 'Invalid redirect URL');
            }

            // Generate authorization URL with state
            const { url, state } = await this.oauthService.generateAppleAuthUrl(customRedirect);

            // Store state in secure HTTP-only cookie
            res.cookie(OAUTH_COOKIES.STATE, state, OAUTH_COOKIE_OPTIONS);

            // Store custom redirect URL if provided
            if (customRedirect) {
                res.cookie(OAUTH_COOKIES.REDIRECT_URL, customRedirect, OAUTH_COOKIE_OPTIONS);
            }

            // Redirect user to Apple login
            res.redirect(url);

        } catch (error) {
            logger.error('Apple OAuth initiation failed:', error);
            next(error);
        }
    };

    /**
     * POST /oauth/apple/callback
     * Handles Apple OAuth callback - NOTE: Apple uses POST!
     * Apple sends data in request body, not query params
     */
    public appleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Apple sends callback data in POST body
            const { code, state, id_token, user, error: appleError } = req.body;

            // Handle errors from Apple
            if (appleError) {
                logger.warn(`Apple OAuth error: ${appleError}`);
                return this.handleOAuthError(res, appleError as string, 'Apple authentication failed');
            }

            // Get stored values from cookies
            const storedState = req.cookies[OAUTH_COOKIES.STATE];
            const customRedirect = req.cookies[OAUTH_COOKIES.REDIRECT_URL];

            // Clear OAuth cookies immediately
            res.clearCookie(OAUTH_COOKIES.STATE);
            res.clearCookie(OAUTH_COOKIES.REDIRECT_URL);

            // Validate required parameters
            if (!code) {
                logger.warn('Apple OAuth callback missing authorization code');
                return this.handleOAuthError(res, 'invalid_request', 'Missing authorization code');
            }

            if (!state) {
                logger.warn('Apple OAuth callback missing state parameter');
                return this.handleOAuthError(res, 'invalid_request', 'Missing state parameter');
            }

            // CSRF Protection: Validate state parameter
            let actualState = state as string;
            if (actualState.includes('|')) {
                actualState = actualState.split('|')[0];
            }

            if (!storedState) {
                logger.warn('Apple OAuth callback missing stored state cookie');
                return this.handleOAuthError(res, 'invalid_state', 'Session expired. Please try again.');
            }

            if (actualState !== storedState) {
                logger.warn(`Apple OAuth state mismatch: expected ${storedState}, got ${actualState}`);
                return this.handleOAuthError(res, 'invalid_state', 'State validation failed');
            }

            // Parse user data (only provided on first authorization)
            let userData: AppleUserData | null = null;
            if (user) {
                try {
                    userData = typeof user === 'string' ? JSON.parse(user) : user;
                } catch (e) {
                    logger.warn('Apple OAuth: Failed to parse user data', e);
                }
            }

            // Exchange code for tokens and get/create user
            const result = await this.oauthService.handleAppleCallback(
                code as string,
                id_token as string,
                userData
            );

            // Redirect to frontend with token
            this.handleOAuthSuccess(res, result, customRedirect);

        } catch (error: any) {
            logger.error('Apple OAuth callback error:', error);

            // Don't expose internal errors to frontend
            const message = error instanceof HttpException ? error.message : 'Authentication failed';
            this.handleOAuthError(res, 'server_error', message);
        }
    };

    // ===========================================
    // API ENDPOINTS (JSON Responses)
    // ===========================================

    /**
     * GET /oauth/providers
     * Returns list of available OAuth providers
     */
    public getProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const providers = this.oauthService.getAvailableProviders();

            res.json({
                success: true,
                message: 'OAuth providers retrieved successfully',
                data: {
                    providers: providers.map(p => ({
                        name: p.name,
                        displayName: p.displayName,
                        enabled: p.enabled,
                        icon: p.icon,
                    })),
                },
            });

        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /oauth/linked
     * Returns list of OAuth providers linked to the current user
     * Requires authentication
     */
    public getLinkedProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.user_id;

            if (!userId) {
                throw new HttpException(401, 'Authentication required');
            }

            const linkedProviders = await this.oauthService.getLinkedProviders(userId);

            res.json({
                success: true,
                message: 'Linked providers retrieved successfully',
                data: {
                    providers: linkedProviders,
                },
            });

        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /oauth/unlink/:provider
     * Unlinks an OAuth provider from the user's account
     * Requires authentication
     */
    public unlinkProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.user_id;
            const { provider } = req.params;

            if (!userId) {
                throw new HttpException(401, 'Authentication required');
            }

            // Validate provider name
            const validProviders = ['google', 'facebook', 'apple'];
            if (!validProviders.includes(provider.toLowerCase())) {
                throw new HttpException(400, `Invalid provider: ${provider}`);
            }

            await this.oauthService.unlinkProvider(userId, provider.toLowerCase());

            res.json({
                success: true,
                message: `${this.capitalizeFirst(provider)} account unlinked successfully`,
            });

        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /oauth/refresh
     * Refresh OAuth access token (for API calls to provider)
     * Requires authentication
     */
    public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.user_id;
            const { provider } = req.body;

            if (!userId) {
                throw new HttpException(401, 'Authentication required');
            }

            if (provider !== 'google') {
                throw new HttpException(400, 'Token refresh is only available for Google');
            }

            const tokens = await this.oauthService.refreshGoogleToken(userId);

            if (!tokens) {
                throw new HttpException(400, 'Unable to refresh token. Please re-authenticate with Google.');
            }

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: tokens.accessToken,
                    expiresAt: tokens.expiresAt,
                },
            });

        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /oauth/set-role
     * Set role for new OAuth user (during registration flow)
     * Requires authentication
     */
    public setRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.user_id;
            const { role } = req.body;

            if (!userId) {
                throw new HttpException(401, 'Authentication required');
            }

            // Validate role
            const validRoles = ['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR'];
            if (!role || !validRoles.includes(role.toUpperCase())) {
                throw new HttpException(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
            }

            // Set the user's role and get new token
            const normalizedRole = role.toUpperCase();
            const result = await this.oauthService.setUserRole(userId, normalizedRole);

            // Determine redirect based on role
            const redirect = normalizedRole === 'CLIENT'
                ? '/dashboard/client-dashboard'
                : '/dashboard/freelancer-dashboard';

            logger.info(`User ${userId} set role to ${normalizedRole}`);

            // Build response message including signup bonus info
            let message = 'Role set successfully';
            if (result.signupBonus?.success) {
                message = `Role set successfully! ${result.signupBonus.message}`;
            }

            res.json({
                success: true,
                message,
                data: {
                    user_id: userId,
                    role: normalizedRole,
                    redirect,
                    token: result.token, // New JWT with updated roles
                    signupBonus: result.signupBonus, // Include signup bonus info
                },
            });

        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /oauth/role-status
     * Check if user has completed role selection
     * Requires authentication
     */
    public getRoleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.user_id;

            if (!userId) {
                throw new HttpException(401, 'Authentication required');
            }

            const roleStatus = await this.oauthService.getUserRoleStatus(userId);

            res.json({
                success: true,
                data: roleStatus,
            });

        } catch (error) {
            next(error);
        }
    };

    // ===========================================
    // HELPER METHODS
    // ===========================================

    /**
     * Handle successful OAuth authentication
     * Redirects to frontend with token in URL
     */
    private handleOAuthSuccess(res: Response, result: any, customRedirect?: string): void {
        const urls = getOAuthUrls();

        // Use custom redirect if provided and valid, otherwise use default
        let redirectUrl = urls.success;
        if (customRedirect && isAllowedRedirectUrl(customRedirect)) {
            redirectUrl = customRedirect;
        }

        // Build redirect URL with query parameters
        const params = new URLSearchParams({
            token: result.token,
            isNewUser: String(result.isNewUser),
            provider: result.user.oauth_provider,
        });

        // Add user info (optional, frontend can decode JWT instead)
        params.set('userId', String(result.user.user_id));

        res.redirect(`${redirectUrl}?${params.toString()}`);
    }

    /**
     * Handle OAuth errors
     * Redirects to frontend error page with error details
     */
    private handleOAuthError(res: Response, error: string, description?: string): void {
        const urls = getOAuthUrls();

        const errorMessages: Record<string, string> = {
            'access_denied': 'You cancelled the login or denied permission.',
            'invalid_state': 'Your session has expired. Please try again.',
            'invalid_request': 'The authentication request was invalid.',
            'server_error': 'An error occurred during authentication.',
            'temporarily_unavailable': 'The service is temporarily unavailable.',
            'invalid_grant': 'The authorization code has expired. Please try again.',
        };

        const message = description || errorMessages[error] || 'Authentication failed. Please try again.';

        const params = new URLSearchParams({
            error,
            message,
        });

        res.redirect(`${urls.error}?${params.toString()}`);
    }

    /**
     * Capitalize first letter
     */
    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}

export default OAuthController;
