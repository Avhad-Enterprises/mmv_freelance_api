# Project Task APIs

This document provides a concise overview of all Project Task APIs for frontend integration.

## Base URL
`/projectsTask`

## Authentication
All endpoints require authentication via JWT token in Authorization header.
Role-based access control is enforced using `requireRole` middleware.

## CRUD Operations for Clients

### 1. Create Project
**Endpoint:** `POST /projectsTask/insertprojects_task`  
**Roles:** CLIENT, ADMIN, SUPER_ADMIN  
**Request Body:**
```json
{
  "client_id": 1,
  "title": "Project Title",
  "description": "Project description",
  "url": "unique-project-url",
  "deadline": "2025-12-31",
  "budget": 1000,
  "skills_required": ["skill1", "skill2"],
  "reference_links": ["link1", "link2"],
  "sample_project_file": ["file1"],
  "project_files": ["file2"],
  "show_all_files": ["file3"],
  "status": 0,
  "is_active": 1
}
```
**Response:**
```json
{
  "data": { /* created project object */ },
  "message": "Inserted"
}
```

### 2. Get Project by ID
**Endpoint:** `GET /projectsTask/getprojects_taskbyid/:id`  
**Roles:** CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "projects": { /* project object */ },
  "success": true
}
```

### 3. Get All Projects for Client
**Endpoint:** `GET /projectsTask/client/:client_id`  
**Roles:** CLIENT, ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "data": [ /* array of project objects */ ],
  "success": true
}
```

### 4. Update Project
**Endpoint:** `PUT /projectsTask/updateprojects_taskbyid`  
**Roles:** CLIENT, ADMIN, SUPER_ADMIN  
**Request Body:**
```json
{
  "projects_task_id": 1,
  "title": "Updated Title",
  // ... other fields to update
}
```
**Response:**
```json
{
  "data": { /* updated project object */ },
  "message": "projects_task updated"
}
```

### 5. Delete Project
**Endpoint:** `DELETE /projectsTask/delete/:id`  
**Roles:** CLIENT, ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "data": { /* deleted project object */ },
  "message": "projects_task deleted successfully"
}
```

## Additional Client APIs

### Get Project by URL
**Endpoint:** `GET /projectsTask/getprojectstaskbyurl/:url`  
**Roles:** CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "data": { /* project object */ }
}
```

### Get Project Count for Client
**Endpoint:** `GET /projectsTask/count/client/:client_id`  
**Roles:** CLIENT, ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "success": true,
  "client_id": 1,
  "projects_count": 5
}
```

### Update Project Status
**Endpoint:** `PATCH /projectsTask/updatestatus`  
**Roles:** CLIENT, VIDEOGRAPHER, VIDEO_EDITOR  
**Request Body:**
```json
{
  "projects_task_id": 1,
  "status": 1,
  "user_id": 1
}
```
**Response:**
```json
{
  "data": { /* updated project */ },
  "message": "Project task status updated successfully"
}
```

## Admin-Only APIs

### Get All Projects
**Endpoint:** `GET /projectsTask/getallprojects_task`  
**Roles:** CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "data": [ /* array of all projects with client/editor info */ ],
  "success": true
}
```

### Get Active Projects Count
**Endpoint:** `GET /projectsTask/countactiveprojects_task`  
**Roles:** ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "count": 10
}
```

### Get Completed Projects Count
**Endpoint:** `GET /projectsTask/completed-projects-count`  
**Roles:** ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "count": 5,
  "message": "Completed projects count fetched successfully"
}
```

### Get Active Clients Count
**Endpoint:** `GET /projectsTask/count/active-clients`  
**Roles:** ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "success": true,
  "active_clients_count": 20
}
```

### Get Active Editors Count
**Endpoint:** `GET /projectsTask/count/active-editors`  
**Roles:** ADMIN, SUPER_ADMIN  
**Response:**
```json
{
  "success": true,
  "active_editors_count": 15
}
```

## Public APIs

### Get All Project Listings (Public)
**Endpoint:** `GET /projectsTask/getallprojectlisting-public`  
**No Authentication Required**  
**Response:**
```json
{
  "data": [ /* array of active projects */ ],
  "success": true
}
```

## Error Responses
All endpoints may return standard HTTP error codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Notes
- All project operations are soft deletes (`is_deleted: true`)
- URLs must be unique across all projects
- Status values: 0=pending, 1=assigned, 2=completed, etc.
- JSON fields (skills_required, reference_links, etc.) are stored as strings in database
- Timestamps are in ISO format