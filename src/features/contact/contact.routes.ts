import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import ContactController from './contact.controller';
import { ContactSubmissionDto } from './contact.dto';
import { requireRole } from '../../middlewares/role.middleware';

class ContactRoute implements Route {
    public path = '/contact';
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
            validationMiddleware(ContactSubmissionDto, 'body', false, []),
            this.contactController.submitContactForm
        );

        /**
         * GET /contact/messages
         * Get all contact submissions (Admin only)
         */
        this.router.get(
            `${this.path}/messages`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.contactController.getAllContactSubmissions
        );

        /**
         * GET /contact/messages/:id
         * Get a specific contact submission by ID (Admin only)
         */
        this.router.get(
            `${this.path}/messages/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.contactController.getContactSubmissionById
        );

        /**
         * PATCH /contact/messages/:id/status
         * Update contact submission status (Admin only)
         */
        this.router.patch(
            `${this.path}/messages/:id/status`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.contactController.updateContactStatus
        );
    }
}

export default ContactRoute;