# Role Management API Documentation

## Overview
The Role Management endpoints provide administrators with the ability to manage user roles and permissions in the MMV Freelance Platform. These endpoints allow super administrators to assign and remove roles from users, as well as view user roles and permissions.

## Endpoints

### 1. Get User Roles
```
GET /api/v1/users/:id/roles
```

**Authorization**: ADMIN or SUPER_ADMIN role required
**Description**: Retrieves all roles assigned to a specific user

#### Request
- **URL Parameters**:
  - `id` (integer): User ID

- **Headers**:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```

#### Response (200 OK)
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

#### Error Responses
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions (not ADMIN/SUPER_ADMIN)
- **404 Not Found**: Missing Authorization header (auth middleware behavior)
- **500 Internal Server Error**: Invalid user ID or user not found

---

### 2. Assign Role to User
```
POST /api/v1/users/:id/roles
```

**Authorization**: SUPER_ADMIN role required
**Description**: Assigns a role to a user

#### Request
- **URL Parameters**:
  - `id` (integer): User ID

- **Headers**:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```

- **Body**:
  ```json
  {
    "roleName": "CLIENT"
  }
  ```

#### Request Body Validation
- `roleName`: Required, must be one of: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Role \"CLIENT\" assigned to user successfully"
}
```

#### Error Responses
- **400 Bad Request**: Missing or invalid role name
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions (not SUPER_ADMIN)
- **404 Not Found**: Missing Authorization header
- **500 Internal Server Error**: Invalid user ID or user not found

---

### 3. Remove Role from User
```
DELETE /api/v1/users/:id/roles/:roleId
```

**Authorization**: SUPER_ADMIN role required
**Description**: Removes a specific role from a user

#### Request
- **URL Parameters**:
  - `id` (integer): User ID
  - `roleId` (integer): Role ID to remove

- **Headers**:
  ```
  Authorization: Bearer <jwt_token>
  ```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Role removed from user successfully"
}
```

#### Error Responses
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions (not SUPER_ADMIN)
- **404 Not Found**: Missing Authorization header
- **500 Internal Server Error**: Invalid user ID, invalid role ID, or user not found

---

### 4. Get User Permissions
```
GET /api/v1/users/:id/permissions
```

**Authorization**: ADMIN or SUPER_ADMIN role required
**Description**: Retrieves all permissions for a specific user based on their roles

#### Request
- **URL Parameters**:
  - `id` (integer): User ID

- **Headers**:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "roles.view",
    "roles.assign",
    "permissions.view"
  ]
}
```

#### Error Responses
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions (not ADMIN/SUPER_ADMIN)
- **404 Not Found**: Missing Authorization header
- **500 Internal Server Error**: Invalid user ID or user not found

## Frontend Integration Examples

### JavaScript Examples

#### Get User Roles
```javascript
async function getUserRoles(userId) {
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
      return data.data;
    } else {
      console.error('Failed to get user roles:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Assign Role to User
```javascript
async function assignRoleToUser(userId, roleName) {
  try {
    const response = await fetch(`/api/v1/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
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
}
```

#### Remove Role from User
```javascript
async function removeRoleFromUser(userId, roleId) {
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
}
```

#### Get User Permissions
```javascript
async function getUserPermissions(userId) {
  try {
    const response = await fetch(`/api/v1/users/${userId}/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('User permissions:', data.data);
      return data.data;
    } else {
      console.error('Failed to get user permissions:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### React Examples

#### User Roles Management Component
```javascript
import { useState, useEffect } from 'react';

const UserRolesManager = ({ userId }) => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [availableRoles] = useState(['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserRoles();
    loadUserPermissions();
  }, [userId]);

  const loadUserRoles = async () => {
    try {
      const response = await fetch(`/api/v1/users/${userId}/roles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      } else {
        setError('Failed to load roles');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const loadUserPermissions = async () => {
    try {
      const response = await fetch(`/api/v1/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setPermissions(data.data);
      }
    } catch (err) {
      console.error('Failed to load permissions');
    }
  };

  const assignRole = async (roleName) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleName })
      });

      const data = await response.json();
      if (data.success) {
        await loadUserRoles();
        await loadUserPermissions();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const removeRole = async (roleId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        await loadUserRoles();
        await loadUserPermissions();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-roles-manager">
      <h3>User Roles & Permissions</h3>

      {error && <div className="error">{error}</div>}

      <div className="roles-section">
        <h4>Current Roles</h4>
        {roles.length === 0 ? (
          <p>No roles assigned</p>
        ) : (
          <ul>
            {roles.map(role => (
              <li key={role.role_id}>
                {role.label} ({role.name})
                <button
                  onClick={() => removeRole(role.role_id)}
                  disabled={loading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <h4>Assign New Role</h4>
        {availableRoles.map(roleName => (
          <button
            key={roleName}
            onClick={() => assignRole(roleName)}
            disabled={loading || roles.some(r => r.name === roleName)}
          >
            Assign {roleName}
          </button>
        ))}
      </div>

      <div className="permissions-section">
        <h4>Permissions</h4>
        {permissions.length === 0 ? (
          <p>No permissions</p>
        ) : (
          <ul>
            {permissions.map(permission => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
```

### Vue.js Examples

#### User Roles Component
```javascript
<template>
  <div class="user-roles">
    <h3>User Roles Management</h3>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="roles-section">
      <h4>Current Roles</h4>
      <div v-if="roles.length === 0">No roles assigned</div>
      <ul v-else>
        <li v-for="role in roles" :key="role.role_id">
          {{ role.label }} ({{ role.name }})
          <button @click="removeRole(role.role_id)" :disabled="loading">
            Remove
          </button>
        </li>
      </ul>

      <h4>Assign Role</h4>
      <button
        v-for="roleName in availableRoles"
        :key="roleName"
        @click="assignRole(roleName)"
        :disabled="loading || hasRole(roleName)"
      >
        Assign {{ roleName }}
      </button>
    </div>

    <div class="permissions-section">
      <h4>Permissions</h4>
      <ul v-if="permissions.length > 0">
        <li v-for="permission in permissions" :key="permission">
          {{ permission }}
        </li>
      </ul>
      <div v-else>No permissions</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['userId'],
  data() {
    return {
      roles: [],
      permissions: [],
      availableRoles: ['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN'],
      loading: false,
      error: ''
    };
  },
  mounted() {
    this.loadUserRoles();
    this.loadUserPermissions();
  },
  methods: {
    async loadUserRoles() {
      try {
        const response = await fetch(`/api/v1/users/${this.userId}/roles`, {
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          this.roles = data.data;
        } else {
          this.error = 'Failed to load roles';
        }
      } catch (err) {
        this.error = 'Network error';
      }
    },

    async loadUserPermissions() {
      try {
        const response = await fetch(`/api/v1/users/${this.userId}/permissions`, {
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          this.permissions = data.data;
        }
      } catch (err) {
        console.error('Failed to load permissions');
      }
    },

    async assignRole(roleName) {
      this.loading = true;
      this.error = '';

      try {
        const response = await fetch(`/api/v1/users/${this.userId}/roles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleName })
        });

        const data = await response.json();
        if (data.success) {
          await this.loadUserRoles();
          await this.loadUserPermissions();
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = 'Network error';
      } finally {
        this.loading = false;
      }
    },

    async removeRole(roleId) {
      this.loading = true;
      this.error = '';

      try {
        const response = await fetch(`/api/v1/users/${this.userId}/roles/${roleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          await this.loadUserRoles();
          await this.loadUserPermissions();
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = 'Network error';
      } finally {
        this.loading = false;
      }
    },

    hasRole(roleName) {
      return this.roles.some(role => role.name === roleName);
    }
  }
};
</script>
```

### Angular Examples

#### User Roles Service
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
  role_id: number;
  name: string;
  label: string;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserRolesService {
  private apiUrl = '/api/v1/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUserRoles(userId: number): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/${userId}/roles`, {
      headers: this.getHeaders()
    });
  }

  assignRole(userId: number, roleName: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${userId}/roles`, {
      roleName
    }, {
      headers: this.getHeaders()
    });
  }

  removeRole(userId: number, roleId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${userId}/roles/${roleId}`, {
      headers: this.getHeaders()
    });
  }

  getUserPermissions(userId: number): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/${userId}/permissions`, {
      headers: this.getHeaders()
    });
  }
}
```

#### User Roles Component
```typescript
import { Component, Input, OnInit } from '@angular/core';
import { UserRolesService, Role, ApiResponse } from './user-roles.service';

@Component({
  selector: 'app-user-roles',
  template: `
    <div class="user-roles">
      <h3>User Roles Management</h3>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="roles-section">
        <h4>Current Roles</h4>
        <div *ngIf="roles.length === 0">No roles assigned</div>
        <ul *ngIf="roles.length > 0">
          <li *ngFor="let role of roles">
            {{ role.label }} ({{ role.name }})
            <button (click)="removeRole(role.role_id)" [disabled]="loading">
              Remove
            </button>
          </li>
        </ul>

        <h4>Assign Role</h4>
        <button
          *ngFor="let roleName of availableRoles"
          (click)="assignRole(roleName)"
          [disabled]="loading || hasRole(roleName)"
        >
          Assign {{ roleName }}
        </button>
      </div>

      <div class="permissions-section">
        <h4>Permissions</h4>
        <ul *ngIf="permissions.length > 0">
          <li *ngFor="let permission of permissions">
            {{ permission }}
          </li>
        </ul>
        <div *ngIf="permissions.length === 0">No permissions</div>
      </div>
    </div>
  `
})
export class UserRolesComponent implements OnInit {
  @Input() userId!: number;

  roles: Role[] = [];
  permissions: string[] = [];
  availableRoles = ['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN'];
  loading = false;
  error = '';

  constructor(private userRolesService: UserRolesService) {}

  ngOnInit() {
    this.loadUserRoles();
    this.loadUserPermissions();
  }

  loadUserRoles() {
    this.userRolesService.getUserRoles(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roles = response.data;
        } else {
          this.error = 'Failed to load roles';
        }
      },
      error: (err) => {
        this.error = 'Network error';
      }
    });
  }

  loadUserPermissions() {
    this.userRolesService.getUserPermissions(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.permissions = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load permissions');
      }
    });
  }

  assignRole(roleName: string) {
    this.loading = true;
    this.error = '';

    this.userRolesService.assignRole(this.userId, roleName).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUserRoles();
          this.loadUserPermissions();
        } else {
          this.error = response.message || 'Failed to assign role';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Network error';
        this.loading = false;
      }
    });
  }

  removeRole(roleId: number) {
    this.loading = true;
    this.error = '';

    this.userRolesService.removeRole(this.userId, roleId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUserRoles();
          this.loadUserPermissions();
        } else {
          this.error = response.message || 'Failed to remove role';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Network error';
        this.loading = false;
      }
    });
  }

  hasRole(roleName: string): boolean {
    return this.roles.some(role => role.name === roleName);
  }
}
```

## Security Considerations

1. **Role-Based Access Control**: All endpoints require specific admin roles
2. **Super Admin Privileges**: Role assignment/removal requires SUPER_ADMIN role
3. **Audit Trail**: Consider logging all role management operations
4. **Permission Validation**: Permissions are dynamically calculated based on user roles
5. **Input Validation**: Role names are validated against predefined roles

## Available Roles

The system supports the following predefined roles:

- **CLIENT**: Business or individual hiring freelancers
- **VIDEOGRAPHER**: Video shooting professional
- **VIDEO_EDITOR**: Video editing professional
- **ADMIN**: Platform administrator with management access
- **SUPER_ADMIN**: Full platform access with all permissions

## Testing

The role management endpoints have been designed with comprehensive error handling and validation. Key test scenarios include:

- Authentication and authorization checks
- Input validation for role names and IDs
- Business logic validation for role operations
- Error handling for invalid users and roles
- Permission calculation based on role assignments

## Related Endpoints

- `GET /api/v1/users` - Get all users (SUPER_ADMIN only)
- `POST /api/v1/users` - Create new user with role assignment
- `GET /api/v1/users/:id` - Get basic user information
- `GET /api/v1/users/:id/profile` - Get user with profile data</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/admin-api-docs/GET_users_id_roles.md