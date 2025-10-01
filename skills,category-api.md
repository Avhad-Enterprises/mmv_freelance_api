# 📚 Frontend API Guide - Categories & Skills

Quick reference for fetching Categories and Skills from the MMV Freelance API.

---

## 🌐 Setup

**Base URL:** `http://localhost:8000/api/v1`

**Authentication Header:**
```javascript
'Authorization': 'Bearer YOUR_JWT_TOKEN'
```

---

## 📂 Categories API

### Get All Categories
```javascript
GET /category/getallcategorys

// Returns both videographer and editor categories
```

**Response Format:**
```json
{
  "data": [
    {
      "category_id": 1,
      "category_name": "Wedding Films",
      "category_type": "videographer",
      "is_active": true
    }
  ],
  "success": true
}
```

---

## 🎯 Skills API

### Get All Skills
```javascript
GET /tags/getallskill

// Returns all available skills
```

**Response Format:**
```json
{
  "data": [
    {
      "skill_id": 1,
      "skill_name": "Adobe Premiere Pro",
      "is_active": true
    }
  ],
  "success": true
}
```

---

## 📋 Available Data

**Videographer Categories (19):**
Wedding Films, Corporate Videos, Music Videos, Documentary, Event Coverage, Aerial/Drone, Real Estate, Fashion & Beauty, Product Videos, Live Streaming, Reels & Short-Form, Podcast Videography, Travel & Lifestyle, Food & Beverage, Educational Videos, 360º/VR, Business & Industrial, Commercials & Ads, Smartphone Videography

**Video Editor Categories (17):**
YouTube Editing, Social Media Ads, Podcast Editing, Wedding Films, AI Video Editing, Gaming Videos, Corporate Videos, Documentary Editing, Music Videos, Motion Graphics, VFX & Compositing, Color Grading, Educational Content, Real Estate Videos, Sports Highlights, Movie Trailers, Event Highlights

**Skills (Sample):**
Adobe Premiere Pro, Final Cut Pro, DaVinci Resolve, After Effects, Cinematography, Drone Operation, Color Grading, Motion Graphics, 2D/3D Animation, Sound Design, VFX, and 60+ more

---

## 🎨 Quick Examples

### React Component - Fetch Categories
```jsx
import { useState, useEffect } from 'react';

export default function CategoriesDropdown({ type }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/category/getallcategorys', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      const filtered = type 
        ? data.data.filter(cat => cat.category_type === type)
        : data.data;
      setCategories(filtered);
      setLoading(false);
    })
    .catch(err => console.error(err));
  }, [type]);

  if (loading) return <div>Loading...</div>;

  return (
    <select>
      <option value="">Select category</option>
      {categories.map(cat => (
        <option key={cat.category_id} value={cat.category_id}>
          {cat.category_name}
        </option>
      ))}
    </select>
  );
}
```

### React Component - Fetch Skills
```jsx
import { useState, useEffect } from 'react';

export default function SkillsSelector() {
  const [skills, setSkills] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/tags/getallskill', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => setSkills(data.data || []))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {skills.map(skill => (
        <button
          key={skill.skill_id}
          onClick={() => setSelected(prev => 
            prev.includes(skill.skill_id) 
              ? prev.filter(id => id !== skill.skill_id)
              : [...prev, skill.skill_id]
          )}
          className={selected.includes(skill.skill_id) ? 'selected' : ''}
        >
          {skill.skill_name}
        </button>
      ))}
    </div>
  );
}
```

### Axios Setup
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
export const getCategories = () => api.get('/category/getallcategorys');
export const getSkills = () => api.get('/tags/getallskill');
```

---

## 📝 TypeScript Interfaces

```typescript
interface Category {
  category_id: number;
  category_name: string;
  category_type: 'videographer' | 'editor';
  is_active: boolean;
}

interface Skill {
  skill_id: number;
  skill_name: string;
  is_active: boolean;
}
```

---

## ⚠️ Error Handling

```javascript
try {
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error:', error.message);
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (missing/invalid token)
- `404` - Not found
- `500` - Server error

---

## 💡 Best Practices

1. **Cache data** - Store in Redux/Zustand to avoid repeated API calls
2. **Show loading states** - Improve UX with loading indicators
3. **Handle errors** - Show user-friendly error messages
4. **Use environment variables** - Store API URL in `.env`
5. **TypeScript** - Use interfaces for type safety

---

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| Unauthorized error | Check JWT token in Authorization header |
| CORS error | Contact backend team to whitelist domain |
| Empty data | Verify database is seeded |
| Slow response | Implement caching |

---

**Last Updated:** October 2, 2025 | **API Version:** v1
