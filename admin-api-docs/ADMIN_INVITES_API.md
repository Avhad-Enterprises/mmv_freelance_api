# Admin Invites API Documentation

## Overview
The Admin Invites API allows administrators to invite new users to join the platform. Invitations are sent via email with a secure token that allows users to accept the invitation and set up their account.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All admin invite endpoints require authentication with `ADMIN` or `SUPER_ADMIN` role.

## Endpoints

### 1. Create Admin Invitation
Send an invitation to a new user to join the platform.

**Endpoint:** `POST /admin/invites`

**Authorization:** Required (ADMIN or SUPER_ADMIN role)

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "assigned_role": "CLIENT", // Optional: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN
  "password": "securepassword123" // Optional: If not provided, user will set password during acceptance
}
```

**Response (201 Created):**
```json
{
  "invitation_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "status": "pending",
  "assigned_role": "CLIENT",
  "invited_by": 1,
  "expires_at": "2025-11-20T11:47:04.000Z",
  "created_at": "2025-11-13T11:47:04.000Z",
  "updated_at": "2025-11-13T11:47:04.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Email already exists or invitation already pending
- `401 Unauthorized`: Invalid or missing authentication
- `403 Forbidden`: Insufficient permissions

### 2. Accept Invitation
Accept an admin invitation using the token from the email.

**Endpoint:** `POST /admin/invites/accept`

**Authorization:** Not required (public endpoint)

**Request Body:**
```json
{
  "token": "79d84e2d95f5170f98fa008459eff64c5be02c978181f7692be67f106b5a0468",
  "new_password": "userchosenpassword123" // Required if no password was set during invitation
}
```

**Response (200 OK):**
```json
{
  "message": "Invitation accepted successfully. Welcome to the platform!",
  "user_id": 123
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired token
- `404 Not Found`: Invitation not found

### 3. Get All Invitations
Retrieve a list of all admin invitations.

**Endpoint:** `GET /admin/invites`

**Authorization:** Required (ADMIN or SUPER_ADMIN role)

**Response (200 OK):**
```json
[
  {
    "invitation_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "status": "pending",
    "assigned_role": "CLIENT",
    "invited_by": 1,
    "expires_at": "2025-11-20T11:47:04.000Z",
    "created_at": "2025-11-13T11:47:04.000Z",
    "updated_at": "2025-11-13T11:47:04.000Z"
  }
]
```

### 4. Revoke Invitation
Cancel a pending invitation.

**Endpoint:** `DELETE /admin/invites/:id`

**Authorization:** Required (ADMIN or SUPER_ADMIN role)

**Response (200 OK):**
```json
{
  "message": "Invitation revoked successfully"
}
```

**Error Responses:**
- `404 Not Found`: Invitation not found or already processed

## Invitation Flow

1. **Admin creates invitation** via `POST /admin/invites`
2. **Email is sent** to the invited user with a link to `ADMIN_PANEL_URL/login?token=...`
3. **User clicks link** and is redirected to the admin panel login page with the token
4. **User accepts invitation** via `POST /admin/invites/accept` with the token
5. **Account is created** and user can log in

## Email Template

The invitation email includes:
- Welcome message with inviter's name
- Secure invitation link pointing to admin panel
- Expiration notice (7 days)
- Contact information for support

## Configuration

The invitation system uses the following environment variables:
- `ADMIN_PANEL_URL`: URL of the admin panel (default: `http://localhost:3000`)
- `FRONTEND_APPNAME`: App name displayed in emails (default: `MMV Freelance`)

## Security Features

- **Secure tokens**: 64-character hex tokens generated using crypto.randomBytes()
- **Expiration**: Invitations expire after 7 days
- **Single use**: Tokens can only be used once
- **Role-based access**: Only admins can create/manage invitations
- **Email verification**: Prevents duplicate invitations for the same email

## Status Values

- `pending`: Invitation sent, awaiting acceptance
- `accepted`: Invitation accepted, account created
- `expired`: Invitation expired without acceptance
- `revoked`: Invitation cancelled by admin

## Rate Limiting

Consider implementing rate limiting for invitation creation to prevent abuse.

## Testing

Use the following curl commands for testing:

```bash
# Create invitation
curl -X POST http://localhost:8000/api/v1/admin/invites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "assigned_role": "CLIENT"
  }'

# Accept invitation
curl -X POST http://localhost:8000/api/v1/admin/invites/accept \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "new_password": "password123"
  }'
```