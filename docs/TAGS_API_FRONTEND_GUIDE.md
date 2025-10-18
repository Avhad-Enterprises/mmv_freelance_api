# Tags API Documentation

## Overview
Tags management endpoints for creating, reading, updating, and soft deleting tags. Tags are used to categorize and organize content throughout the application with support for different tag types.

## Base URL
```
/api/v1
```

## Authentication
All endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

**Required Roles:** ADMIN or SUPER_ADMIN

---

## Endpoints

### 1. Create Tag
**POST** `/tags`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Create a new tag in the system.

**Request Body:**
```json
{
  "tag_name": "Frontend",
  "tag_value": "frontend",
  "tag_type": "skill",
  "is_active": true,
  "created_by": 1
}
```

**Response (201):**
```json
{
  "data": {
    "tag_id": 1,
    "tag_name": "Frontend",
    "tag_value": "frontend",
    "tag_type": "skill",
    "is_active": true,
    "created_by": 1,
    "created_at": "2025-10-18T10:00:00Z",
    "updated_at": "2025-10-18T10:00:00Z"
  },
  "message": "Tag created successfully"
}
```

---

### 2. Get All Tags
**GET** `/tags`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Retrieve all active (non-deleted) tags.

**Response (200):**
```json
{
  "data": [
    {
      "tag_id": 1,
      "tag_name": "Frontend",
      "tag_value": "frontend",
      "tag_type": "skill",
      "is_active": true,
      "created_at": "2025-10-18T10:00:00Z"
    },
    {
      "tag_id": 2,
      "tag_name": "Backend",
      "tag_value": "backend",
      "tag_type": "skill",
      "is_active": true,
      "created_at": "2025-10-18T10:05:00Z"
    }
  ],
  "message": "Tags fetched successfully"
}
```

---

### 3. Get Tag by ID
**GET** `/tags/:id`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Retrieve a single tag by its ID.

**URL Parameters:**
- `id` (number): Tag ID

**Response (200):**
```json
{
  "data": {
    "tag_id": 1,
    "tag_name": "Frontend",
    "tag_value": "frontend",
    "tag_type": "skill",
    "is_active": true,
    "created_by": 1,
    "created_at": "2025-10-18T10:00:00Z",
    "updated_at": "2025-10-18T10:00:00Z"
  },
  "message": "Tag fetched successfully"
}
```

---

### 4. Get Tags by Type
**GET** `/tags/type/:type`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Retrieve all tags of a specific type.

**URL Parameters:**
- `type` (string): Tag type (e.g., "skill", "category", "technology")

**Response (200):**
```json
{
  "data": [
    {
      "tag_id": 1,
      "tag_name": "Frontend",
      "tag_value": "frontend",
      "tag_type": "skill",
      "is_active": true,
      "created_at": "2025-10-18T10:00:00Z"
    },
    {
      "tag_id": 2,
      "tag_name": "Backend",
      "tag_value": "backend",
      "tag_type": "skill",
      "is_active": true,
      "created_at": "2025-10-18T10:05:00Z"
    }
  ],
  "message": "Tags of type 'skill' fetched successfully"
}
```

---

### 5. Update Tag
**PUT** `/tags/:id`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Update an existing tag's information.

**URL Parameters:**
- `id` (number): Tag ID to update

**Request Body:**
```json
{
  "tag_name": "Advanced Frontend",
  "tag_value": "advanced-frontend",
  "tag_type": "skill",
  "is_active": true,
  "updated_by": 1
}
```

**Response (200):**
```json
{
  "data": {
    "tag_id": 1,
    "tag_name": "Advanced Frontend",
    "tag_value": "advanced-frontend",
    "tag_type": "skill",
    "is_active": true,
    "updated_by": 1,
    "updated_at": "2025-10-18T10:30:00Z"
  },
  "message": "Tag updated successfully"
}
```

---

### 6. Soft Delete Tag
**DELETE** `/tags/:id`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Soft delete a tag (marks as deleted but keeps in database).

**URL Parameters:**
- `id` (number): Tag ID to delete

**Request Body:**
```json
{
  "deleted_by": 1
}
```

**Response (200):**
```json
{
  "data": {
    "tag_id": 1,
    "is_deleted": true,
    "deleted_by": 1,
    "deleted_at": "2025-10-18T10:30:00Z"
  },
  "message": "Tag deleted successfully"
}
```

---

## Data Models

### Tag Object
```json
{
  "tag_id": "number",
  "tag_name": "string (required)",
  "tag_value": "string (required)",
  "tag_type": "string (required)",
  "is_active": "boolean (optional)",
  "is_deleted": "boolean (optional)",
  "created_by": "number (required)",
  "updated_by": "number (optional)",
  "deleted_by": "number (optional)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "deleted_at": "datetime"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Tag not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Notes
- All tags support soft deletion (marked as deleted but not removed from database)
- Tags are restricted to ADMIN and SUPER_ADMIN roles only
- Tags can be filtered by type using the `type/:type` endpoint
- The `tag_value` field is typically used for URL-friendly identifiers or slugs
- The `tag_type` field allows categorization of tags (e.g., "skill", "category", "technology")</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/TAGS_API_FRONTEND_GUIDE.md