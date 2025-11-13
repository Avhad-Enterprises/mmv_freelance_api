# Admin Invitation System - Frontend Integration Guide

## Overview

This guide provides everything needed to integrate the new admin invitation flow into your frontend application. The system allows admins to invite new admins via email, who then complete their registration through a dedicated page.

---

## Flow Diagram

```
┌──────────────┐
│ Admin Panel  │
│ (Logged In)  │
└──────┬───────┘
       │ 1. Enter email only
       ▼
┌──────────────────────┐
│ POST /admin/invites  │
│ (Authenticated)      │
└──────┬───────────────┘
       │ 2. System sends email
       ▼
┌──────────────────────────────┐
│ Email with registration link │
│ /register?token=xxx          │
└──────┬───────────────────────┘
       │ 3. User clicks link
       ▼
┌─────────────────────────────────┐
│ GET /admin/invites/verify       │
│ Validates token, shows email    │
└──────┬──────────────────────────┘
       │ 4. Token valid
       ▼
┌─────────────────────────────────┐
│ Registration Form               │
│ - First Name                    │
│ - Last Name                     │
│ - Email (pre-filled, disabled)  │
│ - Password                      │
│ - Confirm Password              │
└──────┬──────────────────────────┘
       │ 5. Submit registration
       ▼
┌──────────────────────────────────┐
│ POST /admin/invites/register     │
│ Returns user + JWT token         │
└──────┬───────────────────────────┘
       │ 6. Auto-login
       ▼
┌──────────────────────┐
│ Admin Dashboard      │
│ (Logged In)          │
└──────────────────────┘
```

---

## API Endpoints

### Base URL
```
http://localhost:5001/api
```

---

## 1. Create Admin Invitation

**Endpoint:** `POST /admin/invites`  
**Authentication:** Required (JWT Bearer Token)  
**Authorization:** ADMIN or SUPER_ADMIN role  
**Description:** Admin creates a new invitation by providing only the invitee's email address.

### Request Headers
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "email": "newadmin@example.com"
}
```

### Validation Rules
- `email` (required): Must be a valid email format
- Email must not already exist in the system

### Success Response (201 Created)
```json
{
  "data": {
    "invitation_id": 5,
    "email": "newadmin@example.com",
    "status": "pending",
    "invited_by": 1,
    "expires_at": "2025-11-21T10:30:00.000Z",
    "created_at": "2025-11-14T10:30:00.000Z",
    "updated_at": "2025-11-14T10:30:00.000Z"
  },
  "message": "Invitation sent successfully"
}
```

### Error Responses

**400 Bad Request** - Invalid data
```json
{
  "message": "Invalid invitation data"
}
```

**400 Bad Request** - Email already exists
```json
{
  "message": "User with this email already exists"
}
```

**401 Unauthorized** - No token provided
```json
{
  "message": "Authentication token missing"
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "message": "Insufficient permissions"
}
```

### Frontend Implementation Example

```typescript
// TypeScript/React Example
async function sendAdminInvite(email: string) {
  try {
    const response = await fetch('http://localhost:5001/api/admin/invites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log('Invitation sent:', data);
    
    // Show success message to admin
    alert(`Invitation sent to ${email}`);
    return data;
  } catch (error) {
    console.error('Error sending invitation:', error);
    // Show error message to admin
    alert(error.message);
    throw error;
  }
}
```

---

## 2. Verify Invitation Token

**Endpoint:** `GET /admin/invites/verify`  
**Authentication:** Not required (Public)  
**Description:** Validates the invitation token and returns the associated email. Call this when user lands on registration page.

### Query Parameters
- `token` (required): The invitation token from the email link

### Request Example
```
GET /admin/invites/verify?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Success Response (200 OK)
```json
{
  "data": {
    "email": "newadmin@example.com",
    "expires_at": "2025-11-21T10:30:00.000Z"
  },
  "message": "Token is valid"
}
```

### Error Responses

**400 Bad Request** - Missing token
```json
{
  "message": "Invitation token is required"
}
```

**404 Not Found** - Invalid token
```json
{
  "message": "Invalid or expired invitation token"
}
```

**400 Bad Request** - Expired token
```json
{
  "message": "Invitation has expired"
}
```

**400 Bad Request** - Already used
```json
{
  "message": "Invitation has already been accepted"
}
```

### Frontend Implementation Example

```typescript
// TypeScript/React Example
async function verifyInvitationToken(token: string) {
  try {
    const response = await fetch(
      `http://localhost:5001/api/admin/invites/verify?token=${encodeURIComponent(token)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log('Token verified:', data);
    
    // Pre-fill email in registration form
    return data.data; // { email: "...", expires_at: "..." }
  } catch (error) {
    console.error('Token verification failed:', error);
    // Redirect to error page or show message
    throw error;
  }
}

// Usage in Registration Page Component
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  if (!token) {
    // Redirect to login or show error
    navigate('/login');
    return;
  }
  
  verifyInvitationToken(token)
    .then(({ email }) => {
      setEmail(email); // Pre-fill email field
      setTokenValid(true);
    })
    .catch(() => {
      setTokenValid(false);
      // Show error message
    });
}, []);
```

---

## 3. Complete Registration

**Endpoint:** `POST /admin/invites/register`  
**Authentication:** Not required (Public)  
**Description:** Completes the admin registration process. Creates user account, assigns ADMIN role, and returns JWT token for auto-login.

### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "first_name": "John",
  "last_name": "Doe",
  "email": "newadmin@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

### Validation Rules
- `token` (required): Must be a valid invitation token
- `first_name` (required): String, min 2 characters
- `last_name` (required): String, min 2 characters
- `email` (required): Must match the email in the invitation
- `password` (required): String, min 8 characters
- `confirm_password` (required): Must match password

### Success Response (201 Created)
```json
{
  "data": {
    "user": {
      "user_id": 15,
      "email": "newadmin@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "ADMIN",
      "is_active": true,
      "is_banned": false,
      "created_at": "2025-11-14T10:35:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNSwiZW1haWwiOiJuZXdhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTYzMTYxNjkwMCwiZXhwIjoxNjMxNzAzMzAwfQ.abc123def456"
  },
  "message": "Registration completed successfully"
}
```

### Error Responses

**400 Bad Request** - Invalid data
```json
{
  "message": "Invalid registration data"
}
```

**400 Bad Request** - Validation error
```json
{
  "message": "first_name must be at least 2 characters long"
}
```

**400 Bad Request** - Email mismatch
```json
{
  "message": "Email does not match invitation"
}
```

**400 Bad Request** - Password mismatch
```json
{
  "message": "Passwords do not match"
}
```

**404 Not Found** - Invalid token
```json
{
  "message": "Invalid or expired invitation token"
}
```

**400 Bad Request** - Email already exists
```json
{
  "message": "User with this email already exists"
}
```

### Frontend Implementation Example

```typescript
// TypeScript/React Example
interface RegistrationFormData {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

async function completeRegistration(formData: RegistrationFormData) {
  try {
    const response = await fetch('http://localhost:5001/api/admin/invites/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: formData.token,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    
    // Store JWT token for auto-login
    localStorage.setItem('authToken', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    // Redirect to admin dashboard
    window.location.href = '/admin/dashboard';
    
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    // Show error message to user
    throw error;
  }
}
```

---

## Complete Frontend Flow Examples

### Admin Panel - Invite New Admin

```tsx
// InviteAdminForm.tsx
import React, { useState } from 'react';

export function InviteAdminForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5001/api/admin/invites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setSuccess(true);
      setEmail(''); // Clear form
      alert('Invitation sent successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-admin-form">
      <h2>Invite New Admin</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="newadmin@example.com"
            required
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Invitation sent!</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Invitation'}
        </button>
      </form>
    </div>
  );
}
```

### Registration Page

```tsx
// AdminRegistrationPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AdminRegistrationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  // Verify token on page load
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setError('No invitation token provided');
      setVerifying(false);
      return;
    }
    
    setToken(tokenParam);
    verifyToken(tokenParam);
  }, [searchParams]);

  const verifyToken = async (tokenValue: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/admin/invites/verify?token=${encodeURIComponent(tokenValue)}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      setEmail(data.data.email);
      setVerifying(false);
    } catch (err) {
      setError(err.message);
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/admin/invites/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          confirm_password: confirmPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      
      // Store authentication token
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return <div className="loading">Verifying invitation...</div>;
  }

  if (error && !token) {
    return (
      <div className="error-page">
        <h2>Invalid Invitation</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <h1>Complete Admin Registration</h1>
      <p>You've been invited to join as an administrator</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            minLength={2}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            minLength={2}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
            className="disabled-input"
          />
          <small>This email is from your invitation</small>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={loading}
          />
          <small>Minimum 8 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
}
```

---

## Additional APIs (Already Existing)

### Get All Invitations

**Endpoint:** `GET /admin/invites`  
**Authentication:** Required (ADMIN or SUPER_ADMIN)

```typescript
const response = await fetch('http://localhost:5001/api/admin/invites', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
```

### Revoke Invitation

**Endpoint:** `DELETE /admin/invites/:id`  
**Authentication:** Required (ADMIN or SUPER_ADMIN)

```typescript
const response = await fetch(`http://localhost:5001/api/admin/invites/${invitationId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
```

---

## Environment Variables

Ensure your frontend knows these URLs:

```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_ADMIN_PANEL_URL=http://localhost:3000
```

---

## Error Handling Best Practices

```typescript
async function apiCall(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    // Check if response is ok (status 200-299)
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }
    
    return await response.json();
  } catch (error) {
    // Network errors or JSON parsing errors
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}
```

---

## Testing with cURL

### 1. Create Invitation (as admin)
```bash
curl -X POST http://localhost:5001/api/admin/invites \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Verify Token
```bash
curl "http://localhost:5001/api/admin/invites/verify?token=YOUR_TOKEN_HERE"
```

### 3. Complete Registration
```bash
curl -X POST http://localhost:5001/api/admin/invites/register \
  -H "Content-Type: application/json" \
  -d '{
    "token":"YOUR_TOKEN_HERE",
    "first_name":"John",
    "last_name":"Doe",
    "email":"test@example.com",
    "password":"SecurePass123!",
    "confirm_password":"SecurePass123!"
  }'
```

---

## Key Points for Frontend Implementation

1. **Token from URL**: Extract token from URL query parameter on registration page
2. **Email Pre-fill**: Call verify endpoint first to get email and pre-fill the form
3. **Disable Email Field**: Email should be displayed but not editable
4. **Password Validation**: Implement client-side validation (min 8 chars, match confirmation)
5. **Auto-login**: After successful registration, store JWT token and redirect to dashboard
6. **Error Handling**: Show user-friendly error messages for all failure scenarios
7. **Loading States**: Show loading indicators during API calls
8. **Token Expiry**: Handle expired token gracefully (7-day expiry from invitation creation)

---

## Security Notes

- Registration endpoints are public (no authentication required)
- Token is single-use and expires in 7 days
- All invited users automatically receive ADMIN role
- Passwords are hashed server-side using bcrypt
- JWT tokens expire in 24 hours (configurable)

---

## Support

For questions or issues, contact the backend team or refer to:
- Full Documentation: `docs/ADMIN_INVITE_FLOW_V2.md`
- Quick Reference: `admin-api-docs/ADMIN_INVITE_FLOW_V2_QUICK_REF.md`
