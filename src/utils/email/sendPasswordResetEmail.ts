import { createTransporter, EMAIL_SENDER, APP_NAME } from './emailConfig';

interface PasswordResetEmailParams {
    to: string;
    name: string;
    resetLink: string;
}

export const sendPasswordResetEmail = async ({
    to,
    name,
    resetLink
}: PasswordResetEmailParams): Promise<void> => {
    const transporter = createTransporter();
    
    try {
        await transporter.sendMail({
            from: `"${APP_NAME}" <${EMAIL_SENDER}>`,
            to,
            subject: `Password Reset Request - ${APP_NAME}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${name},</p>
                    <p>We received a request to reset your password for your ${APP_NAME} account.</p>
                    <p>Click the button below to set a new password:</p>
                    <p style="text-align: center;">
                        <a href="${resetLink}" 
                           style="display: inline-block; background: #1a73e8; color: white; 
                                  padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                            Reset Password
                        </a>
                    </p>
                    <p style="color: #666;">
                        This link will expire in 1 hour for security reasons.
                    </p>
                    <p>
                        If you didn't request this password reset, you can safely ignore this email.
                        Your password will remain unchanged.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p>Thanks,<br>${APP_NAME} Team</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};