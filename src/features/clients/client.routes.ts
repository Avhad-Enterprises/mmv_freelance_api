// Client Routes - Client-specific endpoints with RBAC
import { Router } from 'express';
import { ClientController } from './client.controller';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import { ClientUpdateDto } from './client.update.dto';
import Route from '../../interfaces/route.interface';

/**
 * Client Routes
 * All routes require authentication
 * Some routes restricted to CLIENT role or ADMIN
 */
export class ClientRoutes implements Route {
  public path = '/clients';
  public router = Router();
  private clientController = new ClientController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public/Search routes (require authentication only)
    
    /**
     * Get all clients
     * Requires: ADMIN or SUPER_ADMIN role
     */
    this.router.get(
      `${this.path}/getallclient`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      this.clientController.getAllClients
    );

    /**
     * Search clients by industry
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/search/industry/:industry`,
      this.clientController.searchByIndustry
    );

    /**
     * Search client by company name
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/search/company/:name`,
      this.clientController.searchByCompanyName
    );

    // Profile routes (CLIENT role required)

    /**
     * Get current client's profile
     * Requires: CLIENT role
     */
    this.router.get(
      `${this.path}/profile`,
      requireRole('CLIENT'),
      this.clientController.getMyProfile
    );

    /**
     * Update current client's profile
     * Requires: CLIENT role
     */
    this.router.patch(
      `${this.path}/profile`,
      requireRole('CLIENT'),
      validationMiddleware(ClientUpdateDto, 'body', true, []),
      this.clientController.updateProfile
    );

    /**
     * Get current client's statistics
     * Requires: CLIENT role
     */
    this.router.get(
      `${this.path}/profile/stats`,
      requireRole('CLIENT'),
      this.clientController.getStats
    );

    /**
     * Update business documents
     * Requires: CLIENT role
     */
    this.router.patch(
      `${this.path}/profile/documents`,
      requireRole('CLIENT'),
      this.clientController.updateDocuments
    );

    /**
     * Delete client account (soft delete)
     * Requires: CLIENT role
     */
    this.router.delete(
      `${this.path}/profile`,
      requireRole('CLIENT', 'ADMIN'),
      this.clientController.deleteAccount
    );

    // Admin routes

    /**
     * Get client by ID
     * Requires: ADMIN or SUPER_ADMIN role
     */
    this.router.get(
      `${this.path}/:id`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      this.clientController.getClientById
    );
  }
}
