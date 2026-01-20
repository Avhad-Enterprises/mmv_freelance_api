import { ContactSubmissionDto } from "./contact.dto";
import { ContactSubmission, ContactSubmissionCreateData, ContactSubmissionResponse } from "./contact.interface";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { sendContactNotificationEmail } from "../../utils/email";
import { sendContactAutoReplyEmail } from "../../utils/email";

export class ContactService {
    /**
     * Submits a contact form and sends notification emails
     */
    async submitContactForm(contactData: ContactSubmissionDto, ipAddress?: string): Promise<ContactSubmissionResponse> {
        try {
            // Insert contact submission into database
            const [result] = await DB('contact_submissions')
                .insert({
                    name: contactData.name,
                    email: contactData.email,
                    subject: contactData.subject,
                    message: contactData.message,
                    ip_address: ipAddress,
                    status: 'pending',
                    created_at: DB.fn.now(),
                    updated_at: DB.fn.now()
                })
                .returning('contact_id');

            // Extract the actual contact_id value from the returned object
            const contactId = typeof result === 'object' && result.contact_id ? result.contact_id : result;

            // Get the inserted contact for email sending
            const contact = await DB('contact_submissions')
                .where('contact_id', contactId)
                .first();

            if (!contact) {
                throw new Error('Failed to retrieve contact submission');
            }

            // Send notification email to company owner (non-blocking, with timeout)
            Promise.race([
                sendContactNotificationEmail(contact),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 5000))
            ]).catch(() => {
                // Email failed silently - non-blocking
            });

            // Send auto-reply email to user (non-blocking, with timeout)
            Promise.race([
                this.sendContactAutoReply(contact),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 5000))
            ]).catch(() => {
                // Email failed silently - non-blocking
            });

            return {
                success: true,
                message: 'Contact form submitted successfully. You will receive a confirmation email shortly.',
                data: {
                    contact_id: contactId,
                    name: contact.name,
                    email: contact.email,
                    subject: contact.subject,
                    message: contact.message,
                    status: 'pending',
                    created_at: contact.created_at
                }
            };
        } catch (error) {
            throw new Error('Failed to submit contact form');
        }
    }

    /**
     * Sends auto-reply email to the user
     */
    private async sendContactAutoReply(contact: ContactSubmission): Promise<void> {
        try {
            await sendContactAutoReplyEmail({
                to: contact.email,
                name: contact.name,
                subject: contact.subject
            });
        } catch (error) {
            console.error('Failed to send contact auto-reply:', error);
            throw new Error('Failed to send contact auto-reply');
        }
    }

    /**
     * Retrieves all contact submissions (for admin dashboard)
     */
    public async getAllContactSubmissions(
        page: number = 1,
        limit: number = 20,
        status?: string
    ): Promise<{ submissions: ContactSubmission[], total: number, pages: number }> {
        try {
            // Build base query for filtering
            let baseQuery = DB(T.CONTACT_SUBMISSIONS)
                .where({ is_deleted: false });

            if (status) {
                baseQuery = baseQuery.where({ status });
            }

            // Get total count without ordering
            const totalResult = await baseQuery.clone().count('* as count').first();
            const total = parseInt(totalResult?.count as string) || 0;

            // Get paginated results with ordering
            const submissions = await baseQuery
                .orderBy('created_at', 'desc')
                .limit(limit)
                .offset((page - 1) * limit);

            const pages = Math.ceil(total / limit);

            return {
                submissions,
                total,
                pages
            };
        } catch (error) {
            console.error('Error fetching contact submissions:', error);
            throw new HttpException(500, 'Error fetching contact submissions');
        }
    }

    /**
     * Updates contact submission status (for admin dashboard)
     */
    public async updateContactStatus(
        contactId: number,
        status: 'pending' | 'responded' | 'closed',
        notes?: string
    ): Promise<ContactSubmission> {
        if (!contactId) {
            throw new HttpException(400, "Contact ID is required");
        }

        try {
            const updateData: any = {
                status,
                updated_at: DB.fn.now()
            };

            if (notes) {
                updateData.notes = notes;
            }

            // Set timestamp based on status
            if (status === 'responded') {
                updateData.responded_at = DB.fn.now();
            } else if (status === 'closed') {
                updateData.closed_at = DB.fn.now();
            }

            const updated = await DB(T.CONTACT_SUBMISSIONS)
                .where({ contact_id: contactId })
                .update(updateData)
                .returning("*");

            if (!updated.length) {
                throw new HttpException(404, "Contact submission not found");
            }

            return updated[0];
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error updating contact status:', error);
            throw new HttpException(500, 'Error updating contact status');
        }
    }
}

export default ContactService;