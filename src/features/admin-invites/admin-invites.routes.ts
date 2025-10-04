// src/features/admin-invites/admin-invites.routes.ts

import { Router } from 'express';
import AdminInvitesController from './admin-invites.controller';
import authMiddleware from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import Route from '../../interfaces/route.interface';

class AdminInvitesRoutes implements Route {
    public path = '/admin/invites';
    public router = Router();
    private adminInvitesController = new AdminInvitesController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        /**
         * Create invitation (Admin only)
         * POST /admin/invites
         */
        this.router.post(
            `${this.path}`,
            authMiddleware,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.adminInvitesController.createInvite
        );

        /**
         * Accept invitation (Public route - no auth required)
         * POST /admin/invites/accept
         */
        this.router.post(`${this.path}/accept`, this.adminInvitesController.acceptInvite);

        /**
         * Get all invitations (Admin only)
         * GET /admin/invites
         */
        this.router.get(
            `${this.path}`,
            authMiddleware,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.adminInvitesController.getAllInvites
        );

        /**
         * Revoke invitation (Admin only)
         * DELETE /admin/invites/:id
         */
        this.router.delete(
            `${this.path}/:id`,
            authMiddleware,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.adminInvitesController.revokeInvite
        );
    }
}

export default AdminInvitesRoutes;