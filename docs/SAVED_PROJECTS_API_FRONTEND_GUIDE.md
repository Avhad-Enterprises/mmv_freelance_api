# Saved Projects API Documentation

## Overview
The Saved Projects API allows authenticated users (freelancers, clients, and admins) to save/bookmark projects for later reference. This feature enables users to create a personal collection of interesting projects they want to track or revisit.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Available User Roles
The following user roles can use the saved projects APIs:
- `VIDEOGRAPHER`
- `VIDEO_EDITOR`
- `CLIENT`
- `ADMIN`
- `SUPER_ADMIN`

---

## 1. Save a Project

**Endpoint:** `POST /saved/save-project`

**Description:** Save/bookmark a project for the authenticated user.

**Authentication:** Required

**Request Body:**
```json
{
  "projects_task_id": 123
}
```

**Response (Success - 201):**
```json
{
  "data": {
    "saved_projects_id": 1,
    "projects_task_id": 123,
    "user_id": 456,
    "is_active": true,
    "created_at": "2025-10-14T10:00:00.000Z",
    "updated_at": "2025-10-14T10:00:00.000Z",
    "is_deleted": false
  },
  "message": "Inserted"
}
```

**Response (Error - 400 - Duplicate Save):**
```json
{
  "success": false,
  "message": "Project already saved",
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

**Response (Error - 400 - Project Not Found):**
```json
{
  "success": false,
  "message": "Project not found",
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

**Notes:**
- `user_id` is automatically set from the JWT token
- Duplicate saves for the same project by the same user are **not allowed**
- The project must exist in the `projects_task` table

---

## 2. Get My Saved Projects

**Endpoint:** `GET /saved/my-saved-projects`

**Description:** Retrieve all projects saved by the authenticated user.

**Authentication:** Required

**Response (Success - 200):**
```json
{
  "data": [
    {
      "saved_projects_id": 1,
      "projects_task_id": 123,
      "user_id": 456,
      "is_active": true,
      "created_at": "2025-10-14T10:00:00.000Z",
      "updated_at": "2025-10-14T10:00:00.000Z",
      "is_deleted": false
    },
    {
      "saved_projects_id": 2,
      "projects_task_id": 124,
      "user_id": 456,
      "is_active": true,
      "created_at": "2025-10-14T11:00:00.000Z",
      "updated_at": "2025-10-14T11:00:00.000Z",
      "is_deleted": false
    }
  ],
  "message": "User's saved projects fetched successfully"
}
```

**Response (Error - 404):**
```json
{
  "message": "User not found"
}
```

**Notes:**
- Returns all active (non-deleted) saved projects for the user
- Results are ordered by creation date (newest first)

---

## 3. Remove Saved Project

**Endpoint:** `DELETE /saved/unsave-project`

**Description:** Remove a project from the authenticated user's saved list (soft delete).

**Authentication:** Required

**Request Body:**
```json
{
  "projects_task_id": 123
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Saved project removed successfully"
}
```

**Response (Error - 404):**
```json
{
  "message": "Saved project not found"
}
```

**Notes:**
- Performs a soft delete (sets `is_deleted = true`)
- `user_id` is automatically set from the JWT token
- Users can only remove their own saved projects

---

## 4. Get All Saved Projects (Admin Only)

**Endpoint:** `GET /saved/listsave`

**Description:** Retrieve all saved projects across all users (admin dashboard).

**Authentication:** Required (ADMIN, SUPER_ADMIN only)

**Response (Success - 200):**
```json
{
  "data": [
    {
      "saved_projects_id": 1,
      "projects_task_id": 123,
      "user_id": 456,
      "is_active": true,
      "created_at": "2025-10-14T10:00:00.000Z",
      "updated_at": "2025-10-14T10:00:00.000Z",
      "is_deleted": false
    }
  ],
  "success": true
}
```

---

## Validation Rules

### Save Project
- `projects_task_id`: Required, integer, must exist in projects_task table
- Prevents duplicate saves of the same project by the same user

### Remove Saved Project
- `projects_task_id`: Required, integer
- User can only remove their own saved projects

## Error Scenarios

### Save Project
- `400 Bad Request`: Invalid data, missing required fields, project not found, or project already saved
- `401 Unauthorized`: Missing/invalid JWT token
- `500 Internal Server Error`: Database error

### Get My Saved Projects
- `401 Unauthorized`: Missing/invalid JWT token
- `500 Internal Server Error`: Database error

### Remove Saved Project
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing/invalid JWT token
- `404 Not Found`: Saved project not found for this user
- `500 Internal Server Error`: Database error

### Get All Saved Projects
- `401 Unauthorized`: Missing/invalid JWT token
- `403 Forbidden`: Insufficient permissions (not admin)
- `500 Internal Server Error`: Database error

## Frontend Integration Examples

### Save a Project
```javascript
const saveProject = async (projectId) => {
  try {
    const response = await fetch('/api/v1/saved/save-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        projects_task_id: projectId
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Project saved successfully:', data);
      // Update UI to show project as saved
    } else {
      console.error('Failed to save project:', data.message);
    }
  } catch (error) {
    console.error('Error saving project:', error);
  }
};
```

### Get User's Saved Projects
```javascript
const getMySavedProjects = async () => {
  try {
    const response = await fetch('/api/v1/saved/my-saved-projects', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Saved projects:', data.data);
      // Update UI with saved projects list
    } else {
      console.error('Failed to fetch saved projects:', data.message);
    }
  } catch (error) {
    console.error('Error fetching saved projects:', error);
  }
};
```

### Remove Saved Project
```javascript
const unsaveProject = async (projectId) => {
  try {
    const response = await fetch('/api/v1/saved/unsave-project', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        projects_task_id: projectId
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Project removed from saved list');
      // Update UI to show project as unsaved
    } else {
      console.error('Failed to unsave project:', data.message);
    }
  } catch (error) {
    console.error('Error unsaving project:', error);
  }
};
```

## Database Schema

The `saved_projects` table includes:
- `saved_projects_id`: Primary key
- `projects_task_id`: Foreign key to projects_task table
- `user_id`: Foreign key to users table
- `is_active`: Boolean flag for active status
- `is_deleted`: Soft delete flag
- `created_at`, `updated_at`: Timestamps
- `created_by`, `updated_by`: Audit fields
- `deleted_at`, `deleted_by`: Soft delete audit fields

## Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own saved projects
- **Soft Deletes**: Removed projects are marked as deleted, not permanently removed
- **Audit Trail**: All operations are tracked with created/updated/deleted by fields

## Notes for Frontend Developers

1. **Save/Unsave Toggle**: Implement a toggle button that calls save or unsave based on current state
2. **Loading States**: Show loading indicators during API calls
3. **Error Handling**: Display user-friendly error messages
4. **Optimistic Updates**: Update UI immediately, then sync with server response
5. **Caching**: Consider caching saved project IDs for faster UI updates
6. **Real-time Updates**: Consider implementing real-time updates if multiple devices are used

## Current Limitations

- No endpoint to check if a specific project is saved by the user
- No pagination for large saved project lists</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/SAVED_PROJECTS_API_FRONTEND_GUIDE.md