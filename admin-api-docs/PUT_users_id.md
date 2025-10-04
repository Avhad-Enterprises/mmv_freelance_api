# PUT /users/:id - Update User by ID

## Overview
This endpoint allows super administrators to update any user's basic information. All fields are optional, allowing partial updates. The endpoint supports updating user details, changing passwords, and modifying contact information.

## Endpoint Details
- **URL**: `/users/:id`
- **Method**: `PUT`
- **Authentication**: Required (JWT token)
- **Authorization**: Requires `SUPER_ADMIN` role

## Request

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### URL Parameters
- `id` (number): The user ID to update

### Body Parameters
All parameters are optional and validated using the `UpdateUserDto`. Only provided fields will be updated.

#### Optional Parameters
- `first_name` (string): User's first name
- `last_name` (string): User's last name
- `email` (string): User's email address (must be unique if changed)
- `password` (string): New password (will be hashed if provided)
- `phone_number` (string): User's phone number
- `city` (string): User's city
- `country` (string): User's country
- `address_line_first` (string): User's address
- `username` (string): Custom username

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user_id": 123,
    "email": "updated.email@example.com",
    "first_name": "Updated",
    "last_name": "Name",
    "username": "updatedname",
    "phone_number": "+1234567890",
    "city": "New York",
    "country": "USA",
    "address_line_first": "123 Updated St",
    "is_active": true,
    "is_banned": false,
    "banned_reason": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
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

#### 404 Not Found (User not found)
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "email must be an email"
}
```

## Request Examples

### Update Basic Information
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone_number": "+1234567890"
}
```

### Change Email Address
```json
{
  "email": "new.email@example.com"
}
```

### Update Password
```json
{
  "password": "NewSecurePassword123!"
}
```

### Update Contact Information
```json
{
  "city": "Los Angeles",
  "country": "USA",
  "address_line_first": "456 Updated Avenue"
}
```

### Partial Update (Only Username)
```json
{
  "username": "johnsmith"
}
```

### Multiple Fields Update
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com",
  "phone_number": "+1987654321",
  "city": "Chicago",
  "country": "USA"
}
```

## Frontend Implementation Examples

### JavaScript (Vanilla)

```javascript
async function updateUser(userId, updateData) {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('User updated successfully:', data);
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to update user');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Usage examples
updateUser(123, {
  first_name: 'John',
  last_name: 'Smith',
  phone_number: '+1234567890'
})
  .then(user => {
    console.log('Updated user:', user);
  })
  .catch(error => {
    console.error('Failed to update user:', error.message);
  });

// Change password
updateUser(123, {
  password: 'NewSecurePassword123!'
})
  .then(user => {
    console.log('Password updated for user:', user.user_id);
  })
  .catch(error => {
    console.error('Failed to update password:', error.message);
  });

// Update email
updateUser(123, {
  email: 'new.email@example.com'
})
  .then(user => {
    console.log('Email updated to:', user.email);
  })
  .catch(error => {
    console.error('Failed to update email:', error.message);
  });
```

### React Hook

```jsx
import { useState } from 'react';

function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUser = async (userId, updateData) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }

      setLoading(false);
      return data.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { updateUser, loading, error };
}

// User edit form component
function EditUserForm({ userId, initialData, onSuccess, onCancel }) {
  const { updateUser, loading, error } = useUpdateUser();
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone_number: initialData?.phone_number || '',
    city: initialData?.city || '',
    country: initialData?.country || '',
    address_line_first: initialData?.address_line_first || '',
    username: initialData?.username || ''
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare update data (only include changed fields)
    const updateData = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== initialData?.[key]) {
        updateData[key] = formData[key];
      }
    });

    // Add password if provided
    if (passwordData.password) {
      if (passwordData.password !== passwordData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      updateData.password = passwordData.password;
    }

    try {
      const updatedUser = await updateUser(userId, updateData);
      console.log('User updated:', updatedUser);
      onSuccess(updatedUser);
    } catch (err) {
      console.error('Failed to update user:', err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-user-form">
      <h3>Edit User</h3>

      {error && <div className="error">{error}</div>}

      <div className="form-section">
        <h4>Basic Information</h4>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Contact Information</h4>

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

        <div className="form-group">
          <label htmlFor="address_line_first">Address</label>
          <input
            type="text"
            id="address_line_first"
            name="address_line_first"
            value={formData.address_line_first}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Change Password (Optional)</h4>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={passwordData.password}
            onChange={handlePasswordChange}
            placeholder="Leave empty to keep current password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update User'}
        </button>
      </div>
    </form>
  );
}
```

### Vue.js Composition API

```vue
<template>
  <div class="edit-user-form">
    <h3>Edit User</h3>

    <div v-if="error" class="error">{{ error }}</div>

    <form @submit.prevent="handleSubmit">
      <div class="form-section">
        <h4>Basic Information</h4>

        <div class="form-row">
          <div class="form-group">
            <label for="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              v-model="formData.first_name"
            />
          </div>

          <div class="form-group">
            <label for="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              v-model="formData.last_name"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
          />
        </div>
      </div>

      <div class="form-section">
        <h4>Contact Information</h4>

        <div class="form-group">
          <label for="phone_number">Phone Number</label>
          <input
            type="tel"
            id="phone_number"
            v-model="formData.phone_number"
          />
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

        <div class="form-group">
          <label for="address_line_first">Address</label>
          <input
            type="text"
            id="address_line_first"
            v-model="formData.address_line_first"
          />
        </div>
      </div>

      <div class="form-section">
        <h4>Change Password (Optional)</h4>

        <div class="form-group">
          <label for="password">New Password</label>
          <input
            type="password"
            id="password"
            v-model="passwordData.password"
            placeholder="Leave empty to keep current password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="passwordData.confirmPassword"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" :disabled="loading">
          Cancel
        </button>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Updating...' : 'Update User' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['success', 'cancel']);

const loading = ref(false);
const error = ref(null);

const formData = reactive({
  first_name: props.initialData?.first_name || '',
  last_name: props.initialData?.last_name || '',
  email: props.initialData?.email || '',
  phone_number: props.initialData?.phone_number || '',
  city: props.initialData?.city || '',
  country: props.initialData?.country || '',
  address_line_first: props.initialData?.address_line_first || '',
  username: props.initialData?.username || ''
});

const passwordData = reactive({
  password: '',
  confirmPassword: ''
});

const updateUser = async (userId, updateData) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user');
  }

  return data.data;
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  // Prepare update data (only include changed fields)
  const updateData = {};
  Object.keys(formData).forEach(key => {
    if (formData[key] !== props.initialData?.[key]) {
      updateData[key] = formData[key];
    }
  });

  // Add password if provided
  if (passwordData.password) {
    if (passwordData.password !== passwordData.confirmPassword) {
      error.value = 'Passwords do not match';
      loading.value = false;
      return;
    }
    updateData.password = passwordData.password;
  }

  try {
    const updatedUser = await updateUser(props.userId, updateData);
    console.log('User updated:', updatedUser);
    emit('success', updatedUser);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.edit-user-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.form-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.form-actions button[type="button"] {
  background: #6c757d;
  color: white;
}

.form-actions button[type="submit"] {
  background: #007bff;
  color: white;
}

.form-actions button:hover:not(:disabled) {
  opacity: 0.9;
}

.form-actions button:disabled {
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

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  city?: string;
  country?: string;
  address_line_first?: string;
  username?: string;
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

export interface UpdateUserResponse {
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

  updateUser(userId: number, updateData: UpdateUserRequest): Observable<User> {
    return this.http.put<UpdateUserResponse>(
      `${this.apiUrl}/users/${userId}`,
      updateData
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

// edit-user.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserService, UpdateUserRequest, User } from './user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  template: `
    <div class="edit-user-container">
      <h3>Edit User</h3>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h4>Basic Information</h4>

          <div class="form-row">
            <div class="form-group">
              <label for="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                formControlName="first_name"
              />
            </div>

            <div class="form-group">
              <label for="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                formControlName="last_name"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
            />
            <div *ngIf="isFieldInvalid('email')" class="error-text">
              Valid email is required
            </div>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
            />
          </div>
        </div>

        <div class="form-section">
          <h4>Contact Information</h4>

          <div class="form-group">
            <label for="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              formControlName="phone_number"
            />
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

          <div class="form-group">
            <label for="address_line_first">Address</label>
            <input
              type="text"
              id="address_line_first"
              formControlName="address_line_first"
            />
          </div>
        </div>

        <div class="form-section">
          <h4>Change Password (Optional)</h4>

          <div class="form-group">
            <label for="password">New Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Leave empty to keep current password"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" (click)="onCancel()" [disabled]="loading">
            Cancel
          </button>
          <button type="submit" [disabled]="userForm.invalid || loading">
            {{ loading ? 'Updating...' : 'Update User' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .edit-user-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .form-section h4 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #333;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 0.5rem;
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

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: #007bff;
    }

    .form-group input.ng-invalid.ng-touched {
      border-color: #dc3545;
    }

    .error-text {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .form-actions button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }

    .form-actions button[type="button"] {
      background: #6c757d;
      color: white;
    }

    .form-actions button[type="submit"] {
      background: #007bff;
      color: white;
    }

    .form-actions button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .form-actions button:disabled {
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
      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class EditUserComponent {
  @Input() userId!: number;
  @Input() initialData?: Partial<User>;
  @Output() success = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();

  userForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: ['', [Validators.email]],
      username: [''],
      phone_number: [''],
      city: [''],
      country: [''],
      address_line_first: [''],
      password: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.userForm.patchValue({
        first_name: this.initialData.first_name || '',
        last_name: this.initialData.last_name || '',
        email: this.initialData.email || '',
        username: this.initialData.username || '',
        phone_number: this.initialData.phone_number || '',
        city: this.initialData.city || '',
        country: this.initialData.country || '',
        address_line_first: this.initialData.address_line_first || ''
      });
    }
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

    const formValue = this.userForm.value;

    // Check password confirmation
    if (formValue.password && formValue.password !== formValue.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.loading = false;
      return;
    }

    // Prepare update data (only include non-empty fields)
    const updateData: UpdateUserRequest = {};
    Object.keys(formValue).forEach(key => {
      if (key !== 'confirmPassword' && formValue[key] && formValue[key] !== this.initialData?.[key]) {
        updateData[key] = formValue[key];
      }
    });

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (user: User) => {
        console.log('User updated:', user);
        this.success.emit(user);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }
}
```

## Notes
- Only users with `SUPER_ADMIN` role can update user information
- All fields are optional - only provided fields will be updated
- Passwords are automatically hashed when changed
- Email uniqueness is enforced when updating email addresses
- The `updated_at` timestamp is automatically updated on successful changes
- Empty update requests (no fields provided) are allowed but don't change anything
- Validation provides specific error messages for invalid data
- Partial updates are supported - you can update just one field or multiple fields
- Password changes require the new password to be provided (confirmation handled on frontend)