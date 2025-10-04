# Change Password API Documentation

## Overview
The Change Password endpoint allows authenticated users to update their password by providing their current password and a new password.

## Endpoint
```
POST /api/v1/users/change-password
```

## Authentication
- **Required**: Yes (Bearer token)
- **Token Type**: JWT
- **Header**: `Authorization: Bearer <jwt_token>`

## Request

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Body Parameters
```json
{
  "old_password": "string",  // Required: Current password (min 6 characters)
  "new_password": "string"  // Required: New password (min 6 characters)
}
```

### Parameter Details
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `old_password` | string | Yes | Min 6 characters | User's current password |
| `new_password` | string | Yes | Min 6 characters | User's new password |

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error Responses

#### Authentication Errors
**401 Unauthorized** - Invalid or missing token
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

#### Validation Errors (400 Bad Request)
**Missing old_password**
```json
{
  "success": false,
  "message": "old_password should not be empty"
}
```

**Missing new_password**
```json
{
  "success": false,
  "message": "new_password should not be empty"
}
```

**Password too short**
```json
{
  "success": false,
  "message": "new_password must be longer than or equal to 6 characters"
}
```

#### Business Logic Errors (400 Bad Request)
**Incorrect current password**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

## Usage Examples

### JavaScript (Fetch API)
```javascript
// Change password
const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await fetch('/api/v1/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Password changed successfully');
      // Optionally redirect to login or show success message
    } else {
      console.error('Password change failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### React Hook Example
```javascript
import { useState } from 'react';

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: formData.old_password,
          new_password: formData.new_password
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        // Optionally log out user and redirect to login
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Current Password:</label>
        <input
          type="password"
          name="old_password"
          value={formData.old_password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>New Password:</label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          required
          minLength="6"
        />
      </div>

      <div>
        <label>Confirm New Password:</label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          required
          minLength="6"
        />
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Password changed successfully! Redirecting to login...</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Changing Password...' : 'Change Password'}
      </button>
    </form>
  );
};
```

### Vue.js Example
```javascript
<template>
  <form @submit.prevent="changePassword">
    <div>
      <label>Current Password:</label>
      <input
        v-model="form.old_password"
        type="password"
        required
      />
    </div>

    <div>
      <label>New Password:</label>
      <input
        v-model="form.new_password"
        type="password"
        required
        minlength="6"
      />
    </div>

    <div>
      <label>Confirm New Password:</label>
      <input
        v-model="form.confirm_password"
        type="password"
        required
        minlength="6"
      />
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">Password changed successfully!</div>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Changing...' : 'Change Password' }}
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        old_password: '',
        new_password: '',
        confirm_password: ''
      },
      loading: false,
      error: '',
      success: false
    };
  },
  methods: {
    async changePassword() {
      if (this.form.new_password !== this.form.confirm_password) {
        this.error = 'New passwords do not match';
        return;
      }

      this.loading = true;
      this.error = '';
      this.success = false;

      try {
        const response = await fetch('/api/v1/users/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.token}`
          },
          body: JSON.stringify({
            old_password: this.form.old_password,
            new_password: this.form.new_password
          })
        });

        const data = await response.json();

        if (data.success) {
          this.success = true;
          this.form = {
            old_password: '',
            new_password: '',
            confirm_password: ''
          };
          // Optionally redirect to login
          setTimeout(() => {
            this.$store.commit('logout');
            this.$router.push('/login');
          }, 2000);
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
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-change-password',
  template: `
    <form (ngSubmit)="onSubmit()" #changePasswordForm="ngForm">
      <div>
        <label>Current Password:</label>
        <input
          type="password"
          [(ngModel)]="oldPassword"
          name="oldPassword"
          required
          #oldPasswordInput="ngModel"
        />
      </div>

      <div>
        <label>New Password:</label>
        <input
          type="password"
          [(ngModel)]="newPassword"
          name="newPassword"
          required
          minlength="6"
          #newPasswordInput="ngModel"
        />
      </div>

      <div>
        <label>Confirm New Password:</label>
        <input
          type="password"
          [(ngModel)]="confirmPassword"
          name="confirmPassword"
          required
          minlength="6"
          #confirmPasswordInput="ngModel"
        />
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="success" class="success">Password changed successfully!</div>

      <button type="submit" [disabled]="loading || !changePasswordForm.valid">
        {{ loading ? 'Changing...' : 'Change Password' }}
      </button>
    </form>
  `
})
export class ChangePasswordComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body: ChangePasswordRequest = {
      old_password: this.oldPassword,
      new_password: this.newPassword
    };

    this.http.post<ApiResponse>('/api/v1/users/change-password', body, { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = true;
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            // Optionally redirect to login
            setTimeout(() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }, 2000);
          } else {
            this.error = response.message;
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

1. **Password Requirements**: Both old and new passwords must be at least 6 characters long
2. **Password Verification**: The old password is verified against the stored hash before allowing the change
3. **Secure Storage**: New passwords are hashed using bcrypt before storage
4. **Token Invalidation**: Consider implementing token refresh or requiring re-login after password change
5. **Rate Limiting**: Implement rate limiting to prevent brute force attacks on password changes

## Testing

The endpoint has been thoroughly tested with the following scenarios:
- ✅ Authentication errors (missing/invalid tokens)
- ✅ Validation errors (missing fields, short passwords)
- ✅ Business logic errors (incorrect old password)
- ✅ Successful password changes
- ✅ Password verification after change
- ✅ Edge cases (same password, complex passwords)

All tests pass with 100% success rate.

## Error Handling Best Practices

1. **Always check response.success** before proceeding
2. **Display user-friendly error messages** from response.message
3. **Handle network errors** gracefully
4. **Validate form data** on the frontend before submission
5. **Clear sensitive data** from forms after successful submission

## Related Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset with token