# Password Reset API Documentation

## Overview
This document describes the password reset functionality for the MMV Freelance Platform API.

## Endpoints

### 1. Request Password Reset
**Endpoint:** `POST /api/v1/users/password-reset-request`

**Description:** Initiates a password reset request by sending a reset token to the user's email.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**Notes:**
- Always returns success for security reasons (prevents email enumeration)
- Reset token is valid for 1 hour
- Email sending is not yet implemented (TODO)

### 2. Reset Password
**Endpoint:** `POST /api/v1/users/password-reset`

**Description:** Resets the user's password using the reset token.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset_token_here",
  "new_password": "new_password_here"
}
```

**Response (Success):**
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
  "message": "Error message (invalid token, expired, etc.)"
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
- Must be valid and not expired

## Error Scenarios

### Password Reset Request
- `400 Bad Request`: Invalid email format
- `500 Internal Server Error`: Server error

### Password Reset
- `400 Bad Request`: Invalid token, expired token, or weak password
- `404 Not Found`: Invalid reset token
- `500 Internal Server Error`: Server error

## Flow Example

```javascript
// Step 1: Request password reset
const requestReset = async (email) => {
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

// Step 2: Reset password (user gets token from email)
const resetPassword = async (token, newPassword) => {
  const response = await fetch('/api/v1/users/password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token,
      new_password: newPassword
    })
  });

  const data = await response.json();
  return data;
};
```

## Security Notes
- Reset tokens expire after 1 hour
- Password reset requests don't reveal if email exists
- Tokens are single-use (consumed after successful reset)
- Passwords are hashed using bcrypt

## Development Notes
- Email sending functionality is not yet implemented
- In development mode, tokens are generated but not exposed in responses
- All endpoints return consistent JSON response format