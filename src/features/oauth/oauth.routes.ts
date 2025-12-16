// OAuth Routes - Route definitions for OAuth endpoints
// Implements secure OAuth 2.0 endpoints with proper middleware

import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { OAuthController } from './oauth.controller';
import authMiddleware from '../../middlewares/auth.middleware';

export class OAuthRoutes implements Route {
    public path = '/oauth';
    public router = Router();
    private controller = new OAuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // ===========================================
        // PUBLIC ENDPOINTS (No authentication required)
        // ===========================================

        /**
         * GET /oauth/providers
         * Get list of available OAuth providers
         * Public endpoint for frontend to show login options
         */
        this.router.get(
            `${this.path}/providers`,
            this.controller.getProviders
        );

        /**
         * GET /oauth/google
         * Initiate Google OAuth flow
         * Redirects user to Google consent screen
         * Optional query param: ?redirect=<custom_redirect_url>
         */
        this.router.get(
            `${this.path}/google`,
            this.controller.googleLogin
        );

        /**
         * GET /oauth/google/callback
         * Handle Google OAuth callback
         * Called by Google after user grants/denies permission
         */
        this.router.get(
            `${this.path}/google/callback`,
            this.controller.googleCallback
        );

        // ===========================================
        // PROTECTED ENDPOINTS (Authentication required)
        // ===========================================

        /**
         * GET /oauth/linked
         * Get OAuth providers linked to current user's account
         * Requires: Valid JWT token
         */
        this.router.get(
            `${this.path}/linked`,
            authMiddleware,
            this.controller.getLinkedProviders
        );

        /**
         * DELETE /oauth/unlink/:provider
         * Unlink an OAuth provider from user's account
         * Requires: Valid JWT token
         * Params: provider (google, facebook, apple)
         */
        this.router.delete(
            `${this.path}/unlink/:provider`,
            authMiddleware,
            this.controller.unlinkProvider
        );

        /**
         * POST /oauth/refresh
         * Refresh OAuth access token
         * Requires: Valid JWT token
         * Body: { provider: 'google' }
         */
        this.router.post(
            `${this.path}/refresh`,
            authMiddleware,
            this.controller.refreshToken
        );

        /**
         * POST /oauth/set-role
         * Set role for new OAuth user during registration
         * Requires: Valid JWT token
         * Body: { role: 'CLIENT' | 'VIDEOGRAPHER' | 'VIDEO_EDITOR' }
         */
        this.router.post(
            `${this.path}/set-role`,
            authMiddleware,
            this.controller.setRole
        );

        /**
         * GET /oauth/role-status
         * Check if user has completed role selection
         * Requires: Valid JWT token
         */
        this.router.get(
            `${this.path}/role-status`,
            authMiddleware,
            this.controller.getRoleStatus
        );

        // ===========================================
        // FACEBOOK OAUTH ROUTES
        // ===========================================

        /**
         * GET /oauth/facebook
         * Initiate Facebook OAuth flow
         * Redirects user to Facebook consent screen
         * Optional query param: ?redirect=<custom_redirect_url>
         */
        this.router.get(
            `${this.path}/facebook`,
            this.controller.facebookLogin
        );

        /**
         * GET /oauth/facebook/callback
         * Handle Facebook OAuth callback
         * Called by Facebook after user grants/denies permission
         */
        this.router.get(
            `${this.path}/facebook/callback`,
            this.controller.facebookCallback
        );

        // ===========================================
        // APPLE OAUTH ROUTES
        // ===========================================

        /**
         * GET /oauth/apple
         * Initiate Apple OAuth flow
         * Redirects user to Apple consent screen
         * Optional query param: ?redirect=<custom_redirect_url>
         */
        this.router.get(
            `${this.path}/apple`,
            this.controller.appleLogin
        );

        /**
         * POST /oauth/apple/callback
         * Handle Apple OAuth callback
         * NOTE: Apple uses POST for callback, not GET!
         * Apple sends data in request body
         */
        this.router.post(
            `${this.path}/apple/callback`,
            this.controller.appleCallback
        );
    }
}

export default OAuthRoutes;

