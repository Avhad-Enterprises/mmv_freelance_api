# Project Task API - Frontend Developer Guide

Complete API documentation for the Project Task management system. This guide covers all endpoints, request/response formats, authentication requirements, and usage examples.

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Status Codes](#status-codes)
4. [API Endpoints](#api-endpoints)
   - [Public Endpoints](#public-endpoints)
   - [Project CRUD Operations](#project-crud-operations)
   - [Project Analytics](#project-analytics)
   - [Project Submission & Approval](#project-submission--approval)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Common Use Cases](#common-use-cases)

---

## Overview

The Project Task API manages the entire lifecycle of video editing/production projects, including:
- Project creation and management by clients
- Project discovery and application by freelancers
- Project submission and approval workflow
- Analytics and reporting for admins
- Status tracking and updates

**Base URL**: `/api/v1/projects-tasks`

---

## Authentication

All endpoints (except public listings) require JWT authentication via Bearer token.

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **CLIENT** | Create, update, delete own projects; approve submissions |
| **VIDEOGRAPHER** | View projects, submit work, update status |
| **VIDEO_EDITOR** | View projects, submit work, update status |
| **ADMIN** | Full access to all operations |
| **SUPER_ADMIN** | Full access to all operations + analytics |

---

## Status Codes

### Project Task Status
- `0` - Pending (newly created, awaiting assignment)
- `1` - Assigned (freelancer assigned to project)
- `2` - Completed (project finished)

### Submission Status
- `0` - Submitted (pending review)
- `1` - Approved (client approved the work)
- `2` - Rejected (client rejected the work)

---

## API Endpoints

### Public Endpoints

#### 1. Get Public Project Listings
Retrieve all active projects available for freelancers to browse (no authentication required).

**Endpoint**: `GET /api/v1/projects-tasks/listings`

**Authentication**: None required

**Response**: `200 OK`
```json
{
  "data": [
    {
      "projects_task_id": 1,
      "project_title": "Corporate Video Editing",
      "project_category": "Video Editing",
      "deadline": "2024-12-31",
      "project_description": "Need professional video editing for corporate presentation",
      "budget": 5000.00,
      "tags": ["corporate", "professional", "presentation"],
      "skills_required": ["Adobe Premiere", "After Effects"],
      "reference_links": ["https://example.com/reference"],
      "additional_notes": "Quick turnaround needed",
      "status": 0,
      "projects_type": "Video Editing",
      "project_format": "MP4",
      "audio_voiceover": "English",
      "audio_description": "Professional narration",
      "video_length": 300,
      "preferred_video_style": "Corporate",
      "url": "corporate-video-editing-2024",
      "meta_title": "Corporate Video Editing Job",
      "meta_description": "Professional video editing opportunity",
      "is_active": true,
      "created_at": "2024-10-18T12:00:00.000Z",
      "application_count": 5
    }
  ],
  "success": true
}
```

---

### Project CRUD Operations

#### 2. Create New Project
Create a new project task (clients only).

**Endpoint**: `POST /api/v1/projects-tasks`

**Authentication**: Required (CLIENT, ADMIN, SUPER_ADMIN)

**Request Body**:
```json
{
  "client_id": 2,
  "project_title": "Wedding Video Editing",
  "project_category": "Video Editing",
  "deadline": "2024-12-31",
  "project_description": "Professional wedding video editing with color grading",
  "budget": 3000.00,
  "tags": "{\"tags\": [\"wedding\", \"cinematic\", \"color-grading\"]}",
  "skills_required": ["Adobe Premiere", "DaVinci Resolve"],
  "reference_links": ["https://vimeo.com/example1", "https://youtube.com/example2"],
  "additional_notes": "Need fast turnaround, 3-day delivery",
  "projects_type": "Video Editing",
  "project_format": "MP4",
  "audio_voiceover": "English",
  "audio_description": "Couple's vows and speeches",
  "video_length": 1800,
  "preferred_video_style": "Cinematic",
  "url": "wedding-video-editing-oct-2024",
  "meta_title": "Wedding Video Editing Project",
  "meta_description": "Professional wedding video editing with cinematic style",
  "is_active": 1,
  "created_by": 1
}
```

**Required Fields**:
- `client_id` (integer)
- `project_title` (string)
- `project_category` (string)
- `deadline` (ISO date string: "YYYY-MM-DD")
- `project_description` (string)
- `budget` (number)
- `skills_required` (array of strings)
- `reference_links` (array of strings)
- `additional_notes` (string)
- `projects_type` (string)
- `project_format` (string)
- `audio_voiceover` (string)
- `audio_description` (string)
- `video_length` (integer, in seconds)
- `preferred_video_style` (string)
- `url` (string, unique slug)
- `meta_title` (string)
- `meta_description` (string)
- `is_active` (integer: 0 or 1)
- `created_by` (integer, user ID)

**Optional Fields**:
- `freelancer_id` (integer)
- `tags` (JSON string)
- `status` (integer: 0, 1, or 2)
- `sample_project_file` (array)
- `project_files` (array)
- `show_all_files` (array)
- `assigned_at` (ISO date string)
- `completed_at` (ISO date string)
- `application_count` (integer)
- `shortlisted_freelancer_ids` (array of integers)

**Response**: `201 Created`
```json
{
  "data": {
    "projects_task_id": 15,
    "client_id": 2,
    "project_title": "Wedding Video Editing",
    "status": 0,
    "created_at": "2024-10-18T12:00:00.000Z",
    "is_active": true
  },
  "message": "Inserted"
}
```

**Error Responses**:
- `400 Bad Request` - Validation error (missing/invalid fields)
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't have CLIENT role

---

#### 3. Get All Projects
Retrieve all projects with optional filtering.

**Endpoint**: `GET /api/v1/projects-tasks`

**Authentication**: Required (All authenticated users)

**Query Parameters**:
- `status` (optional) - Filter by status: "0", "1", or "2"
- `client_id` (optional) - Filter by client ID
- `url` (optional) - Filter by URL slug
- `is_active` (optional) - Filter by active status: "true" or "false"
- `include` (optional) - Include related data: "client", "freelancer"

**Example Request**:
```
GET /api/v1/projects-tasks?status=0&is_active=true&include=client
```

**Response**: `200 OK`
```json
{
  "data": [
    {
      "projects_task_id": 1,
      "project_title": "Corporate Video",
      "status": 0,
      "budget": 5000.00,
      "client": {
        "client_id": 2,
        "company_name": "Tech Corp",
        "contact_email": "client@techcorp.com"
      }
    }
  ],
  "success": true
}
```

---

#### 4. Get Project by ID
Retrieve detailed information about a specific project.

**Endpoint**: `GET /api/v1/projects-tasks/:id`

**Authentication**: Required (All authenticated users)

**URL Parameters**:
- `id` (required) - Project task ID

**Query Parameters**:
- `include` (optional) - Include related data: "client", "freelancer"

**Example Request**:
```
GET /api/v1/projects-tasks/15?include=client,freelancer
```

**Response**: `200 OK`
```json
{
  "projects": {
    "projects_task_id": 15,
    "client_id": 2,
    "freelancer_id": 5,
    "project_title": "Wedding Video Editing",
    "project_category": "Video Editing",
    "deadline": "2024-12-31",
    "project_description": "Professional wedding video editing",
    "budget": 3000.00,
    "tags": ["wedding", "cinematic"],
    "skills_required": ["Adobe Premiere", "DaVinci Resolve"],
    "reference_links": ["https://vimeo.com/example"],
    "status": 1,
    "projects_type": "Video Editing",
    "project_format": "MP4",
    "video_length": 1800,
    "is_active": true,
    "created_at": "2024-10-18T12:00:00.000Z",
    "client": {
      "client_id": 2,
      "company_name": "Wedding Films Inc"
    },
    "freelancer": {
      "freelancer_id": 5,
      "first_name": "John",
      "last_name": "Doe"
    }
  },
  "success": true
}
```

**Error Responses**:
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Project doesn't exist
- `401 Unauthorized` - Missing authentication

---

#### 5. Update Project
Update an existing project (clients only, can update own projects).

**Endpoint**: `PUT /api/v1/projects-tasks/:id`

**Authentication**: Required (CLIENT, ADMIN, SUPER_ADMIN)

**URL Parameters**:
- `id` (required) - Project task ID

**Request Body** (all fields optional, only send fields to update):
```json
{
  "project_title": "Updated Title",
  "budget": 4000.00,
  "deadline": "2025-01-15",
  "status": 1,
  "freelancer_id": 5
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "projects_task_id": 15,
    "project_title": "Updated Title",
    "budget": 4000.00,
    "updated_at": "2024-10-18T14:30:00.000Z"
  },
  "message": "projects_task updated"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid ID or no update data provided
- `404 Not Found` - Project doesn't exist
- `403 Forbidden` - User doesn't own this project

---

#### 6. Delete Project
Soft delete a project (clients only, can delete own projects).

**Endpoint**: `DELETE /api/v1/projects-tasks/:id`

**Authentication**: Required (CLIENT, ADMIN, SUPER_ADMIN)

**URL Parameters**:
- `id` (required) - Project task ID

**Response**: `200 OK`
```json
{
  "data": {
    "projects_task_id": 15,
    "is_deleted": true,
    "deleted_at": "2024-10-18T15:00:00.000Z"
  },
  "message": "projects_task deleted successfully"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Project doesn't exist
- `403 Forbidden` - User doesn't own this project

---

#### 7. Update Project Status
Update the status of a project task.

**Endpoint**: `PATCH /api/v1/projects-tasks/:id/status`

**Authentication**: Required (All authenticated users with appropriate roles)

**URL Parameters**:
- `id` (required) - Project task ID

**Request Body**:
```json
{
  "status": 1,
  "user_id": 5
}
```

**Status Values**:
- `0` - Pending
- `1` - Assigned
- `2` - Completed

**Response**: `200 OK`
```json
{
  "data": {
    "projects_task_id": 15,
    "status": 1,
    "updated_at": "2024-10-18T16:00:00.000Z"
  },
  "message": "Project task status updated successfully"
}
```

**Error Responses**:
- `400 Bad Request` - Missing required fields or invalid status value
- `404 Not Found` - Project doesn't exist

---

### Project Analytics

#### 8. Get Project Counts
Get counts of projects based on various filters.

**Endpoint**: `GET /api/v1/projects-tasks/count`

**Authentication**: Required (All authenticated users)

**Query Parameters**:
- `type` (optional) - Count type: "active", "all", or "completed"
- `client_id` (optional) - Count projects for specific client
- `freelancer_id` (optional) - Count projects for specific freelancer

**Example Requests**:
```
GET /api/v1/projects-tasks/count?type=active
GET /api/v1/projects-tasks/count?client_id=2
GET /api/v1/projects-tasks/count?freelancer_id=5
GET /api/v1/projects-tasks/count?type=completed&client_id=2
```

**Response**: `200 OK`
```json
{
  "count": 15,
  "type": "active",
  "success": true
}
```

---

#### 9. Get Projects by Client ID
Retrieve all projects for a specific client.

**Endpoint**: `GET /api/v1/projects-tasks/client/:clientId`

**Authentication**: Required (All authenticated users)

**URL Parameters**:
- `clientId` (required) - Client profile ID

**Example Request**:
```
GET /api/v1/projects-tasks/client/2
```

**Response**: `200 OK`
```json
{
  "data": [
    {
      "projects_task_id": 1,
      "client_id": 2,
      "project_title": "Corporate Video",
      "status": 0,
      "budget": 5000.00,
      "created_at": "2024-10-18T12:00:00.000Z"
    }
  ],
  "success": true
}
```

**Error Responses**:
- `400 Bad Request` - Invalid client ID format
- `401 Unauthorized` - Missing authentication

---

#### 10. Get Active Clients Count
Get count of clients with active projects (admin only).

**Endpoint**: `GET /api/v1/projects-tasks/analytics/active-clients`

**Authentication**: Required (ADMIN, SUPER_ADMIN)

**Response**: `200 OK`
```json
{
  "count": 25,
  "type": "active_clients",
  "success": true
}
```

**Error Responses**:
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - User doesn't have admin role

---

#### 11. Get Active Editors Count
Get count of freelancers (video editors/videographers) with active projects (admin only).

**Endpoint**: `GET /api/v1/projects-tasks/analytics/active-editors`

**Authentication**: Required (ADMIN, SUPER_ADMIN)

**Response**: `200 OK`
```json
{
  "count": 42,
  "type": "active_editors",
  "success": true
}
```

**Error Responses**:
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - User doesn't have admin role

---

### Project Submission & Approval

#### 12. Submit Project
Submit completed work for a project (freelancers only).

**Endpoint**: `POST /api/v1/projects-tasks/:id/submit`

**Authentication**: Required (VIDEOGRAPHER, VIDEO_EDITOR)

**URL Parameters**:
- `id` (required) - Project task ID

**Request Body**:
```json
{
  "user_id": 86,
  "submitted_files": "https://dropbox.com/project-files/final-video.mp4",
  "additional_notes": "Completed as per requirements. Applied color grading and transitions."
}
```

**Required Fields**:
- `user_id` (integer) - Freelancer's user ID
- `submitted_files` (string) - URL or path to submitted files

**Optional Fields**:
- `additional_notes` (string) - Notes about the submission

**Response**: `201 Created`
```json
{
  "data": {
    "submission_id": 3,
    "projects_task_id": 15,
    "user_id": 86,
    "submitted_files": "https://dropbox.com/project-files/final-video.mp4",
    "additional_notes": "Completed as per requirements",
    "status": 0,
    "is_active": true,
    "created_at": "2024-10-18T17:00:00.000Z"
  },
  "message": "Project submitted successfully",
  "success": true
}
```

**Error Responses**:
- `400 Bad Request` - Invalid project ID or missing required fields
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - User doesn't have freelancer role
- `404 Not Found` - Project doesn't exist
- `409 Conflict` - Project already submitted by this user

---

#### 13. Approve/Reject Submission
Approve or reject a submitted project (clients only).

**Endpoint**: `PATCH /api/v1/projects-tasks/submissions/:submissionId/approve`

**Authentication**: Required (CLIENT, ADMIN, SUPER_ADMIN)

**URL Parameters**:
- `submissionId` (required) - Submission ID

**Request Body**:
```json
{
  "status": 1
}
```

**Status Values**:
- `0` - Pending (under review)
- `1` - Approved
- `2` - Rejected

**Response**: `200 OK`
```json
{
  "data": {
    "submission_id": 3,
    "projects_task_id": 15,
    "status": 1,
    "updated_at": "2024-10-18T18:00:00.000Z"
  },
  "message": "Submission status updated successfully",
  "success": true
}
```

**Error Responses**:
- `400 Bad Request` - Invalid submission ID or status value
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - User doesn't have client role
- `404 Not Found` - Submission doesn't exist

---

## Data Models

### Project Task Object
```typescript
{
  projects_task_id: number;           // Primary key
  client_id: number;                  // Foreign key to client_profiles
  freelancer_id?: number | null;      // Foreign key to freelancer_profiles
  project_title: string;
  project_category: string;
  deadline: string;                   // ISO date format
  status: number;                     // 0: pending, 1: assigned, 2: completed
  project_description: string;
  budget: number;                     // Decimal(12,2)
  tags: object | null;                // JSONB
  skills_required: string[];          // JSONB array
  reference_links: string[];          // JSONB array
  additional_notes: string;
  projects_type: string;
  project_format: string;
  audio_voiceover: string;
  audio_description: string;
  video_length: number;               // In seconds
  preferred_video_style: string;
  sample_project_file?: string | null;
  project_files?: object | null;      // JSONB
  show_all_files: object;             // JSONB array, default []
  url: string;                        // Unique slug
  meta_title: string;
  meta_description: string;
  assigned_at?: string | null;        // ISO timestamp
  completed_at?: string | null;       // ISO timestamp
  application_count: number;          // Default 0
  shortlisted_freelancer_ids?: number[] | null; // JSONB array
  is_active: boolean;                 // Default true
  created_by: number;                 // Foreign key to users
  created_at: string;                 // ISO timestamp
  updated_by?: number | null;         // Foreign key to users
  updated_at: string;                 // ISO timestamp
  is_deleted: boolean;                // Default false
  deleted_by?: number | null;         // Foreign key to users
  deleted_at?: string | null;         // ISO timestamp
}
```

### Submission Object
```typescript
{
  submission_id: number;              // Primary key
  projects_task_id: number;           // Foreign key to projects_task
  user_id: number;                    // Foreign key to users
  submitted_files: string;            // URL or path to files
  additional_notes?: string | null;
  status: number;                     // 0: submitted, 1: approved, 2: rejected
  is_active: boolean;                 // Default true
  is_deleted: boolean;                // Default false
  deleted_by?: number | null;
  deleted_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;                 // ISO timestamp
  updated_at: string;                 // ISO timestamp
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
    "timestamp": "2024-10-18T12:00:00.000Z",
    "version": "v1"
  }
}
```

Or for validation errors:

```json
{
  "error": "field_name must be a valid type"
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, missing required fields, invalid data format |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have required role/permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate submission) |
| 500 | Internal Server Error | Server-side error |

---

## Common Use Cases

### 1. Client Creates a New Project

```javascript
const createProject = async (projectData) => {
  const response = await fetch('/api/v1/projects-tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clientToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: 2,
      project_title: "Wedding Video Editing",
      project_category: "Video Editing",
      deadline: "2024-12-31",
      project_description: "Professional wedding video editing",
      budget: 3000.00,
      tags: JSON.stringify(["wedding", "cinematic"]),
      skills_required: ["Adobe Premiere", "DaVinci Resolve"],
      reference_links: ["https://vimeo.com/example"],
      additional_notes: "Need fast turnaround",
      projects_type: "Video Editing",
      project_format: "MP4",
      audio_voiceover: "English",
      audio_description: "Couple's vows",
      video_length: 1800,
      preferred_video_style: "Cinematic",
      url: `wedding-video-${Date.now()}`,
      meta_title: "Wedding Video Editing",
      meta_description: "Professional wedding video editing",
      is_active: 1,
      created_by: clientUserId
    })
  });
  
  return await response.json();
};
```

### 2. Freelancer Browses Available Projects

```javascript
const getAvailableProjects = async () => {
  // No authentication required for public listings
  const response = await fetch('/api/v1/projects-tasks/listings', {
    method: 'GET'
  });
  
  const data = await response.json();
  return data.data; // Array of projects
};
```

### 3. Freelancer Submits Completed Work

```javascript
const submitProject = async (projectId, userId, fileUrl, notes) => {
  const response = await fetch(`/api/v1/projects-tasks/${projectId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${freelancerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      submitted_files: fileUrl,
      additional_notes: notes
    })
  });
  
  return await response.json();
};
```

### 4. Client Approves Submission

```javascript
const approveSubmission = async (submissionId, status) => {
  // status: 1 = approved, 2 = rejected
  const response = await fetch(
    `/api/v1/projects-tasks/submissions/${submissionId}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${clientToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    }
  );
  
  return await response.json();
};
```

### 5. Get Client's All Projects

```javascript
const getClientProjects = async (clientId) => {
  const response = await fetch(
    `/api/v1/projects-tasks/client/${clientId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return await response.json();
};
```

### 6. Update Project Status

```javascript
const updateProjectStatus = async (projectId, newStatus, userId) => {
  const response = await fetch(
    `/api/v1/projects-tasks/${projectId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: newStatus,
        user_id: userId
      })
    }
  );
  
  return await response.json();
};
```

### 7. Admin Gets Analytics

```javascript
const getAnalytics = async () => {
  // Get active clients count
  const clientsResponse = await fetch(
    '/api/v1/projects-tasks/analytics/active-clients',
    {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }
  );
  
  // Get active editors count
  const editorsResponse = await fetch(
    '/api/v1/projects-tasks/analytics/active-editors',
    {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }
  );
  
  // Get project counts
  const activeCountResponse = await fetch(
    '/api/v1/projects-tasks/count?type=active',
    {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }
  );
  
  return {
    activeClients: (await clientsResponse.json()).count,
    activeEditors: (await editorsResponse.json()).count,
    activeProjects: (await activeCountResponse.json()).count
  };
};
```

---

## Notes for Frontend Developers

### Important Considerations

1. **Date Formats**: All dates should be in ISO 8601 format:
   - Date only: `"YYYY-MM-DD"` (e.g., `"2024-12-31"`)
   - Timestamp: `"YYYY-MM-DDTHH:mm:ss.sssZ"` (e.g., `"2024-10-18T12:00:00.000Z"`)

2. **Tags Field**: The `tags` field should be a JSON string when creating/updating:
   ```javascript
   tags: JSON.stringify(["wedding", "cinematic", "color-grading"])
   ```

3. **Budget**: Send as a number, receives as decimal with 2 decimal places:
   ```javascript
   budget: 3000.00
   ```

4. **Video Length**: Always in seconds (integer)

5. **Status Updates**: 
   - Project status: 0 (pending), 1 (assigned), 2 (completed)
   - Submission status: 0 (submitted), 1 (approved), 2 (rejected)

6. **Unique URL Slugs**: The `url` field must be unique across all projects. Consider adding timestamps or UUIDs:
   ```javascript
   url: `${titleSlug}-${Date.now()}`
   ```

7. **Soft Deletes**: Deleted projects are not removed from the database; they're marked with `is_deleted: true`

8. **Include Parameter**: Use the `include` query parameter to fetch related data in a single request:
   ```
   GET /api/v1/projects-tasks/15?include=client,freelancer
   ```

9. **Error Handling**: Always check the `success` property in responses and handle errors appropriately

10. **Token Expiry**: JWT tokens expire after 24 hours. Implement token refresh logic.

---

## Testing

All endpoints have been thoroughly tested. Test files are available in:
```
tests/projectstask/
```

Run tests with:
```bash
node tests/projectstask/run-projectstask-tests.js
```

---

## Support

For questions or issues:
- Review the test files for implementation examples
- Check the service layer: `src/features/projectstask/projectstask.service.ts`
- Contact the backend team for clarifications

---

**Last Updated**: October 18, 2024  
**API Version**: v1  
**Test Coverage**: 100% (77 tests passing)
