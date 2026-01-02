import { Router } from "express";
import Route from "../../interfaces/route.interface";
import validationMiddleware from "../../middlewares/validation.middleware";
import FaqController from "./faq.controller";
import { FaqDto } from "./faq.dto";
import { requirePermission } from "../../middlewares/permission.middleware";

class FaqRoute implements Route {
  public path = "/faq";
  public router = Router();
  public faqController = new FaqController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * GET /faq/all
     * Get all FAQs including inactive (Admin only)
     * Note: Must be before /:id route to avoid conflict
     */
    this.router.get(
      `${this.path}/all`,
      requirePermission("content.view"),
      this.faqController.getAllFaqsAdmin
    );

    /**
     * GET /faq/:id
     * Get a specific FAQ by ID (Public - no auth required)
     */
    this.router.get(`${this.path}/:id`, this.faqController.getFaqById);

    /**
     * GET /faq
     * Get all active FAQs (Public - no auth required)
     */
    this.router.get(`${this.path}`, this.faqController.getAllFaqs);

    /**
     * POST /faq
     * Create a new FAQ entry (Admin only)
     */
    this.router.post(
      `${this.path}`,
      requirePermission("content.create"),
      validationMiddleware(FaqDto, "body", true, []),
      this.faqController.createFaq
    );

    /**
     * PUT /faq
     * Update an existing FAQ (Admin only)
     */
    this.router.put(
      `${this.path}`,
      requirePermission("content.update"),
      validationMiddleware(FaqDto, "body", false, []),
      this.faqController.updateFaq
    );

    /**
     * DELETE /faq
     * Soft delete an FAQ (Admin only)
     */
    this.router.delete(
      `${this.path}`,
      requirePermission("content.delete"),
      validationMiddleware(FaqDto, "body", true, []),
      this.faqController.deleteFaq
    );
  }
}

export default FaqRoute;
