import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMPT_EMAIL_USER,
    pass: process.env.SMPT_APP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string; // or use `text` if you prefer plain text
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
    await transporter.sendMail({
        from: `"Freelyancer Support" <${process.env.SMTP_EMAIL_USER}>`,
    to ,
    subject,
    html,
  });

};
