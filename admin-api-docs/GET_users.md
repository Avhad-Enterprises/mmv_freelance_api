# GET /users - Get All Users

## Overview
This endpoint allows super administrators to retrieve a paginated list of all users in the system. It supports filtering by search terms and user roles, with comprehensive pagination metadata.

## Endpoint Details
- **URL**: `/users`
- **Method**: `GET`
- **Authentication**: Required (JWT token)
- **Authorization**: Requires `SUPER_ADMIN` role

## Request

### Headers
```
Authorization: Bearer <jwt_token>
```

### Query Parameters
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of users per page (default: 10)
- `search` (string, optional): Search term to filter users by first name, last name, email, or username
- `role` (string, optional): Filter users by role name (e.g., "SUPER_ADMIN", "CLIENT", "VIDEO_EDITOR")

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": 1,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe",
        "phone_number": null,
        "is_active": true,
        "is_banned": false,
        "banned_reason": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "roles": [
          {
            "role_id": 1,
            "name": "CLIENT",
            "label": "Client"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Auth Middleware Exception Occured"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Authentication token missing"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Query Examples

### Basic Pagination
```
GET /api/v1/users?page=1&limit=10
```

### Search Users
```
GET /api/v1/users?search=john
GET /api/v1/users?search=admin@example.com
```

### Filter by Role
```
GET /api/v1/users?role=SUPER_ADMIN
GET /api/v1/users?role=CLIENT
```

### Combined Parameters
```
GET /api/v1/users?page=2&limit=5&search=john&role=CLIENT
```

## Frontend Implementation Examples

### JavaScript (Vanilla)

```javascript
async function getAllUsers(options = {}) {
  const token = localStorage.getItem('authToken');
  const { page = 1, limit = 10, search = '', role = '' } = options;

  // Build query parameters
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (role) params.append('role', role);

  try {
    const response = await fetch(`/api/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Users retrieved successfully:', data);
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to get users');
    }
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

// Usage examples
getAllUsers()
  .then(result => {
    console.log('All users:', result.users);
    console.log('Pagination:', result.pagination);
  })
  .catch(error => {
    console.error('Failed to get users:', error.message);
  });

// Search for users
getAllUsers({ search: 'john', page: 1, limit: 5 })
  .then(result => {
    console.log('Search results:', result.users);
  });

// Filter by role
getAllUsers({ role: 'CLIENT' })
  .then(result => {
    console.log('Client users:', result.users);
  });
```

### React Hook

```jsx
import { useState, useEffect } from 'react';

function useUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (options = {}) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    const { page = 1, limit = 10, search = '', role = '' } = options;

    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (role) params.append('role', role);

    try {
      const response = await fetch(`/api/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get users');
      }

      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { users, pagination, loading, error, fetchUsers };
}

// Usage in component
function UserManagement() {
  const { users, pagination, loading, error, fetchUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers({ page: currentPage, search: searchTerm, role: selectedRole });
  }, [currentPage, searchTerm, selectedRole]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchUsers({ page: 1, search: searchTerm, role: selectedRole });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User Management</h2>

      {/* Search and Filter */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="CLIENT">Client</option>
          <option value="VIDEO_EDITOR">Video Editor</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {/* Users List */}
      <div>
        {users.map(user => (
          <div key={user.user_id} className="user-card">
            <h3>{user.first_name} {user.last_name}</h3>
            <p>{user.email}</p>
            <div className="roles">
              {user.roles.map(role => (
                <span key={role.role_id} className="role-badge">
                  {role.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
            ({pagination.total} total users)
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### Vue.js Composition API

```vue
<template>
  <div>
    <h2>User Management</h2>

    <!-- Search and Filter -->
    <form @submit.prevent="handleSearch">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search users..."
      />
      <select v-model="selectedRole">
        <option value="">All Roles</option>
        <option value="SUPER_ADMIN">Super Admin</option>
        <option value="CLIENT">Client</option>
        <option value="VIDEO_EDITOR">Video Editor</option>
      </select>
      <button type="submit" :disabled="loading">Search</button>
    </form>

    <!-- Loading -->
    <div v-if="loading">Loading users...</div>

    <!-- Error -->
    <div v-if="error" class="error">Error: {{ error }}</div>

    <!-- Users List -->
    <div v-if="!loading && !error">
      <div v-for="user in users" :key="user.user_id" class="user-card">
        <h3>{{ user.first_name }} {{ user.last_name }}</h3>
        <p>{{ user.email }}</p>
        <div class="roles">
          <span
            v-for="role in user.roles"
            :key="role.role_id"
            class="role-badge"
          >
            {{ role.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && !loading" class="pagination">
      <button
        @click="handlePageChange(currentPage - 1)"
        :disabled="!pagination.hasPrev"
      >
        Previous
      </button>
      <span>
        Page {{ pagination.page }} of {{ pagination.totalPages }}
        ({{ pagination.total }} total users)
      </span>
      <button
        @click="handlePageChange(currentPage + 1)"
        :disabled="!pagination.hasNext"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const users = ref([]);
const pagination = ref(null);
const loading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const selectedRole = ref('');
const currentPage = ref(1);

const fetchUsers = async (options = {}) => {
  loading.value = true;
  error.value = null;

  const token = localStorage.getItem('authToken');
  const { page = 1, limit = 10, search = '', role = '' } = options;

  // Build query parameters
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (role) params.append('role', role);

  try {
    const response = await fetch(`/api/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get users');
    }

    users.value = data.data.users;
    pagination.value = data.data.pagination;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page when searching
  fetchUsers({
    page: currentPage.value,
    search: searchTerm.value,
    role: selectedRole.value
  });
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchUsers({
    page: currentPage.value,
    search: searchTerm.value,
    role: selectedRole.value
  });
};

// Load initial data
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
}

.roles {
  margin-top: 0.5rem;
}

.role-badge {
  background: #007bff;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.error {
  color: red;
  padding: 1rem;
  border: 1px solid red;
  border-radius: 4px;
  margin: 1rem 0;
}
</style>
```

### Angular Service

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone_number?: string;
  is_active: boolean;
  is_banned: boolean;
  banned_reason?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface Role {
  role_id: number;
  name: string;
  label: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getAllUsers(options: GetUsersOptions = {}): Observable<UsersResponse> {
    const { page = 1, limit = 10, search, role } = options;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (role) {
      params = params.set('role', role);
    }

    return this.http.get<{ success: boolean; data: UsersResponse }>(
      `${this.apiUrl}/users`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }
}

// Usage in component
// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService, User, UsersResponse, GetUsersOptions } from './user.service';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-management">
      <h2>User Management</h2>

      <!-- Search and Filter -->
      <form (ngSubmit)="onSearch()" class="filters">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          name="search"
          placeholder="Search users..."
        />
        <select [(ngModel)]="selectedRole" name="role">
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="CLIENT">Client</option>
          <option value="VIDEO_EDITOR">Video Editor</option>
        </select>
        <button type="submit" [disabled]="loading">Search</button>
      </form>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">Loading users...</div>

      <!-- Error -->
      <div *ngIf="error" class="error">{{ error }}</div>

      <!-- Users List -->
      <div *ngIf="!loading && !error" class="users-list">
        <div *ngFor="let user of users" class="user-card">
          <h3>{{ user.first_name }} {{ user.last_name }}</h3>
          <p>{{ user.email }}</p>
          <div class="roles">
            <span *ngFor="let role of user.roles" class="role-badge">
              {{ role.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="pagination && !loading" class="pagination">
        <button
          (click)="onPageChange(currentPage - 1)"
          [disabled]="!pagination.hasPrev"
        >
          Previous
        </button>
        <span>
          Page {{ pagination.page }} of {{ pagination.totalPages }}
          ({{ pagination.total }} total users)
        </span>
        <button
          (click)="onPageChange(currentPage + 1)"
          [disabled]="!pagination.hasNext"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .user-card {
      border: 1px solid #ddd;
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 4px;
    }

    .roles {
      margin-top: 0.5rem;
    }

    .role-badge {
      background: #007bff;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      margin-right: 0.5rem;
    }

    .pagination {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    .error {
      color: red;
      padding: 1rem;
      border: 1px solid red;
      border-radius: 4px;
      margin: 1rem 0;
    }

    .filters {
      margin-bottom: 1rem;
    }

    .filters > * {
      margin-right: 0.5rem;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  pagination: UsersResponse['pagination'] | null = null;
  loading = false;
  error: string | null = null;
  searchTerm = '';
  selectedRole = '';
  currentPage = 1;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(options: GetUsersOptions = {}) {
    this.loading = true;
    this.error = null;

    this.userService.getAllUsers({
      ...options,
      page: this.currentPage
    }).subscribe({
      next: (response) => {
        this.users = response.users;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load users';
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 1; // Reset to first page when searching
    this.loadUsers({
      search: this.searchTerm,
      role: this.selectedRole
    });
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.loadUsers({
      search: this.searchTerm,
      role: this.selectedRole
    });
  }
}
```

## Notes
- Only users with `SUPER_ADMIN` role can access this endpoint
- Passwords are automatically excluded from the response for security
- Search is case-insensitive and searches across first name, last name, email, and username
- Role filtering requires exact role name matching
- Pagination defaults to page 1 with 10 users per page if not specified
- Invalid page numbers default to page 1
- The response includes comprehensive pagination metadata for frontend pagination controls