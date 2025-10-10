# Email Configuration Guide

## SendGrid Setup

The application uses SendGrid for sending emails. SendGrid provides reliable email delivery with excellent deliverability rates.

### Step 1: Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com) and create a free account
2. Verify your email address
3. Complete the account setup

### Step 2: Generate API Key

1. In your SendGrid dashboard, go to **Settings** > **API Keys**
2. Click **Create API Key**
3. Choose **Full Access** or **Restricted Access** (recommended for production)
4. Give your API key a name (e.g., "MMV Freelance API")
5. Copy the API key (you won't be able to see it again!)

### Step 3: Verify Sender Identity

**Important:** You must verify your sender email address before you can send emails.

1. In SendGrid dashboard, go to **Settings** > **Sender Authentication**
2. Choose **Verify a Single Sender**
3. Enter your sender details:
   - **From Email:** `no-reply@avhad.com`
   - **From Name:** `MMV Freelance Platform`
   - Fill in other required fields
4. Send verification email and click the link

### Step 4: Update Environment Variables

Update your `.env` file with the SendGrid API key:

```bash
EMAIL_USER=no-reply@avhad.com
SENDGRID_API_KEY=SG.your-actual-api-key-here
```

**Security Note:** Never commit your API key to version control. Use environment variables.

### Step 5: Test Email Configuration

Run the email test script to verify everything works:

```bash
npx ts-node scripts/test-email.ts
```

### Step 6: Test Admin Invite API

Once email is working, test the admin invite functionality:

```bash
npx ts-node scripts/test-admin-invite.ts
```

## SendGrid Benefits

- **High Deliverability:** Industry-leading delivery rates
- **Free Tier:** 100 emails/day free
- **Scalable:** Pay only for what you use
- **Analytics:** Detailed email analytics and insights
- **Reliable:** 99.9% uptime SLA

## Troubleshooting

### Common Issues:

1. **"Unauthorized" Error**
   - Check your API key is correct
   - Ensure the API key has sending permissions

2. **"Sender not verified" Error**
   - Complete sender verification in SendGrid dashboard
   - Check that `EMAIL_USER` matches your verified sender

3. **Emails going to spam**
   - SendGrid has good reputation, but check your content
   - Avoid spam trigger words
   - Use proper HTML formatting

### Testing
Always test your email configuration with the provided test script before deploying to production.

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