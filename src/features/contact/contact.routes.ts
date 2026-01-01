import { Router } from "express";
import Route from "../../interfaces/route.interface";
import validationMiddleware from "../../middlewares/validation.middleware";
import ContactController from "./contact.controller";
import { ContactSubmissionDto } from "./contact.dto";
import { requirePermission } from "../../middlewares/permission.middleware";

/**
 * Contact Routes
 * Uses dynamic RBAC permissions for admin routes
 */
class ContactRoute implements Route {
  public path = "/contact";
  public router = Router();
  public contactController = new ContactController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * POST /contact/submit
     * Submit a contact form (Public - no auth required)
     */
    this.router.post(
      `${this.path}/submit`,
      validationMiddleware(ContactSubmissionDto, "body", false, []),
      this.contactController.submitContactForm
    );

    /**
     * GET /contact/messages
     * Get all contact submissions
     * Requires: admin.dashboard permission
     */
    this.router.get(
      `${this.path}/messages`,
      requirePermission("admin.dashboard"),
      this.contactController.getAllContactSubmissions
    );

    /**
     * GET /contact/messages/:id
     * Get a specific contact submission by ID
     * Requires: admin.dashboard permission
     */
    this.router.get(
      `${this.path}/messages/:id`,
      requirePermission("admin.dashboard"),
      this.contactController.getContactSubmissionById
    );

    /**
     * PATCH /contact/messages/:id/status
     * Update contact submission status
     * Requires: admin.dashboard permission
     */
    this.router.patch(
      `${this.path}/messages/:id/status`,
      requirePermission("admin.dashboard"),
      this.contactController.updateContactStatus
    );
  }
}

export default ContactRoute;
