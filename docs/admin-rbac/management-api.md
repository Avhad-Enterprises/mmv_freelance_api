# Admin RBAC Management API

This module provides authorized administration endpoints for managing the Dynamic RBAC system. It allows Super Admins to create roles, define permissions, and configure the Role-Permission Matrix.

**Base URL**: `/api/v1/admin/rbac`
**Auth**: Requires `SUPER_ADMIN` role.

---

## 1. Role Management

### Create Role
*   **POST** `/roles`
*   **Body**:
    ```json
    {
      "name": "MODERATOR",
      "label": "Community Moderator",
      "description": "Manages community content",
      "is_active": true
    }
    ```
*   **Response**: `201 Created`

### Update Role
*   **PUT** `/roles/:id`
*   **Body**: (Partial Update)
    ```json
    {
      "description": "Updated description",
      "is_active": false
    }
    ```

### Delete Role
*   **DELETE** `/roles/:id`
*   **Constraint**: Cannot delete system roles or roles assigned to users.

---

## 2. Permission Management

### Create Permission
*   **POST** `/permissions`
*   **Body**:
    ```json
    {
      "name": "blog.publish",
      "label": "Publish Blog Posts",
      "module": "blog",
      "description": "Can publish drafts",
      "is_critical": false
    }
    ```

### Update Permission
*   **PUT** `/permissions/:id`
*   **Body**: `{ "label": "New Label" }`

### Delete Permission
*   **DELETE** `/permissions/:id`

---

## 3. The Role Matrix (Linking)

These endpoints allow modifying the relationship between Roles and Permissions.

### Assign Permission to Role
*   **POST** `/roles/:roleId/permissions`
*   **Body**: `{ "permission_id": 123 }`

### Remove Permission from Role
*   **DELETE** `/roles/:roleId/permissions/:permissionId`

### Bulk Update Role Permissions (Matrix Save)
*   **PUT** `/roles/:roleId/permissions`
*   **Body**:
    ```json
    {
      "permission_ids": [101, 102, 105] // Replaces entire permission set for this role
    }
    ```
