# Skills API Documentation

## Overview
Skills management endpoints for creating, reading, updating, and soft deleting skills. Skills are used to categorize and organize freelancer capabilities and expertise areas.

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

### 1. Create Skill
**POST** `/skills`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Create a new skill in the system.

**Request Body:**
```json
{
  "skill_name": "JavaScript",
  "is_active": true,
  "created_by": 1
}
```

**Response (201):**
```json
{
  "data": {
    "skill_id": 1,
    "skill_name": "JavaScript",
    "is_active": true,
    "created_by": 1,
    "created_at": "2025-10-18T10:00:00Z",
    "updated_at": "2025-10-18T10:00:00Z"
  },
  "message": "Skill created successfully"
}
```

---

### 2. Get All Skills
**GET** `/skills`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Retrieve all active (non-deleted) skills.

**Response (200):**
```json
{
  "data": [
    {
      "skill_id": 1,
      "skill_name": "JavaScript",
      "is_active": true,
      "created_at": "2025-10-18T10:00:00Z"
    },
    {
      "skill_id": 2,
      "skill_name": "Python",
      "is_active": true,
      "created_at": "2025-10-18T10:05:00Z"
    }
  ],
  "message": "Skills fetched successfully"
}
```

---

### 3. Get Skill by ID
**GET** `/skills/:id`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Retrieve a single skill by its ID.

**URL Parameters:**
- `id` (number): Skill ID

**Response (200):**
```json
{
  "data": {
    "skill_id": 1,
    "skill_name": "JavaScript",
    "is_active": true,
    "created_by": 1,
    "created_at": "2025-10-18T10:00:00Z",
    "updated_at": "2025-10-18T10:00:00Z"
  },
  "message": "Skill fetched successfully"
}
```

---

### 4. Update Skill
**PUT** `/skills/:id`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Update an existing skill's information.

**URL Parameters:**
- `id` (number): Skill ID to update

**Request Body:**
```json
{
  "skill_name": "Advanced JavaScript",
  "is_active": true,
  "updated_by": 1
}
```

**Response (200):**
```json
{
  "data": {
    "skill_id": 1,
    "skill_name": "Advanced JavaScript",
    "is_active": true,
    "updated_by": 1,
    "updated_at": "2025-10-18T10:30:00Z"
  },
  "message": "Skill updated successfully"
}
```

---

### 5. Soft Delete Skill
**DELETE** `/skills/:id`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Soft delete a skill (marks as deleted but keeps in database).

**URL Parameters:**
- `id` (number): Skill ID to delete

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
    "skill_id": 1,
    "is_deleted": true,
    "deleted_by": 1,
    "deleted_at": "2025-10-18T10:30:00Z"
  },
  "message": "Skill deleted successfully"
}
```

---

## Data Models

### Skill Object
```json
{
  "skill_id": "number",
  "skill_name": "string (required)",
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
  "message": "Skill not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Notes
- All skills support soft deletion (marked as deleted but not removed from database)
- Skills are restricted to ADMIN and SUPER_ADMIN roles only
- The `skill_name` field must be unique and non-empty
- Skills can be activated/deactivated using the `is_active` field</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/SKILLS_API_FRONTEND_GUIDE.md