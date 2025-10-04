# Get User Roles API Documentation

## Overview
The Get User Roles endpoint allows administrators and super administrators to retrieve all roles assigned to a specific user. This endpoint returns detailed information about each role including the role ID, name, label, and description.

## Endpoint
```
GET /api/v1/users/:id/roles
```

## Authentication
- **Required**: Yes (Bearer token)
- **Token Type**: JWT
- **Header**: `Authorization: Bearer <jwt_token>`
- **Required Role**: ADMIN or SUPER_ADMIN

## Request

### Headers
```
Authorization: Bearer <jwt_token>
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID to retrieve roles for |

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "role_id": 1,
      "name": "CLIENT",
      "label": "Client",
      "description": "Business or individual hiring freelancers"
    },
    {
      "role_id": 2,
      "name": "VIDEOGRAPHER",
      "label": "Videographer",
      "description": "Video shooting professional"
    }
  ]
}
```

### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Operation success status |
| `data` | array | Array of user roles |
| `data[].role_id` | integer | Unique role identifier |
| `data[].name` | string | Role name (enum value) |
| `data[].label` | string | Human-readable role label |
| `data[].description` | string | Role description |

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

**403 Forbidden** - Insufficient permissions (not ADMIN or SUPER_ADMIN)
```json
{
  "success": false,
  "message": "Forbidden"
}
```

#### Validation Errors
**400 Bad Request** - Invalid user ID format
```json
{
  "success": false,
  "message": "Invalid user ID"
}
```

#### Server Errors (500 Internal Server Error)
**User Not Found** - User doesn't exist
```
HTTP 500 Internal Server Error
```

**Database Error** - Database connection or query failure
```
HTTP 500 Internal Server Error
```

## Usage Examples

### JavaScript (Fetch API)
```javascript
// Get user roles
const getUserRoles = async (userId) => {
  try {
    const response = await fetch(`/api/v1/users/${userId}/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('User roles:', data.data);
      // Handle roles array
      data.data.forEach(role => {
        console.log(`Role: ${role.label} (${role.name})`);
      });
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage
getUserRoles(123);
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useUserRoles = (userId) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/v1/users/${userId}/roles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setRoles(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserRoles();
    }
  }, [userId]);

  return { roles, loading, error };
};

// Usage in component
const UserRolesDisplay = ({ userId }) => {
  const { roles, loading, error } = useUserRoles(userId);

  if (loading) return <div>Loading roles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>User Roles</h3>
      <ul>
        {roles.map(role => (
          <li key={role.role_id}>
            {role.label} - {role.description}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### Vue.js Composition API Example
```javascript
import { ref, onMounted } from 'vue';

export function useUserRoles(userId) {
  const roles = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchUserRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/users/${userId}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        roles.value = data.data;
      } else {
        error.value = data.message;
      }
    } catch (err) {
      error.value = 'Network error occurred';
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (userId) {
      fetchUserRoles();
    }
  });

  return {
    roles,
    loading,
    error,
    refetch: fetchUserRoles
  };
}

// Usage in component
<template>
  <div>
    <div v-if="loading">Loading roles...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <h3>User Roles</h3>
      <ul>
        <li v-for="role in roles" :key="role.role_id">
          {{ role.label }} - {{ role.description }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useUserRoles } from '@/composables/useUserRoles';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
});

const { roles, loading, error } = useUserRoles(props.userId);
</script>
```

### Angular Service Example
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface UserRole {
  role_id: number;
  name: string;
  label: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getUserRoles(userId: number): Observable<{ success: boolean; data: UserRole[] }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<{ success: boolean; data: UserRole[] }>(
      `${this.apiUrl}/users/${userId}/roles`,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error fetching user roles:', error);
        return throwError(() => error);
      })
    );
  }
}

// Usage in component
import { Component, OnInit } from '@angular/core';
import { UserService, UserRole } from './user.service';

@Component({
  selector: 'app-user-roles',
  template: `
    <div *ngIf="loading">Loading roles...</div>
    <div *ngIf="error">Error: {{ error }}</div>
    <div *ngIf="!loading && !error">
      <h3>User Roles</h3>
      <ul>
        <li *ngFor="let role of roles">
          {{ role.label }} - {{ role.description }}
        </li>
      </ul>
    </div>
  `
})
export class UserRolesComponent implements OnInit {
  roles: UserRole[] = [];
  loading = true;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUserRoles(123); // Replace with actual user ID
  }

  loadUserRoles(userId: number) {
    this.userService.getUserRoles(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.data;
        } else {
          this.error = 'Failed to load roles';
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

## Business Logic

- Retrieves all roles assigned to the specified user from the user_roles table
- Joins with the roles table to get complete role information
- Returns an array of role objects with ID, name, label, and description
- If user has no roles assigned, returns an empty array
- Requires ADMIN or SUPER_ADMIN role for access

## Security Considerations

1. **Role-Based Access**: Only ADMIN and SUPER_ADMIN roles can access this endpoint
2. **User Validation**: Validates that the user ID is numeric and exists
3. **Audit Trail**: Consider logging access to user role information for security auditing
4. **Data Exposure**: Only returns role information, not sensitive user data

## Error Handling

The endpoint handles various error scenarios:
- Invalid user ID format (parseInt errors)
- Non-existent users (empty results)
- Database connection issues
- Authorization failures

## Testing

The endpoint has been tested with the following scenarios:
- ✅ Authentication errors (missing/invalid tokens)
- ✅ Authorization errors (insufficient permissions)
- ✅ Validation errors (invalid user IDs)
- ✅ Business logic (user with/without roles)
- ✅ Successful role retrieval by admin/super admin

## Related Endpoints

- `POST /api/v1/users/:id/roles` - Assign role to user
- `DELETE /api/v1/users/:id/roles/:roleId` - Remove role from user
- `GET /api/v1/users/:id/permissions` - Get user's permissions
- `GET /api/v1/users/:id` - Get user details</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/admin-api-docs/GET_users_id_roles.md