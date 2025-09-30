import nodemailer from "nodemailer";

const sendResetPasswordEmail = async (to: string, name: string, resetLink: string) => {
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
            to: to,
            subject: "Reset Your Password - YourApp",
            text: `Hi ${name},\n\nWe received a request to reset your password.\n\nYou can reset it using the link below:\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nYourApp Team`,
            html: `
                <p>Hi ${name},</p>
                <p>We received a request to reset your password. Click the link below to set a new password:</p>
                <p>
                    <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline;">
                    Click here to reset your password
                    </a>
                </p>
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>Thanks,<br>YourApp Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Password reset email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending reset password email:", error);
        throw new Error("Failed to send reset password email");
    }
};

export default sendResetPasswordEmail;
