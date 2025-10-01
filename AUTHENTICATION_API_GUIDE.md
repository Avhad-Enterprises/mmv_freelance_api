# 🔐 Authentication API Guide

Quick reference for Registration and Login APIs for all user roles.

---

## 🌐 Setup

**Base URL:** `http://localhost:8000/api/v1`

**Note:** Registration and Login routes are **public** - no authentication required. After successful login, use the returned token for protected routes.

---

## 📝 Registration APIs

**All registration endpoints are public** - No authentication required.

### 1️⃣ Client Registration
```
POST /auth/register/client
Content-Type: multipart/form-data
```

**Required:** `first_name`, `last_name`, `email`, `password`, `company_name`

**Optional:** `phone_number`, `address_line_first`, `city`, `country`, `industry`, `website`, `required_services` (JSON array), `budget_min`, `budget_max`, `profile_picture` (file), `id_document` (file), `business_document` (file)

**Response (201):**
```json
{
  "success": true,
  "message": "Client registered successfully",
  "data": {
    "user": {
      "user_id": 123,
      "email": "john@company.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "CLIENT",
      "profile_picture": "https://..."
    },
    "token": "eyJhbGci..."
  }
}
```

---

### 2️⃣ Videographer Registration
```
POST /auth/register/videographer
Content-Type: multipart/form-data
```

**Required:** `first_name`, `last_name`, `email`, `password`, `profile_title`

**Optional:** `phone_number`, `city`, `country`, `experience_level` (entry/intermediate/expert/master), `hourly_rate` (1-10000), `short_description`, `skills` (JSON array), `portfolio_links` (JSON array), `profile_picture` (file), `id_document` (file)

**Response (201):**
```json
{
  "success": true,
  "message": "Videographer registered successfully",
  "data": {
    "user": {
      "user_id": 124,
      "email": "maria@videography.com",
      "first_name": "Maria",
      "last_name": "Rodriguez",
      "user_type": "VIDEOGRAPHER",
      "profile_picture": "https://..."
    },
    "token": "eyJhbGci..."
  }
}
```

---

### 3️⃣ Video Editor Registration
```
POST /auth/register/videoeditor
Content-Type: multipart/form-data
```

**Required:** `first_name`, `last_name`, `email`, `password`, `profile_title`

**Optional:** Same as Videographer

**Response (201):**
```json
{
  "success": true,
  "message": "Video editor registered successfully",
  "data": {
    "user": {
      "user_id": 125,
      "email": "alex@videoediting.com",
      "first_name": "Alex",
      "last_name": "Johnson",
      "user_type": "VIDEO_EDITOR",
      "profile_picture": "https://..."
    },
    "token": "eyJhbGci..."
  }
}
```

---

## 🔑 Login API (All Roles)

```
POST /auth/login
Content-Type: application/json
```

**No authentication required** - This is a public endpoint.

**Body:**
```json
{ "email": "user@example.com", "password": "YourPassword123!" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { 
      "user_id": 123, 
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "roles": ["CLIENT"]
    },
    "token": "eyJhbGci..."
  }
}
```

**Errors:** `400` (missing fields), `401` (invalid credentials), `403` (account banned), `404` (user not found)

---

## 🎨 Code Examples

### Client Registration (React + FormData)
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const form = new FormData();
  
  // Required fields
  form.append('first_name', 'John');
  form.append('last_name', 'Doe');
  form.append('email', 'john@company.com');
  form.append('password', 'Password123!');
  form.append('company_name', 'Tech Inc');
  
  // Optional fields
  form.append('phone_number', '+1234567890');
  form.append('required_services', JSON.stringify(['videography', 'editing']));
  
  // Files (optional)
  if (profilePic) form.append('profile_picture', profilePic);

  const res = await fetch('http://localhost:8000/api/v1/auth/register/client', {
    method: 'POST',
    body: form
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    window.location.href = '/dashboard';
  }
};
```

---

### Login (Fetch API)
```jsx
const handleLogin = async (email, password) => {
  const res = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    // Redirect based on user roles
    const roles = data.data.user.roles;
    if (roles.includes('CLIENT')) window.location.href = '/client/dashboard';
    else if (roles.includes('VIDEOGRAPHER')) window.location.href = '/videographer/dashboard';
    else if (roles.includes('VIDEO_EDITOR')) window.location.href = '/videoeditor/dashboard';
    else window.location.href = '/dashboard';
  }
};
```

---

### Axios Setup with Auto Token
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
});

// Auto add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Usage
export const registerClient = (formData) => api.post('/auth/register/client', formData);
export const login = (email, password) => api.post('/auth/login', { email, password });
```

---

### Using Token for Protected Routes
After login, include the token in protected API calls:

```javascript
// Example: Fetch user profile (protected route)
const fetchProfile = async () => {
  const token = localStorage.getItem('token');
  
  const res = await fetch('http://localhost:8000/api/v1/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return res.json();
};

// With Axios (token auto-added via interceptor above)
const profile = await api.get('/user/profile');
```

---

## 📝 TypeScript Types

```typescript
type ExperienceLevel = 'entry' | 'intermediate' | 'expert' | 'master';

interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  roles?: string[];  // Only in login response
  user_type?: string;  // Only in registration response
  profile_picture?: string;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  data: { 
    user: {
      user_id: number;
      email: string;
      first_name: string;
      last_name: string;
      user_type: string;  // 'CLIENT' | 'VIDEOGRAPHER' | 'VIDEO_EDITOR'
      profile_picture?: string;
    };
    token: string;
  };
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: { 
    user: {
      user_id: number;
      email: string;
      first_name: string;
      last_name: string;
      username: string;
      roles: string[];  // e.g., ['CLIENT']
    };
    token: string;
  };
}
```

---

## ⚠️ Important Notes

**Password Requirements:** Min 6 chars (validation enforced)

**File Limits:** All files (images and documents) - max 10MB each, up to 3 files total

**File Types:** 
- Profile pictures: image files only (jpg, png, gif, etc.)
- Documents (ID, business): images or PDF files

**Experience Levels:** `entry`, `intermediate`, `expert`, `master` (not beginner)

**Hourly Rate:** Must be between 1 and 10,000

**Array Fields:** Must be JSON strings
```javascript
form.append('skills', JSON.stringify(['Premiere Pro', 'After Effects']));
```

**User Roles:** Login returns `roles` array (e.g., `['CLIENT']`, `['VIDEOGRAPHER']`, `['VIDEO_EDITOR']`)

**Registration Returns:** `user_type` field (CLIENT, VIDEOGRAPHER, VIDEO_EDITOR)

---

## 🔧 Common Errors

| Code | Meaning | Fix |
|------|---------|-----|
| 400 | Bad Request | Check required fields |
| 401 | Unauthorized | Verify credentials |
| 403 | Forbidden | Account is banned |
| 404 | Not Found | User not found |
| 409 | Conflict | Email already exists |
| 413 | Payload Too Large | Reduce file size |
| 422 | Validation Error | Check field formats (e.g., URL format for website) |

---

## 💡 Best Practices

1. **No Auth Header for Registration/Login** - These routes are public
2. Store tokens in `localStorage` or `sessionStorage` after successful login
3. Add `Authorization: Bearer <token>` header for protected routes (e.g., profile, dashboard)
4. Validate files before upload (type & size)
5. Show loading states during API calls
6. Handle errors with user-friendly messages
7. Clear tokens on logout
8. Use HTTPS in production

---

**Last Updated:** October 2, 2025 | **API Version:** v1
