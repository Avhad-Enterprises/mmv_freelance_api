import { createTransporter, EMAIL_SENDER, APP_NAME } from './emailConfig';

interface SupportTicketEmailParams {
    to: string;
    subject: string;
    ticketId: string;
    message: string;
    replyTo?: string;
}

export const sendSupportTicketEmail = async ({
    to,
    subject,
    ticketId,
    message,
    replyTo
}: SupportTicketEmailParams): Promise<void> => {
    const transporter = createTransporter();
    
    try {
        await transporter.sendMail({
            from: `"${APP_NAME} Support" <${EMAIL_SENDER}>`,
            to,
            subject: `[Ticket #${ticketId}] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Support Ticket Update</h2>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Ticket ID:</strong> #${ticketId}</p>
                        <p><strong>Subject:</strong> ${subject}</p>
                    </div>
                    <div style="border-left: 4px solid #1a73e8; padding-left: 15px; margin: 20px 0;">
                        ${message}
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p>Thanks,<br>${APP_NAME} Support Team</p>
                </div>
            `,
            replyTo
        });
    } catch (error) {
        console.error('Failed to send support ticket email:', error);
        throw new Error('Failed to send support ticket email');
    }
};