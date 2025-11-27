# Project Submission APIs

This document provides a quick reference for all project submission-related API endpoints.

## Base URL
`/api/v1/projects-tasks`

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header.

## Endpoints

### 1. Submit Project
**POST** `/:id/submit`

Submit completed work for a project (freelancers only).

**Required Role:** VIDEOGRAPHER, VIDEO_EDITOR

**Request Body:**
```json
{
  "user_id": number,
  "submitted_files": string,
  "additional_notes": string (optional)
}
```

**Response (201):**
```json
{
  "data": {
    "submission_id": number,
    "projects_task_id": number,
    "user_id": number,
    "submitted_files": string,
    "additional_notes": string,
    "status": number,
    "created_at": string
  },
  "message": "Project submitted successfully",
  "success": true
}
```

---

### 2. Approve/Reject Submission
**PATCH** `/submissions/:submissionId/approve`

Approve or reject a submitted project (clients/admins only).

**Required Role:** CLIENT, ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "status": number  // 0: pending, 1: approved, 2: rejected
}
```

**Response (200):**
```json
{
  "data": {
    "submission_id": number,
    "status": number,
    "updated_by": number,
    "updated_at": string
  },
  "message": "Submission status updated successfully",
  "success": true
}
```

---

### 3. Get Submission by ID
**GET** `/submissions/:submissionId`

Retrieve details of a specific submission.

**Required Role:** CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN

**Response (200):**
```json
{
  "data": {
    "submission_id": number,
    "projects_task_id": number,
    "user_id": number,
    "submitted_files": string,
    "additional_notes": string,
    "status": number,
    "created_at": string,
    "freelancer_first_name": string,
    "freelancer_last_name": string,
    "freelancer_email": string,
    "freelancer_profile_picture": string,
    "freelancer_profile_title": string,
    "freelancer_experience_level": string,
    "project_title": string,
    "client_id": number,
    "budget": number
  },
  "success": true
}
```

---

### 4. Get Submissions by Project
**GET** `/:projectId/submissions`

Retrieve all submissions for a specific project.

**Required Role:** CLIENT, ADMIN, SUPER_ADMIN

**Response (200):**
```json
{
  "data": [
    {
      "submission_id": number,
      "projects_task_id": number,
      "user_id": number,
      "submitted_files": string,
      "additional_notes": string,
      "status": number,
      "created_at": string,
      "freelancer_first_name": string,
      "freelancer_last_name": string,
      "freelancer_email": string,
      "freelancer_profile_picture": string,
      "freelancer_profile_title": string,
      "freelancer_experience_level": string
    }
  ],
  "count": number,
  "success": true
}
```

---

### 5. Get Submissions by Freelancer
**GET** `/submissions/freelancer/:userId`

Retrieve all submissions made by a specific freelancer.

**Required Role:** VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN

**Response (200):**
```json
{
  "data": [
    {
      "submission_id": number,
      "projects_task_id": number,
      "user_id": number,
      "submitted_files": string,
      "additional_notes": string,
      "status": number,
      "created_at": string,
      "project_title": string,
      "budget": number,
      "deadline": string,
      "project_status": number,
      "client_first_name": string,
      "client_last_name": string,
      "client_email": string,
      "client_company_name": string
    }
  ],
  "count": number,
  "success": true
}
```

---

### 6. Get All Submissions
**GET** `/submissions`

Retrieve all submissions with optional filtering (admin only).

**Required Role:** ADMIN, SUPER_ADMINc

**Query Parameters:**
- `status` (optional): Filter by submission status (0, 1, or 2)
- `projects_task_id` (optional): Filter by project ID
- `user_id` (optional): Filter by freelancer user ID

**Response (200):**
```json
{
  "data": [
    {
      "submission_id": number,
      "projects_task_id": number,
      "user_id": number,
      "submitted_files": string,
      "additional_notes": string,
      "status": number,
      "created_at": string,
      "freelancer_first_name": string,
      "freelancer_last_name": string,
      "freelancer_email": string,
      "freelancer_profile_title": string,
      "project_title": string,
      "budget": number,
      "client_first_name": string,
      "client_last_name": string,
      "client_email": string
    }
  ],
  "count": number,
  "success": true
}
```

## Status Codes

### Submission Status
- `0` - Submitted (pending review)
- `1` - Approved (freelancer assigned to project)
- `2` - Rejected

### HTTP Status Codes
- `200` - Success (GET, PATCH)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate submission)

## Error Response Format
```json
{
  "error": "Error message",
  "success": false
}
```

## Notes
- All timestamps are in ISO 8601 format
- File URLs in `submitted_files` should be accessible links (e.g., AWS S3, Dropbox)
- Approval automatically assigns the freelancer to the project and updates project status
- Clients can only approve submissions for their own projects