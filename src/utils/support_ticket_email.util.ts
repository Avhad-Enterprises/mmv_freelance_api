// emailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

export const sendSupportEmail = async ({
  to,
  subject,
  body,
  replyTo,
}: EmailPayload): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Support System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: body,
      replyTo, // optional
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Support email sent:', info.response);
  } catch (err) {
    console.error('❌ Failed to send support email:', err);
    throw new Error('Support email failed');
  }
};
