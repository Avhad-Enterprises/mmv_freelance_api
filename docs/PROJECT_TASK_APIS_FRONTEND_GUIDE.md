# Project Task APIs Documentation

## Overview
The Project Task APIs provide comprehensive functionality for managing freelance projects in the MMV platform. These APIs handle project creation, updates, status management, and various analytics for clients, freelancers, and administrators.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All APIs except public listings require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Project Status Values
- `0`: Pending (default)
- `1`: Assigned
- `2`: Completed

---

## 1. Create Project Task

**Endpoint:** `POST /projectsTask/insertprojects_task`

**Required Roles:** `CLIENT`, `ADMIN`, `SUPER_ADMIN`

**Description:** Creates a new project task.

**Request Body:**
```json
{
  "client_id": 1,
  "project_title": "Video Editing Project",
  "project_category": "Video Editing",
  "deadline": "2024-12-31",
  "project_description": "Professional video editing services needed",
  "budget": 5000.00,
  "tags": ["video", "editing", "professional"],
  "skills_required": ["Adobe Premiere", "After Effects"],
  "reference_links": ["https://example.com/reference1"],
  "additional_notes": "Please deliver high quality work",
  "projects_type": "Video Editing",
  "project_format": "MP4",
  "audio_voiceover": "English",
  "audio_description": "Narration needed",
  "video_length": 300,
  "preferred_video_style": "Professional",
  "url": "unique-project-url",
  "meta_title": "Video Editing Project",
  "meta_description": "Professional video editing services",
  "is_active": 1,
  "created_by": 22
}
```

**Response (201):**
```json
{
  "data": {
    "projects_task_id": 26,
    "client_id": 1,
    "project_title": "Video Editing Project",
    // ... all project fields
  },
  "message": "Inserted"
}
```

---

## 2. Get Project Task by ID

**Endpoint:** `GET /projectsTask/getprojects_taskbyid/:id`

**Required Roles:** `CLIENT`, `VIDEOGRAPHER`, `VIDEO_EDITOR`, `ADMIN`, `SUPER_ADMIN`

**Description:** Retrieves a specific project task by its ID.

**Path Parameters:**
- `id` (number): Project task ID

**Response (200):**
```json
{
  "projects": {
    "projects_task_id": 26,
    "client_id": 1,
    "project_title": "Video Editing Project",
    "status": 0,
    "deadline": "2024-12-31T00:00:00.000Z",
    // ... all project fields
  },
  "success": true
}
```

**Error Responses:**
- `400`: Invalid ID format
- `404`: Project not found

---

## 3. Update Project Task

**Endpoint:** `PUT /projectsTask/updateprojects_taskbyid`

**Required Roles:** `CLIENT`, `ADMIN`, `SUPER_ADMIN`

**Description:** Updates an existing project task.

**Request Body:**
```json
{
  "projects_task_id": 26,
  "project_title": "Updated Video Editing Project",
  "budget": 6000.00,
  "additional_notes": "Updated requirements"
}
```

**Response (200):**
```json
{
  "message": "Project task updated successfully"
}
```

---

## 4. Delete Project Task

**Endpoint:** `DELETE /projectsTask/delete/:id`

**Required Roles:** `CLIENT`, `ADMIN`, `SUPER_ADMIN`

**Description:** Soft deletes a project task.

**Path Parameters:**
- `id` (number): Project task ID

**Response (200):**
```json
{
  "message": "Project task deleted successfully"
}
```

---

## 5. Get All Project Tasks

**Endpoint:** `GET /projectsTask/getallprojects_task`

**Required Roles:** `CLIENT`, `VIDEOGRAPHER`, `VIDEO_EDITOR`, `ADMIN`, `SUPER_ADMIN`

**Description:** Retrieves all project tasks for the authenticated user based on their role.

**Response (200):**
```json
{
  "projects": [
    {
      "projects_task_id": 26,
      "project_title": "Video Editing Project",
      "status": 0,
      // ... project fields
    }
  ],
  "success": true
}
```

---

## 6. Get Project Task by URL

**Endpoint:** `GET /projectsTask/getprojectstaskbyurl/:url`

**Required Roles:** `CLIENT`, `VIDEOGRAPHER`, `VIDEO_EDITOR`, `ADMIN`, `SUPER_ADMIN`

**Description:** Retrieves a project task by its unique URL slug.

**Path Parameters:**
- `url` (string): Project URL slug

**Response (200):**
```json
{
  "projects": {
    "projects_task_id": 26,
    "url": "video-editing-project",
    // ... project fields
  },
  "success": true
}
```

---

## 7. Get Projects by Client

**Endpoint:** `GET /projectsTask/client/:client_id`

**Required Roles:** `CLIENT`, `ADMIN`, `SUPER_ADMIN`

**Description:** Retrieves all projects for a specific client.

**Path Parameters:**
- `client_id` (number): Client ID

**Response (200):**
```json
{
  "projects": [
    {
      "projects_task_id": 26,
      "client_id": 1,
      // ... project fields
    }
  ],
  "success": true
}
```

---

## 8. Update Project Status

**Endpoint:** `PATCH /projectsTask/updatestatus`

**Required Roles:** `CLIENT`, `VIDEOGRAPHER`, `VIDEO_EDITOR`

**Description:** Updates the status of a project task.

**Request Body:**
```json
{
  "projects_task_id": 26,
  "status": 1
}
```

**Response (200):**
```json
{
  "message": "Project status updated successfully"
}
```

---

## 9. Get Tasks with Client Info

**Endpoint:** `GET /projectsTask/tasks-with-client`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Description:** Retrieves all tasks with associated client information.

**Response (200):**
```json
{
  "tasks": [
    {
      "projects_task_id": 26,
      "client_info": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "client@example.com"
      },
      // ... project fields
    }
  ]
}
```

---

## 10. Get Task with Client Info by ID

**Endpoint:** `GET /projectsTask/tasks-with-client/:id`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Description:** Retrieves a specific task with client information.

**Path Parameters:**
- `id` (number): Project task ID

---

## 11. Search Tasks

**Endpoint:** `POST /projectsTask/gettaskby`

**Required Roles:** `CLIENT`, `VIDEOGRAPHER`, `VIDEO_EDITOR`, `ADMIN`, `SUPER_ADMIN`

**Description:** Advanced search and filtering for project tasks.

**Request Body:**
```json
{
  "status": "active",
  "limit": 10,
  "offset": 0,
  "category": "Video Editing"
}
```

**Response (200):**
```json
{
  "projects": [
    {
      "projects_task_id": 26,
      // ... project fields
    }
  ],
  "total": 25,
  "success": true
}
```

---

## 12. Get All Project Listings (Authenticated)

**Endpoint:** `GET /projectsTask/getallprojectlisting`

**Required Roles:** None (but authentication required)

**Description:** Retrieves all active project listings for browsing.

**Response (200):**
```json
{
  "projects": [
    {
      "projects_task_id": 26,
      "project_title": "Video Editing Project",
      "budget": 5000.00,
      "skills_required": ["Adobe Premiere"],
      // ... project fields
    }
  ]
}
```

---

## 13. Get Public Project Listings

**Endpoint:** `GET /projectsTask/getallprojectlisting-public`

**Required Roles:** None

**Description:** Public endpoint for browsing active projects without authentication.

**Response (200):**
```json
{
  "projects": [
    {
      "projects_task_id": 26,
      "project_title": "Video Editing Project",
      "budget": 5000.00,
      "skills_required": ["Adobe Premiere"],
      // ... limited project fields
    }
  ]
}
```

---

## Analytics & Count APIs

### 14. Count Active Projects

**Endpoint:** `GET /projectsTask/countactiveprojects_task`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "count": 15
}
```

### 15. Count All Projects

**Endpoint:** `GET /projectsTask/countbyprojects_task`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "count": 150
}
```

### 16. Count Projects by Editor

**Endpoint:** `GET /projectsTask/count/editor/:editor_id`

**Required Roles:** `VIDEO_EDITOR`, `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "count": 8
}
```

### 17. Count Projects by Client

**Endpoint:** `GET /projectsTask/count/client/:client_id`

**Required Roles:** `CLIENT`, `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "count": 12
}
```

### 18. Count Active Clients

**Endpoint:** `GET /projectsTask/count/active-clients`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "count": 25
}
```

### 19. Count Active Editors

**Endpoint:** `GET /projectsTask/count/active-editors`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "count": 18
}
```

### 20. Count Completed Projects

**Endpoint:** `GET /projectsTask/completed-projects-count`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "count": 45
}
```

---

## Admin-Only APIs

### 21. Get Active and Deleted Projects

**Endpoint:** `GET /projectsTask/getactivedeletedprojects_task`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "projects": [
    {
      "projects_task_id": 26,
      "is_deleted": false,
      // ... project fields
    }
  ]
}
```

### 22. Get Deleted Projects Only

**Endpoint:** `GET /projectsTask/getDeletedprojects_task`

**Required Roles:** `ADMIN`, `SUPER_ADMIN`

**Response (200):**
```json
{
  "projects": [
    {
      "projects_task_id": 27,
      "is_deleted": true,
      "deleted_at": "2024-01-15T10:30:00.000Z",
      // ... project fields
    }
  ]
}
```

---

## Error Responses

All APIs may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "message": "Authentication token missing"
}
```

**403 Forbidden:**
```json
{
  "message": "Access denied. Required role: CLIENT or ADMIN"
}
```

**404 Not Found:**
```json
{
  "error": "projects_task not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```

---

## Data Types & Validation

### Required Fields for Project Creation:
- `client_id` (number)
- `project_title` (string)
- `project_category` (string)
- `deadline` (date string)
- `project_description` (string)
- `budget` (number)
- `skills_required` (array of strings)
- `reference_links` (array of strings)
- `additional_notes` (string)
- `projects_type` (string)
- `project_format` (string)
- `audio_voiceover` (string)
- `audio_description` (string)
- `video_length` (number)
- `preferred_video_style` (string)
- `url` (string, unique)
- `meta_title` (string)
- `meta_description` (string)
- `is_active` (number)
- `created_by` (number)

### Optional Fields:
- `editor_id` (number)
- `tags` (JSON array)
- `sample_project_file` (string)
- `project_files` (JSON array)
- `show_all_files` (JSON array)
- `assigned_at` (date string)
- `completed_at` (date string)
- `application_count` (number)
- `shortlisted_freelancer_ids` (array of numbers)

---

## Rate Limiting

All authenticated endpoints are subject to rate limiting. Public endpoints have higher limits.

## Notes for Frontend Developers

1. **URL Uniqueness:** Ensure project URLs are unique across the platform
2. **Date Formats:** Use ISO 8601 format for all date fields
3. **File Uploads:** Some fields may reference uploaded files - handle file uploads separately
4. **Status Updates:** Only project participants (client, assigned editor) can update status
5. **Soft Deletes:** Deleted projects are marked `is_deleted: true` but remain in database
6. **Role-Based Access:** Different endpoints require different user roles
7. **JSON Fields:** Fields like `tags`, `skills_required`, `reference_links` are stored as JSON

---

*Last Updated: October 10, 2025*
*API Version: v1*</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/PROJECT_TASK_APIS_FRONTEND_GUIDE.md