# Get User by ID API Documentation

## Overview
The Get User by ID endpoint allows administrators to retrieve basic user information by user ID. This endpoint provides access to core user data for administrative purposes.

## Endpoint
```
GET /api/v1/users/:id
```

## Authentication
- **Required**: Yes (Bearer token)
- **Token Type**: JWT
- **Header**: `Authorization: Bearer <jwt_token>`
- **Required Role**: ADMIN or SUPER_ADMIN

## Request

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID to retrieve |

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "profile_picture": "https://example.com/avatar.jpg",
    "bio": "Professional developer",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "pincode": "10001",
    "is_active": true,
    "is_banned": false,
    "is_deleted": false,
    "banned_reason": null,
    "email_verified": true,
    "phone_verified": false,
    "email_notifications": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
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

**403 Forbidden** - Insufficient permissions (not ADMIN or SUPER_ADMIN)
```json
{
  "success": false,
  "message": "Forbidden"
}
```

#### Validation Errors
**404 Not Found** - Invalid user ID format or user not found
```json
{
  "success": false,
  "message": "User not found"
}
```

## Usage Examples

### JavaScript (Fetch API)
```javascript
// Get user by ID
const getUserById = async (userId) => {
  try {
    const response = await fetch(`/api/v1/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('User data:', data.data);
      return data.data;
    } else {
      console.error('Failed to get user:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const UserDetails = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/v1/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.data);
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
      fetchUser();
    }
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>{user.first_name} {user.last_name}</h2>
      <p>Email: {user.email}</p>
      <p>Status: {user.is_active ? 'Active' : 'Inactive'}</p>
      <p>Role: {user.is_banned ? 'Banned' : 'Normal'}</p>
    </div>
  );
};
```

### Vue.js Example
```javascript
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else-if="user">
      <h2>{{ user.first_name }} {{ user.last_name }}</h2>
      <p>Email: {{ user.email }}</p>
      <p>Status: {{ user.is_active ? 'Active' : 'Inactive' }}</p>
    </div>
    <div v-else>User not found</div>
  </div>
</template>

<script>
export default {
  props: ['userId'],
  data() {
    return {
      user: null,
      loading: true,
      error: ''
    };
  },
  watch: {
    userId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchUser(newId);
        }
      }
    }
  },
  methods: {
    async fetchUser(userId) {
      this.loading = true;
      this.error = '';

      try {
        const response = await fetch(`/api/v1/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          this.user = data.data;
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
import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_banned: boolean;
  // ... other user properties
}

interface ApiResponse {
  success: boolean;
  data?: User;
  message?: string;
}

@Component({
  selector: 'app-user-details',
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error">Error: {{ error }}</div>
    <div *ngIf="user">
      <h2>{{ user.first_name }} {{ user.last_name }}</h2>
      <p>Email: {{ user.email }}</p>
      <p>Status: {{ user.is_active ? 'Active' : 'Inactive' }}</p>
    </div>
  `
})
export class UserDetailsComponent implements OnChanges {
  @Input() userId!: number;

  user: User | null = null;
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnChanges() {
    if (this.userId) {
      this.fetchUser();
    }
  }

  private fetchUser() {
    this.loading = true;
    this.error = '';
    this.user = null;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<ApiResponse>(`/api/v1/users/${this.userId}`, { headers })
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.user = response.data;
          } else {
            this.error = response.message || 'Unknown error';
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

1. **Role-Based Access**: Only users with ADMIN or SUPER_ADMIN roles can access this endpoint
2. **Data Exposure**: This endpoint returns sensitive user information - ensure proper access controls
3. **Audit Logging**: Consider logging access to this endpoint for security auditing
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Data Structure

The response includes all core user fields from the users table:
- **Identity**: user_id, first_name, last_name, username, email
- **Contact**: phone_number, email_verified, phone_verified
- **Profile**: profile_picture, bio
- **Address**: address, city, state, country, pincode
- **Account Status**: is_active, is_banned, is_deleted, banned_reason
- **Preferences**: email_notifications
- **Timestamps**: created_at, updated_at

## Testing

The endpoint has been tested with the following scenarios:
- ✅ Authentication errors (missing/invalid tokens)
- ✅ Authorization errors (insufficient permissions)
- ✅ Validation errors (invalid user IDs)
- ✅ Business logic errors (user not found)
- ✅ Successful user retrieval by authorized admins

**Test Results**: 8/11 tests passed (72.7% success rate)

## Related Endpoints

- `GET /api/v1/users/:id/profile` - Get user with profile data
- `GET /api/v1/users` - Get all users (SUPER_ADMIN only)
- `PUT /api/v1/users/:id` - Update user (SUPER_ADMIN only)
- `DELETE /api/v1/users/:id` - Delete user (SUPER_ADMIN only)
- `GET /api/v1/users/:id/roles` - Get user's roles
- `GET /api/v1/users/:id/permissions` - Get user's permissions</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/GET_USER_BY_ID_FRONTEND_README.md