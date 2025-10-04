# Email Configuration Guide

## Gmail SMTP Setup

The application uses Gmail SMTP for sending emails. To configure email sending, you need to set up a Gmail App Password.

### Step 1: Enable 2-Factor Authentication (2FA)
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the steps to enable 2FA if not already enabled

### Step 2: Generate App Password
1. After enabling 2FA, go back to the "Security" section
2. Under "Signing in to Google", click on "App passwords"
3. You might need to sign in again
4. Select "Mail" as the app and "Other (custom name)" as the device
5. Enter "MMV Freelance API" as the custom name
6. Click "Generate"
7. Copy the 16-character password (ignore spaces)

### Step 3: Update Environment Variables
Update your `.env` file with the correct credentials:

```bash
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important Notes:**
- Use your full Gmail address (including @gmail.com)
- The app password is 16 characters long and contains no spaces
- Do not use your regular Gmail password
- Keep the app password secure and don't commit it to version control

### Step 4: Test Email Configuration
Run the email test script to verify everything works:

```bash
npx ts-node scripts/test-email.ts
```

## Alternative Email Services

If you prefer not to use Gmail, you can configure other SMTP services:

### SendGrid
```bash
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
# Update sendemail.ts to use SendGrid SMTP settings
```

### Mailgun
```bash
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
# Update sendemail.ts to use Mailgun SMTP settings
```

### AWS SES
```bash
EMAIL_USER=your-aws-ses-smtp-username
EMAIL_PASSWORD=your-aws-ses-smtp-password
# Update sendemail.ts to use AWS SES SMTP settings
```

## Troubleshooting

### Common Issues:
1. **"Username and Password not accepted"** - You're using the wrong password. Use an App Password, not your regular Gmail password.
2. **"Application-specific password required"** - Enable 2FA on your Google account and generate an App Password.
3. **"Less secure app access"** - Gmail no longer supports "less secure apps". You must use App Passwords with 2FA.

### Testing
Always test your email configuration with the provided test script before deploying to production.</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/EMAIL_SETUP_GUIDE.md