// src/features/admin-invites/admin-invites.routes.ts

import { Router } from "express";
import AdminInvitesController from "./admin-invites.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import Route from "../../interfaces/route.interface";

class AdminInvitesRoutes implements Route {
  public path = "/admin/invites";
  public router = Router();
  private adminInvitesController = new AdminInvitesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * Verify invitation token (Public route - no auth required)
     * GET /admin/invites/verify?token=xxx
     */
    this.router.get(
      `${this.path}/verify`,
      this.adminInvitesController.verifyToken
    );

    /**
     * Complete registration with token (Public route - no auth required)
     * POST /admin/invites/register
     */
    this.router.post(
      `${this.path}/register`,
      this.adminInvitesController.completeRegistration
    );

    /**
     * Create invitation (Admin only)
     * POST /admin/invites
     */
    this.router.post(
      `${this.path}`,
      authMiddleware,
      requirePermission("admin.users"),
      this.adminInvitesController.createInvite
    );

    /**
     * Accept invitation (Public route - no auth required)
     * POST /admin/invites/accept
     */
    this.router.post(
      `${this.path}/accept`,
      this.adminInvitesController.acceptInvite
    );

    /**
     * Get all invitations (Admin only)
     * GET /admin/invites
     */
    this.router.get(
      `${this.path}`,
      authMiddleware,
      requirePermission("admin.users"),
      this.adminInvitesController.getAllInvites
    );

    /**
     * Revoke invitation (Admin only)
     * DELETE /admin/invites/:id
     */
    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      requirePermission("admin.users"),
      this.adminInvitesController.revokeInvite
    );
  }
}

export default AdminInvitesRoutes;
