// Client Routes - Client-specific endpoints with RBAC
import { Router } from "express";
import { ClientController } from "./client.controller";
import { requireRole } from "../../middlewares/role.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import validationMiddleware from "../../middlewares/validation.middleware";
import { ClientProfileUpdateDto } from "./client.update.dto";
import Route from "../../interfaces/route.interface";

/**
 * Client Routes
 * All routes require authentication
 * Uses dynamic RBAC permissions for admin routes
 */
export class ClientRoutes implements Route {
  public path = "/clients";
  public router = Router();
  private clientController = new ClientController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Admin routes - use permission-based access

    /**
     * Get all clients
     * Requires: users.view permission
     */
    this.router.get(
      `${this.path}/getallclient`,
      requirePermission("users.view"),
      this.clientController.getAllClients
    );

    // Profile routes (CLIENT role required - these are self-service)

    /**
     * Get current client's profile
     * Requires: CLIENT role
     */
    this.router.get(
      `${this.path}/profile`,
      requireRole("CLIENT"),
      this.clientController.getMyProfile
    );

    /**
     * Update current client's profile
     * Requires: CLIENT role
     */
    this.router.patch(
      `${this.path}/profile`,
      requireRole("CLIENT"),
      validationMiddleware(ClientProfileUpdateDto, "body", true, []),
      this.clientController.updateProfile
    );

    /**
     * Get current client's statistics
     * Requires: CLIENT role
     */
    this.router.get(
      `${this.path}/profile/stats`,
      requireRole("CLIENT"),
      this.clientController.getStats
    );

    // Admin routes - permission-based

    /**
     * Get client by ID
     * Requires: users.view permission
     */
    this.router.get(
      `${this.path}/:id`,
      requirePermission("users.view"),
      this.clientController.getClientById
    );
  }
}
