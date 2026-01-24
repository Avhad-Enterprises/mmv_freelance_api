import { NextFunction, Request, Response } from "express";
import { ContactSubmissionDto } from "./contact.dto";
import { ContactSubmissionResponse } from "./contact.interface";
import ContactService from "./contact.service";
import HttpException from "../../exceptions/HttpException";

class ContactController {
    private contactService = new ContactService();

    /**
     * Submits a contact form
     */
    public submitContactForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const contactData: ContactSubmissionDto = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

            const contactResponse = await this.contactService.submitContactForm(
                contactData,
                ipAddress as string
            );

            res.status(201).json(contactResponse);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets all contact submissions (Admin only)
     */
    public getAllContactSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const status = req.query.status as string;

            const result = await this.contactService.getAllContactSubmissions(page, limit, status);

            res.status(200).json({
                success: true,
                data: {
                    submissions: result.submissions,
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        pages: result.pages
                    }
                },
                message: "Contact submissions retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Updates contact submission status (Admin only)
     */
    public updateContactStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const contactId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const { status, notes } = req.body;

            if (!status || !['pending', 'responded', 'closed'].includes(status)) {
                throw new HttpException(400, "Valid status is required (pending, responded, closed)");
            }

            const updatedSubmission = await this.contactService.updateContactStatus(
                contactId,
                status,
                notes
            );

            res.status(200).json({
                success: true,
                data: updatedSubmission,
                message: "Contact status updated successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets a specific contact submission by ID (Admin only)
     */
    public getContactSubmissionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const contactId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

            if (!contactId) {
                throw new HttpException(400, "Contact ID is required");
            }

            // For now, we'll get all and filter - in production, add a specific service method
            const result = await this.contactService.getAllContactSubmissions(1, 1);
            const submission = result.submissions.find(s => s.contact_id === contactId);

            if (!submission) {
                throw new HttpException(404, "Contact submission not found");
            }

            res.status(200).json({
                success: true,
                data: submission,
                message: "Contact submission retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };
}

export default ContactController;