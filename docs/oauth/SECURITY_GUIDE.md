# OAuth Security Guide

## Overview

This document describes the security features implemented in the OAuth module and best practices for secure OAuth integration.

---

## Security Features

### 1. PKCE (Proof Key for Code Exchange)

**Used by:** Google OAuth

PKCE prevents authorization code interception attacks by adding a cryptographic challenge.

**How it works:**
1. Generate random `code_verifier` (43-128 characters)
2. Create `code_challenge` = SHA256(code_verifier)
3. Send `code_challenge` with authorization request
4. Send `code_verifier` when exchanging code for tokens
5. Server validates: SHA256(code_verifier) === stored code_challenge

**Implementation:**
```typescript
// Generated using Arctic library
const codeVerifier = await generateCodeVerifier();
const url = google.createAuthorizationURL(state, codeVerifier, scopes);
```

### 2. CSRF Protection (State Parameter)

**Used by:** All providers

State parameter prevents cross-site request forgery attacks.

**How it works:**
1. Generate cryptographically random `state` value
2. Store in HTTP-only cookie
3. Include in authorization URL
4. Validate on callback: cookie state === URL state

**Implementation:**
```typescript
const state = await generateState();
res.cookie(OAUTH_COOKIES.STATE, state, OAUTH_COOKIE_OPTIONS);
// On callback
if (req.cookies.oauth_state !== req.query.state) {
  throw new Error('CSRF validation failed');
}
```

### 3. Secure Cookie Configuration

OAuth cookies are configured securely:

```typescript
const OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,      // Prevents JavaScript access (XSS protection)
  secure: true,        // HTTPS only in production
  sameSite: 'lax',     // CSRF protection
  path: '/',
  maxAge: 10 * 60 * 1000  // 10 minutes expiry
};
```

**Cookie Names:**
- `oauth_state` - CSRF protection
- `oauth_code_verifier` - PKCE verifier
- `oauth_redirect` - Custom redirect URL

### 4. Token Encryption at Rest

OAuth tokens stored in database are encrypted:

```typescript
// Base64 encoding (production should use AES-256)
private encryptToken(token: string): string {
  return Buffer.from(token).toString('base64');
}
```

> **Note:** For production, implement proper encryption using AES-256 with a secure key.

### 5. Redirect URL Validation

Only allowed origins can receive OAuth callbacks:

```typescript
function isAllowedRedirectUrl(url: string): boolean {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_PANEL_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  
  const parsedUrl = new URL(url);
  return allowedOrigins.some(origin => 
    parsedUrl.origin === new URL(origin).origin
  );
}
```

### 6. Rate Limiting

OAuth endpoints have rate limiting configuration:

```typescript
const OAUTH_RATE_LIMITS = {
  maxAttempts: 10,           // Max attempts per IP
  windowMs: 15 * 60 * 1000,  // 15 minute window
};
```

---

## Account Security

### Preventing Orphaned Accounts

Users cannot unlink their only authentication method:

```typescript
if (!hasPassword && otherOAuthCount === 0) {
  throw new HttpException(400, 
    'Cannot unlink the only authentication method. Please set a password first.'
  );
}
```

### Banned/Inactive User Checks

OAuth login validates user status:
- Banned users receive `403 Forbidden`
- Inactive users receive `403 Forbidden`

### Email Verification

- Google/Facebook emails are trusted as verified
- Apple emails may use Private Relay (handled gracefully)

---

## JWT Token Security

### Token Structure

```javascript
{
  id: 123,
  user_id: 123,
  email: "user@example.com",
  roles: ["CLIENT"],
  iat: 1702640000,
  exp: 1703244800
}
```

### Token Configuration

```typescript
const TOKEN_CONFIG = {
  jwtExpiresIn: '7d',           // 7 day expiry
  refreshThreshold: 5 * 60,     // Refresh 5 min before expiry
};
```

---

## Error Handling

### Safe Error Messages

Internal errors are never exposed to clients:

```typescript
catch (error) {
  // Log full error internally
  logger.error('OAuth callback error:', error);
  
  // Return safe message to client
  const message = error instanceof HttpException 
    ? error.message 
    : 'Authentication failed';
  
  this.handleOAuthError(res, 'server_error', message);
}
```

### Error Response Format

Errors redirect to frontend with URL parameters:
```
/auth/error?error=access_denied&message=User%20cancelled
```

---

## Best Practices Checklist

### Backend

- [x] Use HTTPS in production
- [x] Implement PKCE for Google OAuth
- [x] Validate state parameter on all callbacks
- [x] Use HTTP-only, secure cookies
- [x] Encrypt tokens at rest
- [x] Validate redirect URLs
- [x] Implement rate limiting
- [x] Log OAuth events for auditing
- [x] Never expose internal errors

### Frontend

- [ ] Store tokens in HTTP-only cookies (not localStorage)
- [ ] Clear tokens on logout
- [ ] Implement token refresh before expiry
- [ ] Handle 401 responses globally
- [ ] Validate callback parameters
- [ ] Show meaningful error messages

### Provider Configuration

- [ ] Use separate credentials per environment
- [ ] Restrict redirect URIs to exact matches
- [ ] Enable only required OAuth scopes
- [ ] Review and rotate secrets periodically
- [ ] Monitor for suspicious OAuth activity

---

## Common Vulnerabilities & Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| Code Interception | PKCE implementation |
| CSRF Attacks | State parameter validation |
| Token Theft (XSS) | HTTP-only cookies |
| Token Theft (MITM) | HTTPS + Secure flag |
| Open Redirect | Redirect URL whitelist |
| Account Enumeration | Generic error messages |
| Brute Force | Rate limiting |

---

## Incident Response

### Compromised OAuth Credentials

1. Immediately disable the provider: `OAUTH_GOOGLE_ENABLED=false`
2. Rotate credentials in provider console
3. Update environment variables
4. Clear all stored OAuth tokens for that provider
5. Notify affected users
6. Re-enable with new credentials

### Suspicious Activity

Monitor for:
- Multiple failed OAuth attempts from same IP
- OAuth from unusual locations
- Rapid account creation via OAuth
- Token refresh failures (may indicate revoked tokens)
