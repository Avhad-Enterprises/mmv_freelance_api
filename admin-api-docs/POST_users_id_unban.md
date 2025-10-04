# POST /users/:id/unban - Unban User

## Overview
This endpoint allows administrators and super administrators to unban a user account. The unban operation sets the user's `is_banned` status to `false` and clears the `banned_reason`.

## Endpoint Details
- **URL**: `/users/:id/unban`
- **Method**: `POST`
- **Authentication**: Required (JWT token)
- **Authorization**: Requires `ADMIN` or `SUPER_ADMIN` role

## Request

### URL Parameters
- `id` (number): The ID of the user to unban

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Body
This endpoint does not require a request body.

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User unbanned successfully"
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

## Frontend Implementation Examples

### JavaScript (Vanilla)

```javascript
async function unbanUser(userId) {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`/api/users/${userId}/unban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('User unbanned successfully:', data);
      return data;
    } else {
      throw new Error(data.message || 'Failed to unban user');
    }
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
}

// Usage
unbanUser(123)
  .then(result => {
    // Handle success
    console.log('User unbanned:', result);
  })
  .catch(error => {
    // Handle error
    console.error('Unban failed:', error.message);
  });
```

### React Hook

```jsx
import { useState } from 'react';

function useUnbanUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unbanUser = async (userId) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`/api/users/${userId}/unban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to unban user');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { unbanUser, loading, error };
}

// Usage in component
function UserManagement({ userId }) {
  const { unbanUser, loading, error } = useUnbanUser();

  const handleUnban = async () => {
    try {
      await unbanUser(userId);
      alert('User unbanned successfully');
      // Refresh user list or redirect
    } catch (err) {
      alert(`Failed to unban user: ${err.message}`);
    }
  };

  return (
    <div>
      <button onClick={handleUnban} disabled={loading}>
        {loading ? 'Unbanning...' : 'Unban User'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
```

### Vue.js Composition API

```vue
<template>
  <div>
    <button @click="unbanUser" :disabled="loading">
      {{ loading ? 'Unbanning...' : 'Unban User' }}
    </button>
    <p v-if="error" style="color: red;">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
});

const loading = ref(false);
const error = ref(null);

const unbanUser = async () => {
  loading.value = true;
  error.value = null;

  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`/api/users/${props.userId}/unban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to unban user');
    }

    console.log('User unbanned successfully:', data);
    // Emit event or update parent component
    // emit('user-unbanned', data);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>
```

### Angular Service

```typescript
// unban-user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface UnbanUserResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnbanUserService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  unbanUser(userId: number): Observable<UnbanUserResponse> {
    return this.http.post<UnbanUserResponse>(
      `${this.apiUrl}/users/${userId}/unban`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }

    console.error('Unban user error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

// Usage in component
// unban-user.component.ts
import { Component } from '@angular/core';
import { UnbanUserService } from './unban-user.service';

@Component({
  selector: 'app-unban-user',
  template: `
    <div>
      <button (click)="onUnbanUser()" [disabled]="loading">
        {{ loading ? 'Unbanning...' : 'Unban User' }}
      </button>
      <p *ngIf="error" style="color: red;">{{ error }}</p>
    </div>
  `
})
export class UnbanUserComponent {
  loading = false;
  error: string | null = null;

  constructor(private unbanUserService: UnbanUserService) {}

  onUnbanUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.error = null;

    this.unbanUserService.unbanUser(this.userId)
      .subscribe({
        next: (response) => {
          console.log('User unbanned successfully:', response);
          this.loading = false;
          // Handle success (e.g., show success message, refresh list)
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        }
      });
  }

  // Assume userId is passed as input or from route params
  userId = 123; // Replace with actual user ID
}
```

## Notes
- Only users with `ADMIN` or `SUPER_ADMIN` roles can unban users
- The operation sets `is_banned` to `false` and clears `banned_reason`
- Unbanning an already unbanned user is allowed (no error is thrown)
- Consider implementing confirmation dialogs in the UI before unbanning users
- After unbanning, the user can access the system normally again