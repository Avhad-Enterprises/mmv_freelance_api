# OAuth API Reference

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Public Endpoints

### 1. Get Available Providers

**Endpoint:** `GET /oauth/providers`

**Description:** Returns list of available OAuth providers and their status.

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OAuth providers retrieved successfully",
  "data": {
    "providers": [
      {
        "name": "google",
        "displayName": "Google",
        "enabled": true,
        "icon": "google"
      },
      {
        "name": "facebook",
        "displayName": "Facebook",
        "enabled": true,
        "icon": "facebook"
      },
      {
        "name": "apple",
        "displayName": "Apple",
        "enabled": false,
        "icon": "apple"
      }
    ]
  }
}
```

---

### 2. Initiate Google OAuth

**Endpoint:** `GET /oauth/google`

**Description:** Redirects user to Google consent screen.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `redirect` | string | No | Custom redirect URL after authentication |

**Response:** `302 Redirect` to Google OAuth consent URL

**Error Response (503):**
```json
{
  "message": "Google login is not available at this time"
}
```

---

### 3. Google OAuth Callback

**Endpoint:** `GET /oauth/google/callback`

**Description:** Handles Google OAuth callback after user grants permission.

**Authentication:** Not required

**Query Parameters (set by Google):**
| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | Authorization code from Google |
| `state` | string | CSRF protection state parameter |
| `error` | string | Error code if user denied |
| `error_description` | string | Error description |

**Success Response:** `302 Redirect` to frontend callback URL:
```
{FRONTEND_URL}/auth/callback?token=<JWT>&isNewUser=true&provider=google&userId=123
```

**Error Response:** `302 Redirect` to error URL:
```
{FRONTEND_URL}/auth/error?error=access_denied&message=You cancelled the login
```

---

### 4. Initiate Facebook OAuth

**Endpoint:** `GET /oauth/facebook`

**Description:** Redirects user to Facebook login screen.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `redirect` | string | No | Custom redirect URL after authentication |

**Response:** `302 Redirect` to Facebook OAuth URL

---

### 5. Facebook OAuth Callback

**Endpoint:** `GET /oauth/facebook/callback`

**Description:** Handles Facebook OAuth callback.

**Authentication:** Not required

**Success/Error Responses:** Same format as Google callback

---

### 6. Initiate Apple OAuth

**Endpoint:** `GET /oauth/apple`

**Description:** Redirects user to Apple Sign In screen.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `redirect` | string | No | Custom redirect URL after authentication |

**Response:** `302 Redirect` to Apple Sign In URL

---

### 7. Apple OAuth Callback

**Endpoint:** `POST /oauth/apple/callback`

**Description:** Handles Apple OAuth callback. **Note: Apple uses POST, not GET!**

**Authentication:** Not required

**Request Body (sent by Apple):**
```json
{
  "code": "authorization_code",
  "state": "csrf_state",
  "id_token": "apple_id_token",
  "user": "{\"name\":{\"firstName\":\"John\",\"lastName\":\"Doe\"},\"email\":\"john@example.com\"}"
}
```

> **Note:** Apple only sends `user` data on the first authorization. Store it immediately!

---

## Protected Endpoints

### 8. Get Linked Providers

**Endpoint:** `GET /oauth/linked`

**Description:** Returns OAuth providers linked to current user's account.

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Linked providers retrieved successfully",
  "data": {
    "providers": ["google", "facebook"]
  }
}
```

**Error Response (401):**
```json
{
  "message": "Authentication required"
}
```

---

### 9. Unlink OAuth Provider

**Endpoint:** `DELETE /oauth/unlink/:provider`

**Description:** Unlinks an OAuth provider from user's account.

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Valid Values |
|-----------|------|--------------|
| `provider` | string | `google`, `facebook`, `apple` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Google account unlinked successfully"
}
```

**Error Responses:**

**400 - Cannot unlink only auth method:**
```json
{
  "message": "Cannot unlink the only authentication method. Please set a password first or link another OAuth provider."
}
```

**404 - Provider not linked:**
```json
{
  "message": "google account is not linked"
}
```

---

### 10. Refresh OAuth Token

**Endpoint:** `POST /oauth/refresh`

**Description:** Refresh OAuth access token (currently only Google supported).

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "provider": "google"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_access_token",
    "expiresAt": "2024-12-16T10:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Unable to refresh token. Please re-authenticate with Google."
}
```

---

### 11. Set User Role

**Endpoint:** `POST /oauth/set-role`

**Description:** Set role for new OAuth user during registration flow.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "role": "CLIENT"
}
```

**Valid Roles:** `CLIENT`, `VIDEOGRAPHER`, `VIDEO_EDITOR`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Role set successfully",
  "data": {
    "user_id": 123,
    "role": "CLIENT",
    "redirect": "/dashboard/client-dashboard",
    "token": "new_jwt_with_roles"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Invalid role. Must be one of: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR"
}
```

---

### 12. Get Role Status

**Endpoint:** `GET /oauth/role-status`

**Description:** Check if user has completed role selection.

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasRole": true,
    "roles": ["CLIENT"],
    "needsRoleSelection": false
  }
}
```

**For new users without roles:**
```json
{
  "success": true,
  "data": {
    "hasRole": false,
    "roles": [],
    "needsRoleSelection": true
  }
}
```

---

## Error Codes Reference

| Error Code | Description |
|------------|-------------|
| `access_denied` | User cancelled login or denied permission |
| `invalid_state` | CSRF protection failed, session expired |
| `invalid_request` | Missing required parameters |
| `invalid_grant` | Authorization code expired or already used |
| `server_error` | Internal server error |
| `temporarily_unavailable` | Provider service unavailable |

## HTTP Status Codes

| Status | Description |
|--------|-------------|
| `200` | Success |
| `302` | Redirect (OAuth flows) |
| `400` | Bad request / Validation error |
| `401` | Unauthorized / Invalid token |
| `403` | Forbidden / Account suspended |
| `404` | Not found |
| `503` | Provider not configured/enabled |
