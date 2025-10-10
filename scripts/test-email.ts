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
          <p>If you received this email, the SendGrid configuration is working!</p>
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
    console.error('1. SENDGRID_API_KEY not set correctly in .env');
    console.error('2. API key lacks sending permissions');
    console.error('3. Sender email not verified in SendGrid');
    console.error('4. Invalid recipient email address');

    console.error('\n🔧 Solutions:');
    console.error('1. Check .env file has correct SENDGRID_API_KEY');
    console.error('2. Verify API key in SendGrid dashboard');
    console.error('3. Verify sender identity in SendGrid (Settings > Sender Authentication)');
    console.error('4. Check that EMAIL_USER matches verified sender');
  }
}

// Run the test
testEmail();