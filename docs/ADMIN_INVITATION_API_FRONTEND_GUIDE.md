# Admin Invitation API Documentation

## Overview
This document describes the admin invitation functionality for the MMV Freelance Platform API. Administrators can invite new users to join the platform with specific roles.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Admin endpoints require JWT authentication with `ADMIN` or `SUPER_ADMIN` role. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Admin Invitation
**Endpoint:** `POST /admin/invites`

**Description:** Creates a new invitation and sends an email with login credentials to the invited user.

**Authentication:** Required (ADMIN, SUPER_ADMIN)

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "assigned_role": "CLIENT",
  "password": "TempPass123" // Optional: temporary password
}
```

**Response (Success - 201):**
```json
{
  "data": {
    "invitation_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "status": "pending",
    "assigned_role": "CLIENT",
    "invited_by": 123,
    "expires_at": "2025-10-13T08:00:00.000Z",
    "created_at": "2025-10-12T08:00:00.000Z",
    "updated_at": "2025-10-12T08:00:00.000Z"
  },
  "message": "Invitation sent successfully"
}
```

**Response (Error):**
```json
{
  "message": "User with this email already exists"
}
```

### 2. Accept Invitation
**Endpoint:** `POST /admin/invites/accept`

**Description:** Allows invited users to accept their invitation and complete registration.

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "token": "invitation_token_here",
  "new_password": "NewSecurePass123" // Optional: change temporary password
}
```

**Response (Success - 200):**
```json
{
  "data": {
    "user_id": 456,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "CLIENT"
  },
  "message": "Invitation accepted successfully. You can now login."
}
```

**Response (Error):**
```json
{
  "message": "Invalid or expired invitation token"
}
```

### 3. Get All Invitations
**Endpoint:** `GET /admin/invites`

**Description:** Retrieves all admin invitations (for admin dashboard).

**Authentication:** Required (ADMIN, SUPER_ADMIN)

**Response (Success - 200):**
```json
{
  "data": [
    {
      "invitation_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "status": "pending",
      "assigned_role": "CLIENT",
      "invited_by": 123,
      "expires_at": "2025-10-13T08:00:00.000Z",
      "created_at": "2025-10-12T08:00:00.000Z",
      "updated_at": "2025-10-12T08:00:00.000Z"
    }
  ],
  "message": "Invitations retrieved successfully"
}
```

### 4. Revoke Invitation
**Endpoint:** `DELETE /admin/invites/:id`

**Description:** Revokes a pending invitation.

**Authentication:** Required (ADMIN, SUPER_ADMIN)

**Path Parameters:**
- `id` (number): Invitation ID

**Response (Success - 200):**
```json
{
  "message": "Invitation revoked successfully"
}
```

## Validation Rules

### Create Invitation
- `first_name`: Required, string
- `last_name`: Required, string
- `email`: Required, valid email format
- `assigned_role`: Optional, must be valid role (CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN)
- `password`: Optional, minimum 8 characters

### Accept Invitation
- `token`: Required, valid invitation token
- `new_password`: Optional, minimum 8 characters

## Email Template

When an invitation is created, the following email is sent:

**Subject:** `You're Invited to Join MMV Freelance`

**Content:**
- Welcome message with user's name
- Login credentials (email and temporary password)
- Invitation acceptance link
- Security notice to change password after first login
- Link expiration notice (24 hours)

## Flow Example

```javascript
// Admin creates invitation
const createInvitation = async (invitationData) => {
  const response = await fetch('/api/v1/admin/invites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer admin_jwt_token'
    },
    body: JSON.stringify({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      assigned_role: 'CLIENT',
      password: 'TempPass123'
    })
  });

  const data = await response.json();
  return data;
};

// Invited user accepts invitation
const acceptInvitation = async (token, newPassword) => {
  const response = await fetch('/api/v1/admin/invites/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: token,
      new_password: newPassword // Optional
    })
  });

  const data = await response.json();
  return data;
};
```

## Security Notes
- Invitation tokens expire after 24 hours
- Tokens are single-use (consumed after acceptance)
- Passwords are hashed using bcrypt
- Email addresses are validated for uniqueness
- Only admins can create and manage invitations

## Error Scenarios

### Create Invitation
- `400 Bad Request`: Invalid data or email already exists
- `401 Unauthorized`: Invalid/missing JWT token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Email sending failed

### Accept Invitation
- `400 Bad Request`: Invalid token or password
- `404 Not Found`: Token not found or expired
- `500 Internal Server Error`: Server error

## Status Values
- `pending`: Invitation sent, not yet accepted
- `accepted`: User has accepted the invitation
- `revoked`: Admin has revoked the invitation
- `expired`: Invitation has expired (24 hours)</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/ADMIN_INVITATION_API_FRONTEND_GUIDE.md