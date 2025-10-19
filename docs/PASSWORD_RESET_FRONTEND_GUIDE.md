# Password Reset API Documentation

## Overview
This document describes the password reset functionality for the MMV Freelance Platform API. Users can request password resets via email and then reset their password using a secure token.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Password reset endpoints do not require authentication.

## Password Reset Flow

The password reset process consists of two steps:

1. **Request Password Reset**: User provides their email address
2. **Reset Password**: User uses the token from email to set a new password

### Step 1: Request Password Reset
**Endpoint:** `POST /users/password-reset-request`

**Description:** Initiates a password reset request by sending a reset email to the user's registered email address.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Request Validation:**
- `email`: Required, must be valid email format

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### Step 2: Reset Password
**Endpoint:** `POST /users/password-reset`

**Description:** Resets the user's password using the token received via email.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123",
  "confirmPassword": "NewSecurePassword123"
}
```

**Request Validation:**
- `token`: Required, string (reset token from email)
- `newPassword`: Required, minimum 6 characters
- `confirmPassword`: Required, minimum 6 characters, must match `newPassword`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**

**Passwords Don't Match (400):**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**Invalid/Expired Token (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "newPassword",
      "message": "newPassword must be longer than or equal to 6 characters"
    }
  ]
}
```

## Validation Rules

### Email (Password Reset Request)
- Must be a valid email format
- Required field
- Maximum length: Standard email limits

### Password (Password Reset)
- Minimum 6 characters
- Required field
- Must match confirmation password

### Token (Password Reset)
- Required field
- Must be valid and not expired (1 hour validity)
- Single-use token (consumed after successful reset)

## Email Template

When a password reset is requested, the following email is sent:

**Subject:** `Password Reset Request - MMV Freelance`

**Content:**
- Personalized greeting with user's name
- Password reset request confirmation
- Reset password button/link with secure token
- Link expiration notice (1 hour)
- Security notice if user didn't request the reset
- Professional footer with app branding

**Email HTML Structure:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Password Reset Request</h2>
    <p>Hi [User Name],</p>
    <p>We received a request to reset your password for your MMV Freelance account.</p>
    <p>Click the button below to set a new password:</p>
    <p style="text-align: center;">
        <a href="[RESET_LINK]" style="display: inline-block; background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
        </a>
    </p>
    <p style="color: #666;">This link will expire in 1 hour for security reasons.</p>
    <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p>Thanks,<br>MMV Freelance Team</p>
</div>
```

## Complete Flow Implementation

### JavaScript/TypeScript Example

```javascript
// Types for better type safety
interface PasswordResetRequestData {
  email: string;
}

interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  debug?: {
    resetToken?: string;
    resetLink?: string;
  };
}

// Step 1: Request password reset
const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await fetch('/api/v1/users/password-reset-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email } as PasswordResetRequestData)
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to request password reset');
    }

    return data;
  } catch (error) {
    console.error('Password reset request failed:', error);
    throw error;
  }
};

// Step 2: Reset password using token from email
const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch('/api/v1/users/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        newPassword,
        confirmPassword
      } as PasswordResetData)
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
};

// Usage example in a React component
const PasswordResetFlow = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequestReset = async () => {
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
      setStep('reset');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, newPassword, confirmPassword);
      setMessage(result.message);
      // Redirect to login page
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset">
      {step === 'request' ? (
        <div>
          <h2>Reset Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleRequestReset} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </div>
      ) : (
        <div>
          <h2>Set New Password</h2>
          <input
            type="text"
            placeholder="Reset token from email"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleResetPassword} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};
```

### React Hook Example

```javascript
import { useState } from 'react';

const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestReset = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/users/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(true);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/users/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(true);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    requestReset,
    resetPassword,
    loading,
    error,
    success
  };
};
```

## Security Features

### Token Security
- **Expiration**: Tokens expire after 1 hour
- **Single-use**: Tokens are consumed after successful password reset
- **Cryptographically secure**: Generated using `crypto.randomBytes(32)`
- **Database storage**: Stored securely in `reset_token` and `reset_token_expires` fields

### Email Security
- **No email enumeration**: Same response for existing and non-existing emails
- **Secure SMTP**: Uses Gmail SMTP with authentication
- **HTML sanitization**: Email content is properly escaped

### Password Security
- **Minimum length**: 6 characters minimum
- **Hashing**: Passwords are hashed using bcrypt with salt rounds
- **Confirmation**: Password confirmation required to prevent typos

## Error Scenarios

### Password Reset Request
- `400 Bad Request`: Invalid email format
- `500 Internal Server Error`: Email sending failed (SMTP issues)

### Password Reset
- `400 Bad Request`: Passwords don't match, invalid token format, weak password
- `400 Bad Request`: Invalid or expired reset token
- `500 Internal Server Error`: Database error, server issues

## Frontend Integration Best Practices

### UI/UX Considerations
- **Always show success message** for password reset requests (even for non-existent emails)
- **Implement proper loading states** during API calls
- **Provide clear instructions** for users to check their email (including spam folder)
- **Include link to return to login page**
- **Handle token expiration** gracefully with user-friendly messages
- **Show password strength indicators** during password creation

### URL Handling
- **Extract token from URL**: Parse token from query parameters (`?token=abc123`)
- **Validate token format**: Basic client-side validation before API call
- **Auto-fill token field**: Pre-populate token input from URL

### Error Handling
- **Network errors**: Handle offline scenarios gracefully
- **Validation errors**: Display field-specific error messages
- **Token errors**: Provide option to request new reset email
- **Rate limiting**: Handle potential rate limiting (if implemented)

### Security Best Practices
- **HTTPS only**: Always use HTTPS in production
- **Token cleanup**: Clear tokens from URL after successful reset
- **No token logging**: Never log reset tokens in client-side code
- **Secure storage**: Don't store sensitive data in localStorage/sessionStorage

## Testing the API

### Using cURL

**Request Password Reset:**
```bash
curl -X POST http://localhost:8000/api/v1/users/password-reset-request \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Reset Password:**
```bash
curl -X POST http://localhost:8000/api/v1/users/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your_reset_token_here",
    "newPassword": "NewSecurePassword123",
    "confirmPassword": "NewSecurePassword123"
  }'
```

### Development Mode Debug Info

In development environment (`NODE_ENV=development`), the password reset request response includes debug information:

```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent",
  "debug": {
    "resetToken": "abc123def456...",
    "resetLink": "http://localhost:3000/reset-password?token=abc123def456..."
  }
}
```

**⚠️ Warning:** Debug information is only available in development mode and should never be exposed in production.

## Migration Notes

- **Field name change**: The API now uses `newPassword` and `confirmPassword` instead of `new_password`
- **Enhanced validation**: Password confirmation is now required
- **Improved security**: Tokens are single-use and expire after 1 hour
- **Better error handling**: More specific error messages for different failure scenarios