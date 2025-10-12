# Password Reset API Documentation

## Overview
This document describes the password reset functionality for the MMV Freelance Platform API. Users can request password resets via email.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Password reset endpoints do not require authentication.

## Endpoints

### 1. Request Password Reset
**Endpoint:** `POST /users/password-reset-request`

**Description:** Initiates a password reset request by sending a reset email to the user's registered email address.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

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

### 2. Reset Password
**Endpoint:** `POST /users/password-reset`

**Description:** Resets the user's password using the token received via email.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

## Validation Rules

### Email
- Must be a valid email format
- Required field

### Password
- Minimum 6 characters
- Required field

### Token
- Required field
- Must be valid and not expired (1 hour validity)

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

## Flow Example

```javascript
// Step 1: Request password reset
const requestPasswordReset = async (email) => {
  const response = await fetch('/api/v1/users/password-reset-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json();
  return data;
};

// Step 2: Reset password using token from email
const resetPassword = async (token, newPassword) => {
  const response = await fetch('/api/v1/users/password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: token,
      new_password: newPassword
    })
  });

  const data = await response.json();
  return data;
};
```

## Security Notes
- Reset tokens expire after 1 hour
- Password reset requests don't reveal if email exists (prevents enumeration)
- Tokens are single-use (consumed after successful reset)
- Passwords are hashed using bcrypt
- Email sending uses Gmail SMTP with secure authentication

## Error Scenarios

### Password Reset Request
- `400 Bad Request`: Invalid email format
- `500 Internal Server Error`: Email sending failed

### Password Reset
- `400 Bad Request`: Invalid token, expired token, or weak password
- `404 Not Found`: Invalid reset token
- `500 Internal Server Error`: Server error

## Frontend Integration Notes
- Always show success message for password reset requests (even for non-existent emails)
- Implement proper loading states during email sending
- Provide clear instructions for users to check their email
- Include link to return to login page
- Handle token expiration gracefully with user-friendly messages