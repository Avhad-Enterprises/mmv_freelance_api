# 🔐 Authentication API Guide

Quick reference for Registration and Login APIs for all user roles.

---

## 🌐 Setup

**Base URL:** `http://localhost:8000/api/v1`  
**Auth Header:** `'Authorization': 'Bearer YOUR_JWT_TOKEN'`

---

## 📝 Registration APIs

### 1️⃣ Client Registration
```
POST /auth/register/client
Content-Type: multipart/form-data
```

**Required:** `first_name`, `last_name`, `email`, `password`, `company_name`

**Optional:** `phone_number`, `city`, `country`, `industry`, `website`, `required_services` (JSON array), `budget_min`, `budget_max`, `profile_picture` (file), `id_document` (file), `business_document` (file)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "user_id": 123, "email": "...", "user_type": "CLIENT" },
    "token": "eyJhbGci...",
    "profile": { "client_profile_id": 456, "company_name": "..." }
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

**Response (201):** Same structure as Client, `user_type`: "VIDEOGRAPHER"

---

### 3️⃣ Video Editor Registration
```
POST /auth/register/videoeditor
Content-Type: multipart/form-data
```

**Required:** `first_name`, `last_name`, `email`, `password`, `profile_title`

**Optional:** Same as Videographer

**Response (201):** Same structure, `user_type`: "VIDEO_EDITOR"

---

## 🔑 Login API (All Roles)

```
POST /auth/login
Content-Type: application/json
```

**Body:**
```json
{ "email": "user@example.com", "password": "YourPassword123!" }
```

**Response (200):**
```json
{
  "success": true,
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

## 📝 TypeScript Types

```typescript
type ExperienceLevel = 'entry' | 'intermediate' | 'expert' | 'master';

interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  roles: string[];  // e.g., ['CLIENT'], ['VIDEOGRAPHER'], ['VIDEO_EDITOR']
}

interface AuthResponse {
  success: boolean;
  data: { 
    user: User & { user_type: string; profile_picture?: string };
    token: string; 
    profile?: any 
  };
}

interface LoginResponse {
  success: boolean;
  data: { user: User; token: string };
}
```

---

## ⚠️ Important Notes

**Password Requirements:** Min 6 chars (validation enforced)

**File Limits:** Images (5MB), Documents (10MB)

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

1. Store tokens in `localStorage` or `sessionStorage`
2. Validate files before upload (type & size)
3. Show loading states during API calls
4. Handle errors with user-friendly messages
5. Clear tokens on logout
6. Use HTTPS in production
7. Implement token refresh mechanism

---

**Last Updated:** October 2, 2025 | **API Version:** v1
