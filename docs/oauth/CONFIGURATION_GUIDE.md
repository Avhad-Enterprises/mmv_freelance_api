# OAuth Configuration Guide

## Overview

This guide explains how to configure OAuth providers for the MMV Freelance API.

## Environment Variables

Add these to your `.env` file:

```env
# ===========================================
# CORE CONFIGURATION
# ===========================================
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000

# OAuth redirect URLs (optional, defaults shown)
OAUTH_FRONTEND_SUCCESS_URL=http://localhost:3000/auth/callback
OAUTH_FRONTEND_ERROR_URL=http://localhost:3000/auth/error

# ===========================================
# GOOGLE OAUTH
# ===========================================
OAUTH_GOOGLE_ENABLED=true
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/oauth/google/callback

# ===========================================
# FACEBOOK OAUTH
# ===========================================
OAUTH_FACEBOOK_ENABLED=true
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/v1/oauth/facebook/callback

# ===========================================
# APPLE OAUTH
# ===========================================
OAUTH_APPLE_ENABLED=false
APPLE_CLIENT_ID=com.your.app.identifier
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"
APPLE_REDIRECT_URI=http://localhost:8000/api/v1/oauth/apple/callback
```

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google+ API** and **Google Identity** APIs

### 2. Configure OAuth Consent Screen

1. Navigate to **APIs & Services > OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - App name: `MMV Freelance`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`

### 3. Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URIs:
   ```
   http://localhost:8000/api/v1/oauth/google/callback
   https://yourdomain.com/api/v1/oauth/google/callback
   ```
5. Copy **Client ID** and **Client Secret**

### 4. Update Environment Variables

```env
OAUTH_GOOGLE_ENABLED=true
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

---

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps > Create App**
3. Select **Consumer** or **Business** type
4. Enter app name: `MMV Freelance`

### 2. Configure Facebook Login

1. In your app dashboard, click **Add Product**
2. Add **Facebook Login**
3. Go to **Facebook Login > Settings**
4. Add Valid OAuth Redirect URIs:
   ```
   http://localhost:8000/api/v1/oauth/facebook/callback
   https://yourdomain.com/api/v1/oauth/facebook/callback
   ```

### 3. Get App Credentials

1. Go to **Settings > Basic**
2. Copy **App ID** and **App Secret**

### 4. Update Environment Variables

```env
OAUTH_FACEBOOK_ENABLED=true
FACEBOOK_APP_ID=1234567890
FACEBOOK_APP_SECRET=abcdef1234567890
```

### 5. Important Settings

- Set **App Mode** to **Live** for production
- Complete **Data Use Checkup** if required
- Verify your business if needed

---

## Apple OAuth Setup

### 1. Prerequisites

- Apple Developer Program membership ($99/year)
- A domain you control for email relay

### 2. Create App ID

1. Go to [Apple Developer](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Under **Identifiers**, click **+**
4. Select **App IDs** > **App**
5. Fill in:
   - Description: `MMV Freelance`
   - Bundle ID: `com.mmv.freelance`
6. Enable **Sign In with Apple** capability

### 3. Create Service ID

1. Under **Identifiers**, click **+**
2. Select **Services IDs**
3. Fill in:
   - Description: `MMV Freelance Web`
   - Identifier: `com.mmv.freelance.web`
4. Enable **Sign In with Apple**
5. Configure:
   - Primary App ID: Select your App ID
   - Domains: `yourdomain.com`
   - Return URLs:
     ```
     https://yourdomain.com/api/v1/oauth/apple/callback
     ```

### 4. Create Private Key

1. Under **Keys**, click **+**
2. Name: `MMV Sign In with Apple`
3. Enable **Sign In with Apple**
4. Configure with your Primary App ID
5. Download the `.p8` key file (save it securely!)
6. Note the **Key ID** shown

### 5. Update Environment Variables

```env
OAUTH_APPLE_ENABLED=true
APPLE_CLIENT_ID=com.mmv.freelance.web
APPLE_TEAM_ID=ABCDE12345
APPLE_KEY_ID=ABC123DEFG
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...your key content...xyz=\n-----END PRIVATE KEY-----"
```

> **Note:** For `APPLE_PRIVATE_KEY`, replace newlines with `\n` in the .env file.

---

## Feature Flags

Enable/disable providers dynamically:

```env
# Enable/disable providers
OAUTH_GOOGLE_ENABLED=true
OAUTH_FACEBOOK_ENABLED=true
OAUTH_APPLE_ENABLED=false
```

When disabled, the provider:
- Won't appear in `/oauth/providers` response
- Will return `503 Service Unavailable` if accessed directly

---

## Redirect URL Configuration

### Allowed Origins

The system validates redirect URLs against allowed origins:

```env
FRONTEND_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:3001
```

Default allowed origins:
- `http://localhost:3000`
- `http://localhost:3001`
- Value of `FRONTEND_URL`
- Value of `ADMIN_PANEL_URL`

### Custom Redirects

Pass custom redirect in OAuth initiation:
```
GET /oauth/google?redirect=http://localhost:3000/custom-callback
```

---

## Production Checklist

- [ ] Use HTTPS for all redirect URLs
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Verify all provider apps are in Live/Production mode
- [ ] Test OAuth flows end-to-end
- [ ] Configure proper CORS settings
- [ ] Enable rate limiting
- [ ] Set up monitoring for OAuth failures
