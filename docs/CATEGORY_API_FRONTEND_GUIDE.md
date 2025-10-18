# Category API - Frontend Developer Guide

Complete API documentation for the Category management system with RESTful endpoints.

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Common Use Cases](#common-use-cases)

---

## Overview

The Category API provides endpoints for managing categories used throughout the application to organize and classify content. Categories support hierarchical organization with tags, notes, and active/inactive states.

**Base URL**: `/api/v1/categories`

---

## Authentication

Most endpoints require JWT authentication via Bearer token.

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

### Role-Based Access Control

Currently, all authenticated users can access category endpoints. Future updates may restrict certain operations to specific roles.

---

## API Endpoints

### 1. Get All Categories
Retrieve all active (non-deleted) categories.

**Endpoint**: `GET /api/v1/categories`

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "data": [
    {
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
    {
      "category_id": 2,
      "name": "Design",
      "value": "design",
      "slug": "design",
      "tags": ["ui", "ux", "graphics"],
      "is_active": true,
      "created_at": "2025-10-18T11:00:00Z"
    }
  ],
  "success": true
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid authentication token

---

### 2. Create Category
Create a new category in the system.

**Endpoint**: `POST /api/v1/categories`

**Authentication**: Required

**Request Body**:
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

**Required Fields**:
- `name` (string) - Display name of the category
- `value` (string) - Unique value identifier
- `slug` (string) - URL-friendly slug

**Optional Fields**:
- `tags` (array of strings) - Associated tags
- `notes` (array of strings) - Additional notes
- `is_active` (boolean) - Active status (default: true)
- `created_by` (number) - User ID who created the category

**Response**: `201 Created`
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

**Error Responses**:
- `400 Bad Request` - Validation error (missing required fields)
- `401 Unauthorized` - Missing authentication

---

### 3. Get Categories by Type
Get categories filtered by a specific type value.

**Endpoint**: `GET /api/v1/categories/by-type`

**Authentication**: Required

**Query Parameters**:
- `type` (required) - Type value to filter by

**Example Request**:
```
GET /api/v1/categories/by-type?type=tech
```

**Alternative** (body parameter for backward compatibility):
```json
{
  "type": "tech"
}
```

**Response**: `200 OK`
```json
{
  "data": [
    {
      "category_id": 1,
      "name": "Technology",
      "value": "tech",
      "slug": "technology",
      "is_active": true,
      "tags": ["programming", "software"]
    }
  ],
  "success": true
}
```

**Error Responses**:
- `400 Bad Request` - Missing type parameter
- `401 Unauthorized` - Missing authentication

---

### 4. Get Category by ID
Retrieve a single category by its ID.

**Endpoint**: `GET /api/v1/categories/:id`

**Authentication**: Required

**URL Parameters**:
- `id` (required) - Category ID

**Example Request**:
```
GET /api/v1/categories/1
```

**Response**: `200 OK`
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
  "message": "Category fetched"
}
```

**Error Responses**:
- `404 Not Found` - Category doesn't exist
- `401 Unauthorized` - Missing authentication

---

### 5. Update Category
Update an existing category's information.

**Endpoint**: `PUT /api/v1/categories/:id`

**Authentication**: Required

**URL Parameters**:
- `id` (required) - Category ID

**Request Body** (all fields optional except those you want to update):
```json
{
  "name": "Updated Technology",
  "value": "tech-updated",
  "slug": "technology-updated",
  "tags": ["programming", "software", "updated"],
  "notes": ["Updated tech content"],
  "is_active": true,
  "updated_by": 1
}
```

**Example Request**:
```
PUT /api/v1/categories/1
```

**Response**: `200 OK`
```json
{
  "data": {
    "category_id": 1,
    "name": "Updated Technology",
    "value": "tech-updated",
    "slug": "technology-updated",
    "tags": ["programming", "software", "updated"],
    "notes": ["Updated tech content"],
    "is_active": true,
    "updated_by": 1,
    "updated_at": "2025-10-18T10:30:00Z"
  },
  "message": "Category updated"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid category ID
- `404 Not Found` - Category doesn't exist
- `401 Unauthorized` - Missing authentication

---

### 6. Delete Category
Soft delete a category (marks as deleted but keeps in database).

**Endpoint**: `DELETE /api/v1/categories/:id`

**Authentication**: Required

**URL Parameters**:
- `id` (required) - Category ID

**Request Body** (optional):
```json
{
  "is_deleted": true,
  "deleted_by": 1
}
```

**Example Request**:
```
DELETE /api/v1/categories/1
```

**Response**: `200 OK`
```json
{
  "data": {
    "category_id": 1,
    "name": "Technology",
    "is_deleted": true,
    "deleted_by": 1,
    "deleted_at": "2025-10-18T11:00:00Z"
  },
  "message": "category deleted"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid category ID
- `404 Not Found` - Category doesn't exist
- `401 Unauthorized` - Missing authentication

---

## Data Models

### Category Object
```typescript
{
  category_id: number;              // Primary key
  name: string;                     // Display name
  value: string;                    // Unique value identifier
  slug: string;                     // URL-friendly slug
  tags?: string[];                  // Associated tags (optional)
  notes?: string[];                 // Additional notes (optional)
  is_active: boolean;               // Active status (default: true)
  created_by?: number;              // User ID who created (optional)
  created_at: string;               // ISO timestamp
  updated_by?: number;              // User ID who last updated (optional)
  updated_at: string;               // ISO timestamp
  is_deleted?: boolean;             // Soft delete flag (default: false)
  deleted_by?: number;              // User ID who deleted (optional)
  deleted_at?: string;              // Deletion timestamp (optional)
}
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "meta": {
    "timestamp": "2025-10-18T12:00:00.000Z",
    "version": "v1"
  }
}
```

Or for validation errors:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "name should not be empty"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Category doesn't exist |
| 500 | Internal Server Error | Server-side error |

---

## Common Use Cases

### 1. List All Available Categories

```javascript
const getAllCategories = async () => {
  const response = await fetch('/api/v1/categories', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data; // Array of categories
};
```

### 2. Create a New Category

```javascript
const createCategory = async (categoryData) => {
  const response = await fetch('/api/v1/categories', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "Video Production",
      value: "video-production",
      slug: "video-production",
      tags: ["video", "editing", "production"],
      notes: ["For video-related projects"],
      is_active: true,
      created_by: userId
    })
  });
  
  return await response.json();
};
```

### 3. Get Category by ID

```javascript
const getCategoryById = async (categoryId) => {
  const response = await fetch(`/api/v1/categories/${categoryId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### 4. Filter Categories by Type

```javascript
const getCategoriesByType = async (type) => {
  const response = await fetch(`/api/v1/categories/by-type?type=${type}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### 5. Update a Category

```javascript
const updateCategory = async (categoryId, updates) => {
  const response = await fetch(`/api/v1/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "Updated Category Name",
      is_active: true,
      updated_by: userId,
      ...updates
    })
  });
  
  return await response.json();
};
```

### 6. Delete a Category

```javascript
const deleteCategory = async (categoryId, userId) => {
  const response = await fetch(`/api/v1/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      is_deleted: true,
      deleted_by: userId
    })
  });
  
  return await response.json();
};
```

---

## Route Migration Guide

### Old Routes → New Routes

| Old Route | New Route | Method | Notes |
|-----------|-----------|--------|-------|
| `/category/insertcategory` | `/categories` | POST | RESTful naming |
| `/category/getallcategorys` | `/categories` | GET | RESTful naming |
| `/category/getcategorytypes` | `/categories/by-type?type=X` | GET | Query parameter support |
| `/category/editcategory/:id` | `/categories/:id` | GET | RESTful naming |
| `/category/updatecategory` | `/categories/:id` | PUT | ID in URL, RESTful |
| `/category/deletecategory` | `/categories/:id` | DELETE | ID in URL, RESTful |

**Important**: The old routes are deprecated. Please update your frontend to use the new RESTful endpoints.

---

## Notes for Frontend Developers

### Important Considerations

1. **Route Changes**: All endpoints now use plural `/categories` instead of singular `/category`

2. **RESTful Design**: 
   - Use `GET /categories` to list all
   - Use `POST /categories` to create
   - Use `GET /categories/:id` to get one
   - Use `PUT /categories/:id` to update
   - Use `DELETE /categories/:id` to delete

3. **URL Parameters**: Update and delete operations now use `:id` in the URL path instead of body

4. **Query Parameters**: The "by-type" endpoint now supports query parameters (`?type=value`) in addition to body parameters

5. **Backward Compatibility**: Controllers support both old (body-based) and new (URL-based) ID passing for a smoother transition

6. **Soft Deletes**: Deleted categories are marked with `is_deleted: true` but remain in the database

7. **Unique Fields**: The `slug` and `value` fields should be unique across all categories

8. **Tags and Notes**: These are arrays and should be sent as JSON arrays

---

## Testing

To test the API endpoints, you can use the following tools:
- Postman
- curl
- fetch API
- axios

Example curl command:
```bash
# Get all categories
curl -X GET \
  http://localhost:3000/api/v1/categories \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Create category
curl -X POST \
  http://localhost:3000/api/v1/categories \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Technology",
    "value": "tech",
    "slug": "technology",
    "is_active": true
  }'

# Update category
curl -X PUT \
  http://localhost:3000/api/v1/categories/1 \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Updated Tech"
  }'

# Delete category
curl -X DELETE \
  http://localhost:3000/api/v1/categories/1 \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## Support

For questions or issues:
- Review the controller implementation: `src/features/category/category.controller.ts`
- Check the service layer: `src/features/category/category.service.ts`
- Contact the backend team for clarifications

---

**Last Updated**: October 19, 2025  
**API Version**: v1  
**Breaking Changes**: Route structure updated to RESTful standards
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