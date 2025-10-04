# Remove Role from User API Documentation

## Overview
The Remove Role from User endpoint allows super administrators to remove specific roles from users. This endpoint removes the role assignment between a user and a role.

## Endpoint
```
DELETE /api/v1/users/:id/roles/:roleId
```

## Authentication
- **Required**: Yes (Bearer token)
- **Token Type**: JWT
- **Header**: `Authorization: Bearer <jwt_token>`
- **Required Role**: SUPER_ADMIN

## Request

### Headers
```
Authorization: Bearer <jwt_token>
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID to remove role from |
| `roleId` | integer | Yes | Role ID to remove |

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Role removed from user successfully"
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

#### Server Errors (500 Internal Server Error)
**Invalid User ID Format** - Non-numeric user ID
```
HTTP 500 Internal Server Error
```

**Invalid Role ID Format** - Non-numeric role ID
```
HTTP 500 Internal Server Error
```

**User Not Found** - User doesn't exist
```
HTTP 500 Internal Server Error
```

**Role Not Assigned** - Role is not assigned to the user
```
HTTP 500 Internal Server Error
```

## Usage Examples

### JavaScript (Fetch API)
```javascript
// Remove role from user
const removeRoleFromUser = async (userId, roleId) => {
  try {
    const response = await fetch(`/api/v1/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('Role removed successfully:', data.message);
      return true;
    } else {
      console.error('Failed to remove role:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### React Hook Example
```javascript
import { useState } from 'react';

const RemoveRoleButton = ({ userId, roleId, roleName, onRoleRemoved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRemoveRole = async () => {
    if (!confirm(`Are you sure you want to remove the ${roleName} role from this user?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        onRoleRemoved && onRoleRemoved();
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
    <div className="remove-role">
      <button
        onClick={handleRemoveRole}
        disabled={loading}
        className="remove-btn"
      >
        {loading ? 'Removing...' : 'Remove Role'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

### Vue.js Example
```javascript
<template>
  <div class="remove-role">
    <button
      @click="removeRole"
      :disabled="loading"
      class="remove-btn"
    >
      {{ loading ? 'Removing...' : 'Remove Role' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
export default {
  props: ['userId', 'roleId', 'roleName'],
  emits: ['role-removed'],
  data() {
    return {
      loading: false,
      error: ''
    };
  },
  methods: {
    async removeRole() {
      if (!confirm(`Are you sure you want to remove the ${this.roleName} role from this user?`)) {
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const response = await fetch(`/api/v1/users/${this.userId}/roles/${this.roleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          this.$emit('role-removed');
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
  selector: 'app-remove-role',
  template: `
    <div class="remove-role">
      <button
        (click)="removeRole()"
        [disabled]="loading"
        class="remove-btn"
      >
        {{ loading ? 'Removing...' : 'Remove Role' }}
      </button>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `
})
export class RemoveRoleComponent {
  @Input() userId!: number;
  @Input() roleId!: number;
  @Input() roleName!: string;
  @Output() roleRemoved = new EventEmitter<void>();

  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  removeRole() {
    if (!confirm(`Are you sure you want to remove the ${this.roleName} role from this user?`)) {
      return;
    }

    this.loading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete<ApiResponse>(`/api/v1/users/${this.userId}/roles/${this.roleId}`, { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.roleRemoved.emit();
          } else {
            this.error = response.message || 'Failed to remove role';
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

1. **Super Admin Only**: Only SUPER_ADMIN users can remove roles
2. **Confirmation Required**: Consider implementing client-side confirmation for role removal
3. **Audit Trail**: Log all role removal operations for security auditing
4. **Permission Recalculation**: User permissions are automatically updated after role removal

## Business Logic

- Removes the specific role assignment from the user_roles table
- Does not affect other roles assigned to the user
- Permissions are recalculated based on remaining roles
- If the role is not assigned to the user, the operation still succeeds (idempotent)

## Error Handling

The endpoint handles various error scenarios:
- Invalid user or role IDs (parseInt errors)
- Non-existent users or roles
- Database connection issues
- Authorization failures

## Testing

The endpoint has been tested with the following scenarios:
- ✅ Authentication errors (missing/invalid tokens)
- ✅ Authorization errors (insufficient permissions)
- ✅ Validation errors (invalid user/role IDs)
- ✅ Business logic errors (user/role not found)
- ✅ Successful role removal by super admin

## Related Endpoints

- `GET /api/v1/users/:id/roles` - Get user's roles
- `POST /api/v1/users/:id/roles` - Assign role to user
- `GET /api/v1/users/:id/permissions` - Get user's permissions</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/admin-api-docs/DELETE_users_id_roles_roleId.md