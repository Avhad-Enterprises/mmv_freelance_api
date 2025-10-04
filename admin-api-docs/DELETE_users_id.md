# DELETE /users/:id - Delete User by ID

## Overview
This endpoint allows super administrators to permanently delete a user from the system. This is a destructive operation that cannot be undone. The endpoint removes the user and all associated data through database cascade deletion.

## Endpoint Details
- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Authentication**: Required (JWT token)
- **Authorization**: Requires `SUPER_ADMIN` role

## Request

### Headers
```
Authorization: Bearer <jwt_token>
```

### URL Parameters
- `id` (number): The user ID to delete

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User deleted successfully"
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

#### 404 Not Found (User not found)
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Request Examples

### Delete User by ID
```
DELETE /api/v1/users/123
```

## Frontend Implementation Examples

### JavaScript (Vanilla)

```javascript
async function deleteUser(userId) {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('User deleted successfully:', data);
      return true;
    } else {
      throw new Error(data.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Usage examples
deleteUser(123)
  .then(() => {
    console.log('User deleted successfully');
    // Remove user from UI, redirect, etc.
  })
  .catch(error => {
    console.error('Failed to delete user:', error.message);
    // Show error message to user
  });
```

### React Hook

```jsx
import { useState } from 'react';

function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteUser = async (userId) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { deleteUser, loading, error };
}

// User list component with delete functionality
function UserList({ users, onUserDeleted }) {
  const { deleteUser, loading, error } = useDeleteUser();

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      console.log('User deleted successfully');
      onUserDeleted(userId); // Callback to update the UI
    } catch (err) {
      console.error('Failed to delete user:', err.message);
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="user-list">
      <h2>User Management</h2>

      {users.map(user => (
        <div key={user.user_id} className="user-item">
          <div className="user-info">
            <h3>{user.first_name} {user.last_name}</h3>
            <p>{user.email}</p>
          </div>

          <div className="user-actions">
            <button
              onClick={() => handleDeleteUser(user.user_id, `${user.first_name} ${user.last_name}`)}
              disabled={loading}
              className="delete-btn"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Usage in parent component
function AdminDashboard() {
  const [users, setUsers] = useState([]);

  const handleUserDeleted = (deletedUserId) => {
    setUsers(users.filter(user => user.user_id !== deletedUserId));
  };

  return (
    <UserList users={users} onUserDeleted={handleUserDeleted} />
  );
}
```

### Vue.js Composition API

```vue
<template>
  <div class="user-list">
    <h2>User Management</h2>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-for="user in users" :key="user.user_id" class="user-item">
      <div class="user-info">
        <h3>{{ user.first_name }} {{ user.last_name }}</h3>
        <p>{{ user.email }}</p>
      </div>

      <div class="user-actions">
        <button
          @click="deleteUser(user.user_id, `${user.first_name} ${user.last_name}`)"
          :disabled="loading"
          class="delete-btn"
        >
          {{ loading ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  users: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['userDeleted']);

const loading = ref(false);
const error = ref(null);

const deleteUser = async (userId, userName) => {
  if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
    return;
  }

  loading.value = true;
  error.value = null;

  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }

    console.log('User deleted successfully');
    emit('userDeleted', userId);
  } catch (err) {
    error.value = err.message;
    console.error('Failed to delete user:', err.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.user-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #fff;
}

.user-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.user-info p {
  margin: 0;
  color: #666;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}

.delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .user-actions {
    align-self: stretch;
  }

  .delete-btn {
    width: 100%;
  }
}
</style>
```

### Angular Service

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  deleteUser(userId: number): Observable<boolean> {
    return this.http.delete<DeleteUserResponse>(
      `${this.apiUrl}/users/${userId}`
    ).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}

// user-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from './user.service';

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  // ... other user properties
}

@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-list">
      <h2>User Management</h2>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngFor="let user of users" class="user-item">
        <div class="user-info">
          <h3>{{ user.first_name }} {{ user.last_name }}</h3>
          <p>{{ user.email }}</p>
        </div>

        <div class="user-actions">
          <button
            (click)="onDeleteUser(user)"
            [disabled]="loading"
            class="delete-btn"
          >
            {{ loading ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-list {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 1rem;
      background: #fff;
    }

    .user-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .user-info p {
      margin: 0;
      color: #666;
    }

    .user-actions {
      display: flex;
      gap: 0.5rem;
    }

    .delete-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .delete-btn:hover:not(:disabled) {
      background: #c82333;
    }

    .delete-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .user-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .user-actions {
        align-self: stretch;
      }

      .delete-btn {
        width: 100%;
      }
    }
  `]
})
export class UserListComponent {
  @Input() users: User[] = [];
  @Output() userDeleted = new EventEmitter<number>();

  loading = false;
  errorMessage = '';

  constructor(private userService: UserService) {}

  onDeleteUser(user: User) {
    const userName = `${user.first_name} ${user.last_name}`;

    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.userService.deleteUser(user.user_id).subscribe({
      next: (success) => {
        if (success) {
          console.log('User deleted successfully');
          this.userDeleted.emit(user.user_id);
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
        console.error('Failed to delete user:', error.message);
      }
    });
  }
}

// Usage in parent component
// admin-dashboard.component.ts
import { Component } from '@angular/core';
import { User } from './user-list.component';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <app-user-list
      [users]="users"
      (userDeleted)="onUserDeleted($event)">
    </app-user-list>
  `
})
export class AdminDashboardComponent {
  users: User[] = [
    // ... user data
  ];

  onUserDeleted(deletedUserId: number) {
    this.users = this.users.filter(user => user.user_id !== deletedUserId);
  }
}
```

## Notes
- Only users with `SUPER_ADMIN` role can delete users
- **This operation is permanent and cannot be undone**
- Database cascade deletion will remove all related records (profiles, roles, etc.)
- Always show confirmation dialogs before allowing user deletion
- Consider implementing soft delete for better data safety in production
- The API returns a simple success message without user data
- Invalid user IDs currently cause server errors (500) instead of proper validation errors
- Consider implementing additional safety checks (e.g., prevent deleting the last super admin)