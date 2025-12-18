# RBAC Public/Read API Reference

This reference details the read-only endpoints used for retrieving Role and Permission data. These are used by the frontend to populate selectors, matrix views, and verify configuration.

**For full management capabilities (Create/Update/Delete), please refer to the [Admin RBAC Management API](../admin-rbac/management-api.md).**

**Base URL**: `/api/v1`

---

## 1. Roles (Read-Only)

### Get All Roles
*   **GET** `/role`
*   **Access**: `ADMIN`, `SUPER_ADMIN`
*   **Response**: List of all system roles.
*   **Use Case**: Populating a "Role" dropdown in User Management.

### Get Role Permissions
*   **GET** `/role/:id/permissions`
*   **Access**: `ADMIN`, `SUPER_ADMIN`
*   **Response**: List of permissions currently assigned to the role.

---

## 2. Permissions (Read-Only)

### Get All Permissions
*   **GET** `/permission`
*   **Access**: `ADMIN`, `SUPER_ADMIN`
*   **Response**: Complete catalog of available system permissions.
*   **Use Case**: Rendering the "Permission Matrix" table.

---

## 3. Deprecated / Moved Operations

**IMPORTANT**: The following operations have been moved to `/api/v1/admin/rbac/*` and require strict `SUPER_ADMIN` privileges.

*   `POST /role` → Moved to `POST /admin/rbac/roles`
*   `PUT /role/:id` → Moved to `PUT /admin/rbac/roles/:id`
*   `DELETE /role/:id` → Moved to `DELETE /admin/rbac/roles/:id`
*   `POST /permission` → Moved to `POST /admin/rbac/permissions`
*   `POST /role/:id/permissions` → Moved to `POST /admin/rbac/roles/:id/permissions`
