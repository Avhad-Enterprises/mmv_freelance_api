import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendResetEmail = async (
  to: string,
  first_name: string,
  resetUrl: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMPT_EMAIL_USER,
        pass: process.env.SMPT_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: "🔐 Password Reset Request",
      html: `<p>Hi ${first_name},</p>
             <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
             <p>If you didn’t request this, you can ignore this email.</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reset email sent:', info.response);
  } catch (err) {
    console.error('Email send failed:', err);
    throw new Error("Email send failed");
  }
};
