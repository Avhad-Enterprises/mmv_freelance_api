# Assign Role to User API Documentation

## Overview
The Assign Role to User endpoint allows super administrators to assign roles to users. This endpoint validates the role name and assigns it to the specified user.

## Endpoint
```
POST /api/v1/users/:id/roles
```

## Authentication
- **Required**: Yes (Bearer token)
- **Token Type**: JWT
- **Header**: `Authorization: Bearer <jwt_token>`
- **Required Role**: SUPER_ADMIN

## Request

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID to assign role to |

### Request Body
```json
{
  "roleName": "CLIENT"
}
```

#### Body Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roleName` | string | Yes | Role name to assign. Must be one of: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN |

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Role \"CLIENT\" assigned to user successfully"
}
```

### Error Responses

#### Authentication/Authorization Errors
**401 Unauthorized** - Invalid token
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**404 Not Found** - Missing Authorization header
```json
{
  "success": false,
  "message": "Not Found"
}
```

**403 Forbidden** - Insufficient permissions (not SUPER_ADMIN)
```json
{
  "success": false,
  "message": "Forbidden"
}
```

#### Validation Errors
**400 Bad Request** - Missing or invalid role name
```json
{
  "success": false,
  "message": "Role name is required"
}
```

**400 Bad Request** - Invalid role name (not in allowed list)
```json
{
  "success": false,
  "message": "Invalid role name"
}
```

#### Server Errors (500 Internal Server Error)
**Invalid User ID Format** - Non-numeric user ID
```
HTTP 500 Internal Server Error
```

**User Not Found** - User doesn't exist
```
HTTP 500 Internal Server Error
```

## Usage Examples

### JavaScript (Fetch API)
```javascript
// Assign role to user
const assignRoleToUser = async (userId, roleName) => {
  try {
    const response = await fetch(`/api/v1/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ roleName })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Role assigned successfully:', data.message);
      return true;
    } else {
      console.error('Failed to assign role:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### React Hook Example
```javascript
import { useState } from 'react';

const AssignRoleForm = ({ userId, onRoleAssigned }) => {
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableRoles = ['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roleName })
      });

      const data = await response.json();

      if (data.success) {
        setRoleName('');
        onRoleAssigned && onRoleAssigned();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="assign-role-form">
      <h3>Assign Role to User</h3>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="roleName">Select Role:</label>
        <select
          id="roleName"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          disabled={loading}
        >
          <option value="">Choose a role...</option>
          {availableRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading || !roleName}>
        {loading ? 'Assigning...' : 'Assign Role'}
      </button>
    </form>
  );
};
```

### Vue.js Example
```javascript
<template>
  <form @submit.prevent="assignRole" class="assign-role-form">
    <h3>Assign Role to User</h3>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="form-group">
      <label for="roleName">Select Role:</label>
      <select
        id="roleName"
        v-model="roleName"
        :disabled="loading"
      >
        <option value="">Choose a role...</option>
        <option
          v-for="role in availableRoles"
          :key="role"
          :value="role"
        >
          {{ role }}
        </option>
      </select>
    </div>

    <button type="submit" :disabled="loading || !roleName">
      {{ loading ? 'Assigning...' : 'Assign Role' }}
    </button>
  </form>
</template>

<script>
export default {
  props: ['userId'],
  emits: ['role-assigned'],
  data() {
    return {
      roleName: '',
      availableRoles: ['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN'],
      loading: false,
      error: ''
    };
  },
  methods: {
    async assignRole() {
      if (!this.roleName) return;

      this.loading = true;
      this.error = '';

      try {
        const response = await fetch(`/api/v1/users/${this.userId}/roles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleName: this.roleName })
        });

        const data = await response.json();

        if (data.success) {
          this.roleName = '';
          this.$emit('role-assigned');
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = 'Network error occurred';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

### Angular Example
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ApiResponse {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-assign-role',
  template: `
    <form (ngSubmit)="assignRole()" #roleForm="ngForm" class="assign-role-form">
      <h3>Assign Role to User</h3>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="form-group">
        <label for="roleName">Select Role:</label>
        <select
          id="roleName"
          [(ngModel)]="roleName"
          name="roleName"
          required
          [disabled]="loading"
        >
          <option value="">Choose a role...</option>
          <option *ngFor="let role of availableRoles" [value]="role">
            {{ role }}
          </option>
        </select>
      </div>

      <button
        type="submit"
        [disabled]="loading || !roleForm.valid"
      >
        {{ loading ? 'Assigning...' : 'Assign Role' }}
      </button>
    </form>
  `
})
export class AssignRoleComponent {
  @Input() userId!: number;
  @Output() roleAssigned = new EventEmitter<void>();

  roleName = '';
  availableRoles = ['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN'];
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  assignRole() {
    if (!this.roleName) return;

    this.loading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post<ApiResponse>(`/api/v1/users/${this.userId}/roles`, {
      roleName: this.roleName
    }, { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.roleName = '';
            this.roleAssigned.emit();
          } else {
            this.error = response.message || 'Failed to assign role';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Network error occurred';
          this.loading = false;
        }
      });
  }
}
```

## Security Considerations

1. **Super Admin Only**: Only SUPER_ADMIN users can assign roles
2. **Input Validation**: Role names are strictly validated against predefined roles
3. **Audit Trail**: Consider logging all role assignment operations
4. **Duplicate Prevention**: The system should handle duplicate role assignments gracefully

## Available Roles

The following roles can be assigned:

- **CLIENT**: Business or individual hiring freelancers
- **VIDEOGRAPHER**: Video shooting professional
- **VIDEO_EDITOR**: Video editing professional
- **ADMIN**: Platform administrator with management access
- **SUPER_ADMIN**: Full platform access with all permissions

## Business Logic

- Users can have multiple roles assigned
- Duplicate role assignments are handled by the underlying role assignment utility
- Role assignments are immediately effective
- Permissions are recalculated based on assigned roles

## Testing

The endpoint has been tested with the following scenarios:
- ✅ Authentication errors (missing/invalid tokens)
- ✅ Authorization errors (insufficient permissions)
- ✅ Validation errors (missing/invalid role names)
- ✅ Business logic errors (invalid users)
- ✅ Successful role assignment by super admin

## Related Endpoints

- `GET /api/v1/users/:id/roles` - Get user's roles
- `DELETE /api/v1/users/:id/roles/:roleId` - Remove role from user
- `GET /api/v1/users/:id/permissions` - Get user's permissions
- `POST /api/v1/users` - Create user with role assignment</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/admin-api-docs/POST_users_id_roles.md