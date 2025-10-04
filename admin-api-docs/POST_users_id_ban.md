# POST /users/:id/ban - Ban User

## Overview
This endpoint allows administrators and super administrators to ban a user account. The ban operation updates the user's `is_banned` status to `true` and optionally records a ban reason.

## Endpoint Details
- **URL**: `/users/:id/ban`
- **Method**: `POST`
- **Authentication**: Required (JWT token)
- **Authorization**: Requires `ADMIN` or `SUPER_ADMIN` role

## Request

### URL Parameters
- `id` (number): The ID of the user to ban

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Body (Optional)
```json
{
  "reason": "string"
}
```

### Body Parameters
- `reason` (string, optional): Reason for banning the user

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User banned successfully",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "is_banned": true,
    "banned_reason": "Violation of terms",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: Insufficient permissions"
}
```

#### 404 Not Found
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
async function banUser(userId, reason = null) {
  const token = localStorage.getItem('authToken');

  const requestBody = reason ? { reason } : {};

  try {
    const response = await fetch(`/api/users/${userId}/ban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('User banned successfully:', data);
      return data;
    } else {
      throw new Error(data.message || 'Failed to ban user');
    }
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
}

// Usage
banUser(123, 'Violation of terms of service')
  .then(result => {
    // Handle success
    console.log('User banned:', result.data);
  })
  .catch(error => {
    // Handle error
    console.error('Ban failed:', error.message);
  });
```

### React Hook

```jsx
import { useState } from 'react';

function useBanUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const banUser = async (userId, reason = null) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    const requestBody = reason ? { reason } : {};

    try {
      const response = await fetch(`/api/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to ban user');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { banUser, loading, error };
}

// Usage in component
function UserManagement({ userId }) {
  const { banUser, loading, error } = useBanUser();
  const [reason, setReason] = useState('');

  const handleBan = async () => {
    try {
      await banUser(userId, reason || null);
      alert('User banned successfully');
      // Refresh user list or redirect
    } catch (err) {
      alert(`Failed to ban user: ${err.message}`);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Ban reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={handleBan} disabled={loading}>
        {loading ? 'Banning...' : 'Ban User'}
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
    <input
      v-model="banReason"
      type="text"
      placeholder="Ban reason (optional)"
    />
    <button @click="banUser" :disabled="loading">
      {{ loading ? 'Banning...' : 'Ban User' }}
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

const banReason = ref('');
const loading = ref(false);
const error = ref(null);

const banUser = async () => {
  loading.value = true;
  error.value = null;

  const token = localStorage.getItem('authToken');
  const requestBody = banReason.value ? { reason: banReason.value } : {};

  try {
    const response = await fetch(`/api/users/${props.userId}/ban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to ban user');
    }

    console.log('User banned successfully:', data);
    // Emit event or update parent component
    // emit('user-banned', data);
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
// ban-user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface BanUserRequest {
  reason?: string;
}

export interface BanUserResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    email: string;
    is_banned: boolean;
    banned_reason?: string;
    updated_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BanUserService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  banUser(userId: number, reason?: string): Observable<BanUserResponse> {
    const requestBody: BanUserRequest = reason ? { reason } : {};

    return this.http.post<BanUserResponse>(
      `${this.apiUrl}/users/${userId}/ban`,
      requestBody
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

    console.error('Ban user error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

// Usage in component
// ban-user.component.ts
import { Component } from '@angular/core';
import { BanUserService } from './ban-user.service';

@Component({
  selector: 'app-ban-user',
  template: `
    <div>
      <input
        [(ngModel)]="banReason"
        type="text"
        placeholder="Ban reason (optional)"
      />
      <button (click)="onBanUser()" [disabled]="loading">
        {{ loading ? 'Banning...' : 'Ban User' }}
      </button>
      <p *ngIf="error" style="color: red;">{{ error }}</p>
    </div>
  `
})
export class BanUserComponent {
  banReason = '';
  loading = false;
  error: string | null = null;

  constructor(private banUserService: BanUserService) {}

  onBanUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.error = null;

    this.banUserService.banUser(this.userId, this.banReason || undefined)
      .subscribe({
        next: (response) => {
          console.log('User banned successfully:', response);
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
- Only users with `ADMIN` or `SUPER_ADMIN` roles can ban users
- The ban reason is optional but recommended for audit purposes
- Banned users cannot access the system until unbanned
- The operation updates the user's `is_banned` field and `banned_reason` (if provided)
- Consider implementing confirmation dialogs in the UI before banning users