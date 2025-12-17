# Dynamic RBAC System - Overview

## 1. Introduction

The Dynamic Role-Based Access Control (RBAC) system replaces hardcoded role checks with a flexible, database-driven permission system.

**Core Philosophy:**
*   **Roles** are just containers (e.g., "Client", "Gold Member").
*   **Permissions** are the actual keys to features (e.g., `projects.create`, `analytics.view`).
*   **Dynamic**: You can assign any permission to any role at runtime via the Admin API.
*   **High Performance**: Permissions are embedded in the JWT token, ensuring **Zero Database Latency** on API requests.

## 2. Architecture

### The "JWT Optimization" Flow

1.  **Login**:
    *   User logs in with email/password.
    *   System fetches the user's Roles.
    *   System performs a JOIN to get all distinct **Permissions** associated with those roles.
    *   System signs a JWT containing a special `permissions: [...]` array.
    
2.  **Request Guard (`requirePermission`)**:
    *   Middleware intercepts the request.
    *   It decodes the JWT.
    *   It checks `req.user.permissions.includes('required_action')`.
    *   **Result**: 0ms latency check. No database query is made.

### 3. The Database Model

*   **`users`** <--> **`user_roles`** <--> **`role`**
*   **`role`** <--> **`role_permission`** <--> **`permission`**

## 4. Module Structure

The system is split into two distinct API modules:

1.  **Public/Read Entity Layer** (`/api/v1/role`, `/api/v1/permission`):
    *   Read-only endpoints.
    *   Used by the frontend to fetch lists for dropdowns and displays.
2.  **Admin Management Layer** (`/api/v1/admin/rbac/*`):
    *   **Strictly Protected** (Super Admin only).
    *   Handles Creation, Updates, Deletion, and Linking (The Matrix).
    *   See [Admin Management API Docs](../admin-rbac/management-api.md).

## 5. Super Admin "Bypass"

The `SUPER_ADMIN` role has a hardcoded bypass in the middleware. They do not need explicit permissions assigned in the database. This prevents accidental lockouts.

```typescript
if (user.roles.includes('SUPER_ADMIN')) return next();
```

## 6. Trade-offs

*   **Instant Access Revocation**: If you remove a permission from a Role in the Admin Panel, it will **Not** take effect for logged-in users until their JWT expires (24h) or they re-login.
*   **Token Size**: The JWT payload is slightly larger as it contains the list of permission strings.
