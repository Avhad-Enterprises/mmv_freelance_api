import nodemailer from "nodemailer";

interface EmailPayload {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: {
        filename: string;
        path: string;
        cid?: string;
    }[];
}

const sendEmail = async ({ to, subject, text, html, attachments }: EmailPayload): Promise<void> => {
    try {
        // SendGrid configuration
        const transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey', // SendGrid requires 'apikey' as username
                pass: process.env.SENDGRID_API_KEY,
            },
        });

        const mailOptions = {
            from: `"MMV Freelance Platform" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        throw error;
    }
};

export default sendEmail;
