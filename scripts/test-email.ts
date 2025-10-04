// Test script to send a simple email
// Usage: npx ts-node scripts/test-email.ts

import dotenv from 'dotenv';
dotenv.config();

import sendEmail from '../src/utils/email/sendemail';

async function testEmail() {
  try {
    console.log('📧 Testing email functionality...\n');

    console.log('Sending test email to hmpatil371122@kkwagh.edu.in...');

    await sendEmail({
      to: 'hmpatil371122@kkwagh.edu.in',
      subject: 'Test Email from MMV Freelance API',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p>If you received this email, the email configuration is working!</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
          <p>Best regards,<br>MMV Team</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Check your inbox (and spam folder) for the test email.');

  } catch (error: any) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);

    if (error.code) {
      console.error('Error Code:', error.code);
    }

    console.error('\n🔍 Possible issues:');
    console.error('1. EMAIL_USER and EMAIL_PASSWORD not set correctly in .env');
    console.error('2. Gmail requires App Password (not regular password) when 2FA is enabled');
    console.error('3. Gmail account security settings blocking SMTP access');
    console.error('4. Network/firewall blocking SMTP port 587');
    console.error('5. Invalid email address');

    console.error('\n🔧 Solutions:');
    console.error('1. Check .env file has correct EMAIL_USER and EMAIL_PASSWORD');
    console.error('2. For Gmail: Enable 2FA, generate App Password at https://myaccount.google.com/apppasswords');
    console.error('3. Use App Password (16 chars, no spaces) instead of regular Gmail password');
    console.error('4. See EMAIL_SETUP_GUIDE.md for detailed Gmail SMTP setup instructions');
  }
}

// Run the test
testEmail();