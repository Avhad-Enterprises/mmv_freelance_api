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
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
            attachments,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("❌ Email sending failed:", error);
    }
};

export default sendEmail;
