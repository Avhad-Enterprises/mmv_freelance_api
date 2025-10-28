import { createTransporter, EMAIL_SENDER, APP_NAME } from './emailConfig';

interface ContactAutoReplyEmailParams {
    to: string;
    name: string;
    subject?: string;
}

export const sendContactAutoReplyEmail = async ({
    to,
    name,
    subject
}: ContactAutoReplyEmailParams): Promise<void> => {
    const transporter = createTransporter();

    const emailSubject = subject
        ? `Re: ${subject}`
        : "Thank you for contacting us";

    try {
        await transporter.sendMail({
            from: `"${APP_NAME} Support" <${EMAIL_SENDER}>`,
            to,
            subject: emailSubject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a73e8;">Thank you for contacting ${APP_NAME}!</h2>

                    <p>Dear ${name},</p>

                    <p>Thank you for reaching out to us. We have received your message and appreciate you taking the time to contact us.</p>

                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>What happens next?</strong></p>
                        <ul>
                            <li>Our team will review your inquiry within 24-48 hours</li>
                            <li>We will respond to you directly via email</li>
                            <li>For urgent matters, please call us directly</li>
                        </ul>
                    </div>

                    <p>If you have any additional information or urgent questions, please don't hesitate to reply to this email.</p>

                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
                        <p><strong>Response Time:</strong> We typically respond within 24-48 hours during business days.</p>
                    </div>

                    <p>Best regards,<br>
                    ${APP_NAME} Support Team</p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                    <p style="color: #666; font-size: 12px;">
                        This is an automated response to confirm receipt of your message.<br>
                        Please do not reply to this email. For follow-up questions, our team will contact you directly.
                    </p>
                </div>
            `,
            replyTo: EMAIL_SENDER // Prevent replies to this auto-reply
        });
    } catch (error) {
        console.error('Failed to send contact auto-reply email:', error);
        throw new Error('Failed to send contact auto-reply email');
    }
};