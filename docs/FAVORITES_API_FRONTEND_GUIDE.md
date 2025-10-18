# Favorites API - Frontend Developer Guide

## Overview

The Favorites API allows users (clients) to manage their favorite freelancers. Users can add freelancers to their favorites list, remove them, and retrieve their favorite freelancers with or without detailed information.

### Key Features
- ✅ **Add freelancers to favorites**
- ✅ **Remove freelancers from favorites**
- ✅ **Retrieve user's favorite freelancers**
- ✅ **Get detailed information about favorite freelancers**
- ✅ **Admin endpoint to view all favorites**
- ✅ **Duplicate prevention**
- ✅ **Soft delete functionality**
- ✅ **Authentication required for all user operations**

### Authentication
All user-facing endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

**Note:** Authentication is handled globally by middleware, so you don't need to include auth tokens in request bodies.

---

## API Endpoints

### 1. Add Freelancer to Favorites

**Endpoint:** `POST /api/v1/favorites/add-freelancer`

**Description:** Adds a freelancer to the authenticated user's favorites list.

**Authentication:** Required

**Request Body:**
```json
{
  "freelancer_id": 123
}
```

**Request Validation:**
- `freelancer_id`: Required, must be a valid integer (freelancer user ID)

**Success Response (201):**
```json
{
  "data": {
    "id": 456,
    "user_id": 85,
    "freelancer_id": 123,
    "is_active": true,
    "created_by": 85,
    "created_at": "2025-10-18T20:06:38.525Z",
    "updated_at": "2025-10-18T20:06:38.525Z",
    "updated_by": null,
    "is_deleted": false,
    "deleted_by": null,
    "deleted_at": null
  },
  "message": "Added to favorites"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data (missing or invalid freelancer_id)
- `401 Unauthorized`: Authentication token missing or invalid
- `404 Not Found`: Freelancer with specified ID does not exist
- `409 Conflict`: Freelancer is already in user's favorites

---

### 2. Remove Freelancer from Favorites

**Endpoint:** `DELETE /api/v1/favorites/remove-freelancer`

**Description:** Removes a freelancer from the authenticated user's favorites list.

**Authentication:** Required

**Request Body:**
```json
{
  "freelancer_id": 123
}
```

**Request Validation:**
- `freelancer_id`: Required, must be a valid integer (freelancer user ID)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Removed from favorites"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data (missing or invalid freelancer_id)
- `401 Unauthorized`: Authentication token missing or invalid
- `404 Not Found`: Favorite relationship does not exist

---

### 3. Get User's Favorite Freelancers

**Endpoint:** `GET /api/v1/favorites/my-favorites`

**Description:** Retrieves the authenticated user's favorite freelancers (basic information).

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "data": [
    {
      "id": 456,
      "user_id": 85,
      "freelancer_id": 123,
      "is_active": true,
      "created_by": 85,
      "created_at": "2025-10-18T20:06:38.525Z",
      "updated_at": "2025-10-18T20:06:38.525Z",
      "updated_by": null,
      "is_deleted": false,
      "deleted_by": null,
      "deleted_at": null
    }
  ],
  "message": "User's favorite freelancers fetched successfully"
}
```

**Empty Response (200):**
```json
{
  "data": [],
  "message": "User's favorite freelancers fetched successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication token missing or invalid

---

### 4. Get Detailed Favorite Freelancers Information

**Endpoint:** `GET /api/v1/favorites/my-favorites-details`

**Description:** Retrieves detailed information about the authenticated user's favorite freelancers, including freelancer profile data.

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "data": [
    {
      "id": 456,
      "user_id": 85,
      "freelancer_id": 123,
      "is_active": true,
      "created_by": 85,
      "created_at": "2025-10-18T20:06:38.525Z",
      "updated_at": "2025-10-18T20:06:38.525Z",
      "updated_by": null,
      "is_deleted": false,
      "deleted_by": null,
      "deleted_at": null,
      "username": "freelancer-john-doe",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture": "https://example.com/profile.jpg",
      "city": "New York",
      "country": "United States"
    }
  ],
  "message": "Favorite freelancers details fetched successfully"
}
```

**Empty Response (200):**
```json
{
  "data": [],
  "message": "No favorite freelancers found"
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication token missing or invalid

---

### 5. Get All Favorites (Admin Only)

**Endpoint:** `GET /api/v1/favorites/all`

**Description:** Retrieves all favorite relationships in the system (admin only).

**Authentication:** Required (Admin or Super Admin role)

**Request Body:** None

**Success Response (200):**
```json
{
  "total": 25,
  "data": [
    {
      "id": 456,
      "user_id": 85,
      "freelancer_id": 123,
      "is_active": true,
      "created_by": 85,
      "created_at": "2025-10-18T20:06:38.525Z",
      "updated_at": "2025-10-18T20:06:38.525Z",
      "updated_by": null,
      "is_deleted": false,
      "deleted_by": null,
      "deleted_at": null
    }
  ],
  "message": "All favorites fetched successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication token missing or invalid
- `403 Forbidden`: User does not have admin privileges

---

## Data Models

### Favorite Relationship
```typescript
interface Favorite {
  id?: number;
  user_id: number;           // ID of the user who favorited
  freelancer_id: number;     // ID of the favorited freelancer
  is_active?: boolean;       // Whether the favorite is active
  created_by?: number;       // ID of user who created the favorite
  created_at?: Date;         // Creation timestamp
  updated_by?: number;       // ID of user who last updated
  updated_at?: Date;         // Last update timestamp
  is_deleted?: boolean;      // Soft delete flag
  deleted_by?: number;       // ID of user who deleted
  deleted_at?: Date;         // Deletion timestamp
}
```

### Detailed Favorite with Freelancer Info
```typescript
interface FavoriteWithDetails extends Favorite {
  username?: string;         // Freelancer's username
  email?: string;            // Freelancer's email
  first_name?: string;       // Freelancer's first name
  last_name?: string;        // Freelancer's last name
  profile_picture?: string;  // URL to profile picture
  city?: string;             // Freelancer's city
  country?: string;          // Freelancer's country
}
```

---

## Usage Examples

### JavaScript/TypeScript Examples

#### Add to Favorites
```javascript
const addToFavorites = async (freelancerId) => {
  try {
    const response = await fetch('/api/v1/favorites/add-freelancer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        freelancer_id: freelancerId
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Added to favorites:', result.data);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

#### Remove from Favorites
```javascript
const removeFromFavorites = async (freelancerId) => {
  try {
    const response = await fetch('/api/v1/favorites/remove-freelancer', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        freelancer_id: freelancerId
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Removed from favorites');
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

#### Get My Favorites
```javascript
const getMyFavorites = async () => {
  try {
    const response = await fetch('/api/v1/favorites/my-favorites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      console.log('My favorites:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Network error:', error);
    return [];
  }
};
```

#### Get Detailed Favorites
```javascript
const getDetailedFavorites = async () => {
  try {
    const response = await fetch('/api/v1/favorites/my-favorites-details', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Detailed favorites:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Network error:', error);
    return [];
  }
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = async (detailed = false) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = detailed ? '/api/v1/favorites/my-favorites-details' : '/api/v1/favorites/my-favorites';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        setFavorites(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (freelancerId) => {
    try {
      const response = await fetch('/api/v1/favorites/add-freelancer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ freelancer_id: freelancerId })
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh favorites list
        await fetchFavorites();
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const removeFavorite = async (freelancerId) => {
    try {
      const response = await fetch('/api/v1/favorites/remove-freelancer', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ freelancer_id: freelancerId })
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh favorites list
        await fetchFavorites();
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite
  };
};

export default useFavorites;
```

---

## Error Handling

### Common Error Patterns

All API errors follow this structure:
```json
{
  "success": false,
  "message": "Error description",
  "meta": {
    "timestamp": "2025-10-18T20:06:38.525Z",
    "version": "v1"
  }
}
```

### Error Codes and Meanings

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | Various validation messages | Invalid request data |
| 401 | "Authentication token missing" | No JWT token provided |
| 401 | "Authentication token invalid" | Invalid or expired JWT token |
| 403 | "Forbidden" | Insufficient permissions (admin endpoints) |
| 404 | "Freelancer not found" | Specified freelancer doesn't exist |
| 404 | "Favorite not found" | Favorite relationship doesn't exist |
| 409 | "This freelancer is already in favorites" | Duplicate favorite attempt |
| 500 | Various internal errors | Server-side errors |

### Best Practices for Error Handling

1. **Always check response status** before processing data
2. **Handle authentication errors** by redirecting to login
3. **Show user-friendly messages** for common errors
4. **Retry logic** for network errors (with exponential backoff)
5. **Validate data** before making API calls

---

## Business Logic Notes

### Duplicate Prevention
- Users cannot add the same freelancer to favorites twice
- If a previously removed favorite is added again, it's reactivated instead of creating a duplicate

### Soft Deletes
- Favorites are "soft deleted" (marked as deleted) rather than permanently removed
- This allows for reactivation and audit trails

### Data Relationships
- Favorites link users (clients) to freelancers
- Freelancer existence is validated before creating favorites
- Detailed endpoints join with user profiles for comprehensive information

### Performance Considerations
- All queries include proper indexing considerations
- Results are ordered by creation date (newest first)
- Admin endpoints should be used sparingly due to potential data volume

---

## Testing

The favorites API includes comprehensive test coverage. To run tests:

```bash
# Run all favorites tests
npm test -- tests/favorites/run-favorites-tests.js

# Or run individual test files
npm test -- tests/favorites/test-add-favorite.js
npm test -- tests/favorites/test-remove-favorite.js
npm test -- tests/favorites/test-get-my-favorites.js
npm test -- tests/favorites/test-get-my-favorites-details.js
```

---

## Changelog

### Version 1.0.0
- Initial implementation of favorites API
- Basic CRUD operations for favorite relationships
- Authentication integration
- Comprehensive error handling
- Admin endpoints for system management
- Detailed freelancer information retrieval
- Soft delete functionality
- Duplicate prevention
- Complete test coverage

---

*This documentation is for frontend developers integrating with the Favorites API. For backend implementation details, refer to the source code in `src/features/favorites/`.*