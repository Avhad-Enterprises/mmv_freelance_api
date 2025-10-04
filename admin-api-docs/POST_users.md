# POST /users - Create New User

## Overview
This endpoint allows super administrators to create new users in the system. It supports creating users with different roles (CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN) and optional profile data creation.

## Endpoint Details
- **URL**: `/users`
- **Method**: `POST`
- **Authentication**: Required (JWT token)
- **Authorization**: Requires `SUPER_ADMIN` role

## Request

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Body Parameters
All parameters are validated using the `CreateUserDto`.

#### Required Parameters
- `first_name` (string): User's first name
- `last_name` (string): User's last name
- `email` (string): User's email address (must be unique)

#### Optional Parameters
- `password` (string): User's password (will be hashed if provided)
- `phone_number` (string): User's phone number
- `city` (string): User's city
- `country` (string): User's country
- `address_line_first` (string): User's address
- `username` (string): Custom username (auto-generated from email if not provided)
- `roleName` (string): User role - one of: `CLIENT`, `VIDEOGRAPHER`, `VIDEO_EDITOR`, `ADMIN`, `SUPER_ADMIN`
- `profileData` (object): Profile-specific data based on the role

## Response

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user_id": 123,
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "phone_number": "+1234567890",
    "city": "New York",
    "country": "USA",
    "address_line_first": "123 Main St",
    "is_active": true,
    "is_banned": false,
    "banned_reason": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
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

#### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "first_name must be a string, first_name should not be empty, last_name must be a string, last_name should not be empty, email must be an email, email should not be empty"
}
```

#### 400 Bad Request - Invalid Role
```json
{
  "success": false,
  "message": "roleName must be one of the following values: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN"
}
```

## Request Examples

### Basic User Creation
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

### User with Password and Contact Info
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!",
  "phone_number": "+1234567890",
  "city": "Los Angeles",
  "country": "USA",
  "address_line_first": "456 Oak Avenue"
}
```

### User with Role Assignment
```json
{
  "first_name": "Mike",
  "last_name": "Johnson",
  "email": "mike.johnson@example.com",
  "password": "Password123!",
  "roleName": "CLIENT"
}
```

### Videographer with Profile Data
```json
{
  "first_name": "Sarah",
  "last_name": "Wilson",
  "email": "sarah.wilson@example.com",
  "password": "Password123!",
  "roleName": "VIDEOGRAPHER",
  "phone_number": "+1987654321",
  "city": "Chicago",
  "country": "USA",
  "profileData": {
    "bio": "Professional videographer with 5+ years experience",
    "hourly_rate": 75,
    "skills": ["wedding videography", "corporate videos", "documentary"],
    "equipment": ["Sony A7S III", "DJI Ronin-S", "Adobe Premiere Pro"]
  }
}
```

## Frontend Implementation Examples

### JavaScript (Vanilla)

```javascript
async function createUser(userData) {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('User created successfully:', data);
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to create user');
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Usage examples
createUser({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  password: 'SecurePassword123!',
  roleName: 'CLIENT'
})
  .then(user => {
    console.log('Created user:', user);
  })
  .catch(error => {
    console.error('Failed to create user:', error.message);
  });

// Create videographer with profile
createUser({
  first_name: 'Sarah',
  last_name: 'Wilson',
  email: 'sarah.wilson@example.com',
  password: 'Password123!',
  roleName: 'VIDEOGRAPHER',
  phone_number: '+1987654321',
  city: 'Chicago',
  profileData: {
    bio: 'Professional videographer',
    hourly_rate: 75,
    skills: ['wedding videography', 'corporate videos']
  }
})
  .then(user => {
    console.log('Created videographer:', user);
  })
  .catch(error => {
    console.error('Failed to create videographer:', error.message);
  });
```

### React Hook

```jsx
import { useState } from 'react';

function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      setLoading(false);
      return data.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { createUser, loading, error };
}

// User creation form component
function CreateUserForm() {
  const { createUser, loading, error } = useCreateUser();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    city: '',
    country: '',
    roleName: 'CLIENT'
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = await createUser(formData);
      console.log('User created:', newUser);
      setSuccess(true);
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        city: '',
        country: '',
        roleName: 'CLIENT'
      });
    } catch (err) {
      console.error('Failed to create user:', err.message);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h3>User created successfully!</h3>
        <button onClick={() => setSuccess(false)}>Create Another User</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="create-user-form">
      <h2>Create New User</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">First Name *</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Last Name *</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Leave empty to auto-generate"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="roleName">Role</label>
          <select
            id="roleName"
            name="roleName"
            value={formData.roleName}
            onChange={handleChange}
          >
            <option value="CLIENT">Client</option>
            <option value="VIDEOGRAPHER">Videographer</option>
            <option value="VIDEO_EDITOR">Video Editor</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating User...' : 'Create User'}
      </button>
    </form>
  );
}
```

### Vue.js Composition API

```vue
<template>
  <div class="create-user-form">
    <h2>Create New User</h2>

    <div v-if="success" class="success-message">
      <h3>User created successfully!</h3>
      <button @click="resetForm">Create Another User</button>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div v-if="error" class="error">{{ error }}</div>

      <div class="form-row">
        <div class="form-group">
          <label for="first_name">First Name *</label>
          <input
            type="text"
            id="first_name"
            v-model="formData.first_name"
            required
          />
        </div>

        <div class="form-group">
          <label for="last_name">Last Name *</label>
          <input
            type="text"
            id="last_name"
            v-model="formData.last_name"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          placeholder="Leave empty to auto-generate"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="phone_number">Phone Number</label>
          <input
            type="tel"
            id="phone_number"
            v-model="formData.phone_number"
          />
        </div>

        <div class="form-group">
          <label for="roleName">Role</label>
          <select id="roleName" v-model="formData.roleName">
            <option value="CLIENT">Client</option>
            <option value="VIDEOGRAPHER">Videographer</option>
            <option value="VIDEO_EDITOR">Video Editor</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="city">City</label>
          <input
            type="text"
            id="city"
            v-model="formData.city"
          />
        </div>

        <div class="form-group">
          <label for="country">Country</label>
          <input
            type="text"
            id="country"
            v-model="formData.country"
          />
        </div>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating User...' : 'Create User' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone_number: '',
  city: '',
  country: '',
  roleName: 'CLIENT'
});

const loading = ref(false);
const error = ref(null);
const success = ref(false);

const createUser = async (userData) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create user');
  }

  return data.data;
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    const newUser = await createUser(formData.value);
    console.log('User created:', newUser);
    success.value = true;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    city: '',
    country: '',
    roleName: 'CLIENT'
  };
  success.value = false;
  error.value = null;
};
</script>

<style scoped>
.create-user-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button[type="submit"]:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button[type="submit"]:hover:not(:disabled) {
  background: #0056b3;
}

.success-message {
  text-align: center;
  padding: 2rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  color: #155724;
}

.success-message h3 {
  margin-top: 0;
}

.success-message button {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
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
  .form-row {
    flex-direction: column;
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

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone_number?: string;
  city?: string;
  country?: string;
  address_line_first?: string;
  username?: string;
  roleName?: 'CLIENT' | 'VIDEOGRAPHER' | 'VIDEO_EDITOR' | 'ADMIN' | 'SUPER_ADMIN';
  profileData?: any;
}

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone_number?: string;
  city?: string;
  country?: string;
  address_line_first?: string;
  is_active: boolean;
  is_banned: boolean;
  banned_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<CreateUserResponse>(
      `${this.apiUrl}/users`,
      userData
    ).pipe(
      map(response => response.data),
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

// create-user.component.ts
import { Component } from '@angular/core';
import { UserService, CreateUserRequest, User } from './user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-user',
  template: `
    <div class="create-user-container">
      <h2>Create New User</h2>

      <div *ngIf="successMessage" class="success-message">
        <h3>{{ successMessage }}</h3>
        <button (click)="resetForm()">Create Another User</button>
      </div>

      <form *ngIf="!successMessage" [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group">
            <label for="first_name">First Name *</label>
            <input
              type="text"
              id="first_name"
              formControlName="first_name"
              [class.error]="isFieldInvalid('first_name')"
            />
            <div *ngIf="isFieldInvalid('first_name')" class="error-text">
              First name is required
            </div>
          </div>

          <div class="form-group">
            <label for="last_name">Last Name *</label>
            <input
              type="text"
              id="last_name"
              formControlName="last_name"
              [class.error]="isFieldInvalid('last_name')"
            />
            <div *ngIf="isFieldInvalid('last_name')" class="error-text">
              Last name is required
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            [class.error]="isFieldInvalid('email')"
          />
          <div *ngIf="isFieldInvalid('email')" class="error-text">
            Valid email is required
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            formControlName="password"
            placeholder="Leave empty to auto-generate"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              formControlName="phone_number"
            />
          </div>

          <div class="form-group">
            <label for="roleName">Role</label>
            <select id="roleName" formControlName="roleName">
              <option value="CLIENT">Client</option>
              <option value="VIDEOGRAPHER">Videographer</option>
              <option value="VIDEO_EDITOR">Video Editor</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">City</label>
            <input
              type="text"
              id="city"
              formControlName="city"
            />
          </div>

          <div class="form-group">
            <label for="country">Country</label>
            <input
              type="text"
              id="country"
              formControlName="country"
            />
          </div>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          [disabled]="userForm.invalid || loading"
          class="submit-btn"
        >
          {{ loading ? 'Creating User...' : 'Create User' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .create-user-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      flex: 1;
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #007bff;
    }

    .form-group input.error,
    .form-group select.error {
      border-color: #dc3545;
    }

    .error-text {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .submit-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .success-message {
      text-align: center;
      padding: 2rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      color: #155724;
    }

    .success-message h3 {
      margin-top: 0;
    }

    .success-message button {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
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
      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class CreateUserComponent {
  userForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      phone_number: [''],
      city: [''],
      country: [''],
      roleName: ['CLIENT']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const userData: CreateUserRequest = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: (user: User) => {
        console.log('User created:', user);
        this.successMessage = 'User created successfully!';
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  resetForm() {
    this.userForm.reset({
      roleName: 'CLIENT'
    });
    this.successMessage = '';
    this.errorMessage = '';
  }
}
```

## Notes
- Only users with `SUPER_ADMIN` role can create new users
- Email addresses must be unique across the system
- If no password is provided, the user will need to reset their password later
- Username is auto-generated from email if not provided
- Role assignment is optional but recommended for proper access control
- Profile data is only processed if both `roleName` and `profileData` are provided
- All created users are set to `is_active: true` by default
- Passwords are automatically hashed and never returned in responses
- Validation provides detailed error messages for all required fields
- Invalid role names are rejected with specific error messages