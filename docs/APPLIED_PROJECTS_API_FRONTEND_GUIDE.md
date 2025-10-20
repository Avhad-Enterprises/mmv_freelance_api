# Applied Projects API Documentation

## Overview
The Applied Projects APIs manage the application process for freelance projects in the MMV platform. These endpoints handle project applications, status updates, filtering, and analytics for editors (VIDEOGRAPHER, VIDEO_EDITOR), clients (CLIENT), and administrators (ADMIN, SUPER_ADMIN).

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Application Status Values
- `0`: Pending (default)
- `1`: Ongoing/Approved
- `2`: Completed
- `3`: Rejected

## Project Application Status Values
- `0`: Pending
- `1`: Ongoing/Approved
- `2`: Completed
- `3`: Rejected

---

## Editor APIs (VIDEOGRAPHER, VIDEO_EDITOR)

### 1. Apply to Project
**Endpoint:** `POST /applications/projects/apply`

**Allowed Roles:** VIDEOGRAPHER, VIDEO_EDITOR

**Description:** Submit an application for a freelance project.

**Request Body:**
```json
{
  "projects_task_id": 1,
  "description": "I have experience in video editing and can deliver high-quality work"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Applied to project successfully",
  "alreadyApplied": false,
  "data": {
    "applied_projects_id": 1,
    "projects_task_id": 1,
    "user_id": 45,
    "status": 0,
    "description": "I have experience in video editing...",
    "created_at": "2025-10-11T08:00:00.000Z"
  }
}
```

### 2. Get My Applications
**Endpoint:** `GET /applications/my-applications`

**Allowed Roles:** VIDEOGRAPHER, VIDEO_EDITOR

**Description:** Retrieve all applications submitted by the current user.

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "applied_projects_id": 1,
      "projects_task_id": 1,
      "status": 0,
      "description": "Application description",
      "created_at": "2025-10-11T08:00:00.000Z",
      "project": {
        "project_title": "Video Editing Project",
        "budget": 5000.00,
        "deadline": "2025-12-31"
      }
    }
  ]
}
```

### 3. Get My Application by Project ID
**Endpoint:** `GET /applications/my-applications/project/:project_id`

**Allowed Roles:** VIDEOGRAPHER, VIDEO_EDITOR

**Description:** Get a specific application for a project.

**Response:** Same format as above but for a single application.

### 4. Withdraw Application
**Endpoint:** `DELETE /applications/withdraw/:application_id`

**Allowed Roles:** VIDEOGRAPHER, VIDEO_EDITOR

**Description:** Withdraw a pending application (soft delete).

**Response (Success):**
```json
{
  "message": "Application withdrawn successfully"
}
```

---

## Client APIs (CLIENT)

### 5. Get Project Applications
**Endpoint:** `GET /applications/projects/:project_id/applications`

**Allowed Roles:** CLIENT

**Description:** View all applications for a client's project.

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "applied_projects_id": 1,
      "user_id": 45,
      "status": 0,
      "description": "Application description",
      "created_at": "2025-10-11T08:00:00.000Z",
      "applicant": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### 6. Update Application Status
**Endpoint:** `PATCH /applications/update-status`

**Allowed Roles:** CLIENT

**Description:** Approve, reject, or update application status (hire editor).

**Request Body:**
```json
{
  "applied_projects_id": 1,
  "status": 1
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "applied_projects_id": 1,
    "status": 1,
    "updated_at": "2025-10-11T08:00:00.000Z"
  }
}
```

### 7. Get Application Count
**Endpoint:** `GET /applications/projects/:project_id/application-count`

**Allowed Roles:** CLIENT, ADMIN, SUPER_ADMIN

**Description:** Get the count of applications for a project.

**Response (Success):**
```json
{
  "success": true,
  "project_id": 1,
  "count": 5
}
```

---

## General APIs (All Authenticated Users)

### 8. Filter Applications by Status
**Endpoint:** `GET /applications/status/:status`

**Allowed Roles:** VIDEOGRAPHER, VIDEO_EDITOR, CLIENT

**Description:** Get applications filtered by status (0=pending, 1=ongoing, 2=completed, 3=rejected).

**Response (Success):**
```json
{
  "success": true,
  "status": 1,
  "data": [
    {
      "applied_projects_id": 1,
      "projects_task_id": 1,
      "status": 1,
      "description": "Application description",
      "project_title": "Video Editing Project",
      "budget": 5000.00,
      "deadline": "2025-12-31"
    }
  ]
}
```

### 9. Get Applied Projects Count
**Endpoint:** `GET /applications/count`

**Allowed Roles:** VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN

**Description:** Get the count of applied projects for the current user.

**Response (Success):**
```json
{
  "message": "Applied project count for user 45 fetched successfully",
  "data": 3
}
```

### 10. Get Ongoing Projects
**Endpoint:** `GET /applications/ongoing`

**Allowed Roles:** VIDEOGRAPHER, VIDEO_EDITOR, CLIENT, ADMIN, SUPER_ADMIN

**Description:** Get user's ongoing/approved projects.

**Response (Success):**
```json
{
  "message": "Ongoing (Approved) projects fetched for user ID 45",
  "data": [
    {
      "applied_projects_id": 1,
      "project_title": "Video Editing Project",
      "deadline": "2025-12-31",
      "budget": 5000.00,
      "applied_at": "2025-10-11T08:00:00.000Z"
    }
  ]
}
```

### 11. Filter Projects by Status
**Endpoint:** `GET /applications/filter/:filter`

**Allowed Roles:** VIDEOGRAPHER, VIDEO_EDITOR, CLIENT, ADMIN, SUPER_ADMIN

**Description:** Filter projects by status (new, ongoing, completed).

**Response (Success):**
```json
{
  "message": "ongoing projects fetched successfully",
  "data": [
    {
      "applied_projects_id": 1,
      "project_title": "Video Editing Project",
      "project_category": "Video Editing",
      "deadline": "2025-12-31",
      "budget": 5000.00,
      "applied_at": "2025-10-11T08:00:00.000Z"
    }
  ]
}
```

---

## Admin Analytics APIs (ADMIN, SUPER_ADMIN)

### 12. Get Completed Projects Count
**Endpoint:** `GET /applications/projects/completed-count`

**Allowed Roles:** ADMIN, SUPER_ADMIN

**Description:** Get total count of completed projects across the platform.

**Response (Success):**
```json
{
  "data": {
    "completed_projects": 25
  },
  "message": "Completed project count fetched successfully"
}
```

---

## Error Responses

### Common Error Format
```json
{
  "success": false,
  "message": "Error description",
  "meta": {
    "timestamp": "2025-10-11T08:00:00.000Z",
    "version": "v1"
  }
}
```

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors, invalid parameters)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

### Common Error Messages
- `"Project Task ID is required"`
- `"Application not found"`
- `"Application has already been withdrawn."`
- `"Status must be 0 (pending), 1 (ongoing), 2 (completed), or 3 (rejected)"`
- `"Invalid filter value. Allowed: new, ongoing, completed"`

---

## Important Notes

### Authentication & Authorization
- All endpoints require valid JWT tokens
- Role-based access control is enforced
- Tokens expire and need refresh

### Application Workflow
1. **Editor** applies to project (status: 0 - pending)
2. **Client** reviews and updates status (1 - approved/ongoing, 3 - rejected)
3. **Editor** works on approved projects
4. **Client** marks as completed (status: 2)

### Data Validation
- `projects_task_id` must be a valid integer
- `application_id` must be a valid integer
- Status values are strictly validated
- Applications can only be withdrawn if pending

### Soft Deletes
- Withdrawn applications are soft-deleted (`is_deleted: true`)
- Completed applications cannot be withdrawn
- Deleted applications don't appear in listings

### Rate Limiting
- Consider implementing rate limiting for application submissions
- Bulk operations may be subject to restrictions

### Real-time Updates
- Consider implementing WebSocket connections for real-time application status updates
- Frontend should poll for updates on critical application statuses

---

## Frontend Integration Examples

### React Hook Example
```javascript
const applyToProject = async (projectId, description) => {
  try {
    const response = await fetch('/api/v1/applications/projects/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        projects_task_id: projectId,
        description: description
      })
    });

    const data = await response.json();
    if (data.success) {
      // Handle success
      console.log('Application submitted:', data.data);
    } else {
      // Handle error
      console.error('Application failed:', data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### Vue.js Composition API Example
```javascript
const getMyApplications = async () => {
  const { data } = await $fetch('/api/v1/applications/my-applications', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (data.success) {
    applications.value = data.data;
  }
};
```

This documentation covers all 12 applied projects API endpoints with comprehensive examples for frontend integration.</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/APPLIED_PROJECTS_API_FRONTEND_GUIDE.md