import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Centralized email configuration
export const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

export const EMAIL_SENDER = process.env.EMAIL_USER || '';
export const APP_NAME = process.env.FRONTEND_APPNAME || 'MMV Freelance';