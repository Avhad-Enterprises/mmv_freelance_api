# OAuth Authentication Documentation

## Overview

The OAuth module provides social login functionality for the MMV Freelance Platform, allowing users to authenticate using their existing Google, Facebook, or Apple accounts. This creates a seamless registration and login experience while maintaining security best practices.

## Features

- **Multi-Provider Support**: Google, Facebook, and Apple OAuth
- **Account Linking**: Link multiple OAuth providers to a single account
- **Role Selection Flow**: New OAuth users can select their role (Client, Videographer, Video Editor)
- **PKCE Protection**: Enhanced security for Google OAuth
- **CSRF Protection**: State parameter validation on all callbacks
- **Token Refresh**: Automatic token refresh for Google

## Supported Providers

| Provider | Status | Features |
|----------|--------|----------|
| Google | ✅ Enabled | PKCE, Refresh Tokens, Profile Picture |
| Facebook | ✅ Enabled | Graph API, Profile Picture |
| Apple | ✅ Enabled | Sign in with Apple, Privacy Relay Email |

## Quick Start

### 1. Get Available Providers

```javascript
const response = await fetch('/api/v1/oauth/providers');
const { data } = await response.json();
// Returns: { providers: [{ name: 'google', displayName: 'Google', enabled: true }, ...] }
```

### 2. Initiate OAuth Flow

```javascript
// Redirect user to OAuth provider
window.location.href = '/api/v1/oauth/google';
// Or for Facebook: '/api/v1/oauth/facebook'
// Or for Apple: '/api/v1/oauth/apple'
```

### 3. Handle Callback

Your frontend callback page (`/auth/callback`) will receive:
```
?token=<JWT_TOKEN>&isNewUser=true&provider=google&userId=123
```

### 4. Role Selection (New Users Only)

```javascript
if (isNewUser) {
  // Redirect to role selection page
  const response = await fetch('/api/v1/oauth/set-role', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'CLIENT' }) // or 'VIDEOGRAPHER' or 'VIDEO_EDITOR'
  });
}
```

## Authentication Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Provider  │────▶│   Callback  │
│  Click Login│     │ /oauth/xxx  │     │ Consent Page│     │ /xxx/callback│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                    ┌─────────────┐     ┌─────────────┐             │
                    │ Role Select │◀────│  Frontend   │◀────────────┘
                    │ (if new)    │     │  /callback  │   ?token=xxx&isNewUser=true
                    └─────────────┘     └─────────────┘
```

## Documentation Index

| Document | Description |
|----------|-------------|
| [API Reference](./API_REFERENCE.md) | Complete endpoint documentation |
| [Frontend Integration](./FRONTEND_INTEGRATION_GUIDE.md) | React/Next.js implementation |
| [Configuration Guide](./CONFIGURATION_GUIDE.md) | Provider setup instructions |
| [Security Guide](./SECURITY_GUIDE.md) | Security features & best practices |

## Base URL

```
http://localhost:8000/api/v1
```

## Related Documentation

- [Social Login Implementation Plan](../SOCIAL_LOGIN_IMPLEMENTATION.md)
- [Change Password API](../CHANGE_PASSWORD_FRONTEND_README.md)
- [Password Reset API](../PASSWORD_RESET_FRONTEND_GUIDE.md)
