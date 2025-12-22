# Developer Integration Guide

How to protect routes using the new Dynamic RBAC system.

## 1. The Middleware

Use `requirePermission` instead of `requireRole`.

```typescript
import { requirePermission } from '../../middlewares/permission.middleware';

// Protect a route
this.router.post('/apply', 
  requirePermission('projects.apply'), 
  controller.apply
);
```

### Multiple Permissions
If you pass multiple arguments, it acts as an **OR** check (user needs *at least one*).

```typescript
// Allow if user has 'projects.view' OR 'admin.dashboard'
requirePermission('projects.view', 'admin.dashboard')
```

To require **ALL** permissions, use `requireAllPermissions`:

```typescript
import { requireAllPermissions } from '../../middlewares/permission.middleware';

// Allow ONLY if user has BOTH
requireAllPermissions('projects.manage', 'finance.approve')
```

## 2. Choosing a Permission Name

When creating a new feature, do not use an existing permission unless it fits exactly.
**Format**: `module.action`

*   Good: `blog.create`, `users.ban`
*   Bad: `admin`, `create_thing`

**Process for New Features:**
1.  Define the route.
2.  Choose a granular permission string (e.g., `ai.generate`).
3.  Add it to `database/permission.schema.ts` (so it seeds for everyone).
4.  Run `npm run migrate:schema -- permission`.
5.  Assign it to a default role in `database/role_permission.schema.ts` OR via the Admin Panel.

## 3. Frontend Handling

The API returns `403 Forbidden` with a message:
`Access denied. Required permission: projects.create`

The Frontend should:
1.  Decode the JWT to read `user.permissions`.
2.  Use this array to hide/show UI elements (e.g., hide the "Delete" button if `!permissions.includes('delete')`).
