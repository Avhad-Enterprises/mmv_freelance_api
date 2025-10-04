# User Profile Management API Documentation

## Overview
This document describes the authenticated user profile management endpoints for the MMV Freelance Platform API. All endpoints require a valid JWT token in the Authorization header.

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get Current User Profile
**Endpoint:** `GET /api/v1/users/me`

**Description:** Retrieves the current user's complete profile information including type-specific data.

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "username": "johndoe",
      // ... other user fields
    },
    "profile": {
      // Type-specific profile data (client/freelancer/admin)
      // Only included if profile exists
    }
  }
}
```

### 2. Update User Profile
**Endpoint:** `PATCH /api/v1/users/me`

**Description:** Updates the current user's profile information. All fields are optional - only provided fields will be updated.

**Request Body (example):**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "johnsmith@example.com",
  "phone_number": "+1234567890",
  "bio": "Updated bio",
  "city": "New York",
  "country": "USA",
  "email_notifications": false
}
```

**Available Fields:**
- `first_name`, `last_name`: string
- `username`: string
- `email`: valid email format
- `phone_number`: string
- `phone_verified`, `email_verified`: boolean
- `profile_picture`: valid URL
- `bio`: string
- `timezone`: string
- `address_line_first`, `address_line_second`: string
- `city`, `state`, `country`, `pincode`: string
- `email_notifications`: boolean

**Response (Success):**
```json
{
  "success": true,
  "message": "User info updated successfully",
  "data": {
    // Updated user object
  }
}
```

### 3. Delete Account
**Endpoint:** `DELETE /api/v1/users/me`

**Description:** Soft deletes the current user's account. The account becomes inactive but data is preserved.

**Response (Success):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Note:** This is a soft delete. The account is marked as deleted but can potentially be restored by administrators.

### 4. Get User Roles
**Endpoint:** `GET /api/v1/users/me/roles`

**Description:** Retrieves the current user's assigned roles.

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "role_id": 1,
        "name": "CLIENT",
        "label": "Client",
        "description": "Business or individual hiring freelancers"
      }
    ]
  }
}
```

### 5. Check Profile Status
**Endpoint:** `GET /api/v1/users/me/has-profile`

**Description:** Checks if the current user has a type-specific profile (client, freelancer, or admin profile).

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "hasProfile": true
  }
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Errors:
- `401 Unauthorized`: Invalid or missing JWT token
- `400 Bad Request`: Validation errors (invalid email, etc.)
- `404 Not Found`: User not found (for profile-related endpoints)
- `500 Internal Server Error`: Server errors

## Validation Rules

### Email Updates
- Must be valid email format
- Cannot update to an email already used by another user

### Profile Picture
- Must be a valid URL if provided

### Boolean Fields
- `phone_verified`, `email_verified`, `email_notifications` must be true/false

## Usage Examples

```javascript
// Get user profile
const getProfile = async () => {
  const response = await fetch('/api/v1/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Update profile
const updateProfile = async (updates) => {
  const response = await fetch('/api/v1/users/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};

// Delete account
const deleteAccount = async () => {
  const response = await fetch('/api/v1/users/me', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Get user roles
const getRoles = async () => {
  const response = await fetch('/api/v1/users/me/roles', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Check profile status
const checkProfile = async () => {
  const response = await fetch('/api/v1/users/me/has-profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Security Notes
- All endpoints require valid JWT authentication
- Users can only modify their own profile
- Email uniqueness is enforced across all users
- Profile updates are validated before saving
- Account deletion is soft delete (data preservation)