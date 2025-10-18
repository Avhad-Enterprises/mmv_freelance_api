# Category API Documentation

## Overview
Category management endpoints for creating, reading, updating, and soft deleting categories. Categories are used to organize and classify content throughout the application.

## Base URL
```
/api/v1
```

## Authentication
All endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Create Category
**POST** `/category/insertcategory`

**Required Roles:** All authenticated users

**Description:** Create a new category in the system.

**Request Body:**
```json
{
  "name": "Technology",
  "value": "tech",
  "slug": "technology",
  "tags": ["programming", "software"],
  "notes": ["Tech-related content"],
  "is_active": true,
  "created_by": 1
}
```

**Response (201):**
```json
{
  "data": {
    "category_id": 1,
    "name": "Technology",
    "value": "tech",
    "slug": "technology",
    "tags": ["programming", "software"],
    "notes": ["Tech-related content"],
    "is_active": true,
    "created_by": 1,
    "created_at": "2025-10-18T10:00:00Z",
    "updated_at": "2025-10-18T10:00:00Z"
  },
  "message": "Inserted"
}
```

---

### 2. Get All Categories
**GET** `/category/getallcategorys`

**Required Roles:** All authenticated users

**Description:** Retrieve all active (non-deleted) categories.

**Response (200):**
```json
{
  "data": [
    {
      "category_id": 1,
      "name": "Technology",
      "value": "tech",
      "slug": "technology",
      "tags": ["programming", "software"],
      "is_active": true,
      "created_at": "2025-10-18T10:00:00Z"
    }
  ],
  "success": true
}
```

---

### 3. Get Categories by Type
**GET** `/category/getcategorytypes`

**Required Roles:** All authenticated users

**Description:** Get categories filtered by a specific type.

**Request Body:**
```json
{
  "type": "active"
}
```

**Response (200):**
```json
{
  "data": [
    {
      "category_id": 1,
      "name": "Technology",
      "value": "tech",
      "slug": "technology",
      "is_active": true
    }
  ],
  "success": true
}
```

---

### 4. Get Category by ID
**GET** `/category/editcategory/:id`

**Required Roles:** All authenticated users

**Description:** Retrieve a single category by its ID for editing purposes.

**URL Parameters:**
- `id` (number): Category ID

**Response (200):**
```json
{
  "data": {
    "category_id": 1,
    "name": "Technology",
    "value": "tech",
    "slug": "technology",
    "tags": ["programming", "software"],
    "notes": ["Tech-related content"],
    "is_active": true,
    "created_by": 1,
    "created_at": "2025-10-18T10:00:00Z"
  },
  "message": "Category fetched"
}
```

---

### 5. Update Category
**PUT** `/category/updatecategory`

**Required Roles:** All authenticated users

**Description:** Update an existing category's information.

**Request Body:**
```json
{
  "category_id": 1,
  "name": "Updated Technology",
  "value": "tech-updated",
  "slug": "technology-updated",
  "tags": ["programming", "software", "updated"],
  "notes": ["Updated tech content"],
  "is_active": true,
  "updated_by": 1
}
```

**Response (200):**
```json
{
  "data": {
    "category_id": 1,
    "name": "Updated Technology",
    "value": "tech-updated",
    "slug": "technology-updated",
    "tags": ["programming", "software", "updated"],
    "is_active": true,
    "updated_at": "2025-10-18T10:30:00Z"
  },
  "message": "Category updated"
}
```

---

### 6. Soft Delete Category
**POST** `/category/deletecategory`

**Required Roles:** All authenticated users

**Description:** Soft delete a category (marks as deleted but keeps in database).

**Request Body:**
```json
{
  "category_id": 1,
  "is_deleted": true,
  "updated_by": 1
}
```

**Response (200):**
```json
{
  "data": {
    "category_id": 1,
    "is_deleted": true,
    "updated_at": "2025-10-18T10:30:00Z"
  },
  "message": "category deleted"
}
```

---

## Data Models

### Category Object
```json
{
  "category_id": "number",
  "name": "string (required)",
  "value": "string (required)",
  "slug": "string (required)",
  "tags": "string[] (optional)",
  "notes": "string[] (optional)",
  "is_active": "boolean (optional)",
  "is_deleted": "boolean (optional)",
  "created_by": "number (optional)",
  "updated_by": "number (optional)",
  "created_at": "datetime",
  "updated_at": "datetime"
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

### 404 Not Found
```json
{
  "message": "Category not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Notes
- All categories support soft deletion (marked as deleted but not removed from database)
- Categories can be filtered by type using the `getcategorytypes` endpoint
- The `slug` field is used for URL-friendly identifiers
- `tags` and `notes` are optional arrays for additional categorization and information</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/CATEGORY_API_FRONTEND_GUIDE.md