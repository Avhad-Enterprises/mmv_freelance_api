import { createTransporter, EMAIL_SENDER, APP_NAME } from "./emailConfig";
import { ContactSubmission } from "../../features/contact/contact.interface";

/**
 * Sends contact form notification email to the company owner
 */
export const sendContactNotificationEmail = async (contact: ContactSubmission): Promise<void> => {
    const transporter = createTransporter();

    const subject = contact.subject
        ? `Contact Form: ${contact.subject}`
        : "Contact Form Inquiry";

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a73e8;">New Contact Form Submission</h2>

            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Contact Details:</h3>
                <p><strong>Name:</strong> ${contact.name}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                ${contact.subject ? `<p><strong>Subject:</strong> ${contact.subject}</p>` : ''}
                <p><strong>Submitted:</strong> ${new Date(contact.created_at || '').toLocaleString()}</p>
                ${contact.ip_address ? `<p><strong>IP Address:</strong> ${contact.ip_address}</p>` : ''}
            </div>

            <div style="border-left: 4px solid #1a73e8; padding-left: 20px; margin: 20px 0;">
                <h3>Message:</h3>
                <div style="white-space: pre-wrap; line-height: 1.6;">
                    ${contact.message}
                </div>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #666; font-size: 14px;">
                This message was sent from the ${APP_NAME} contact form.
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"${APP_NAME} Contact Form" <${EMAIL_SENDER}>`,
            to: "harshalpatilself@gmail.com", // Company owner email
            subject: subject,
            html: htmlContent,
            replyTo: contact.email // Allow direct reply to the contact
        });
    } catch (error) {
        console.error('Failed to send contact notification email:', error);
        throw new Error('Failed to send contact notification email');
    }
};