# Project Submission API - Frontend Developer Guide

Complete API documentation for the Project Submission system. This guide covers the submission and approval workflow for completed freelance projects.

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Status Codes](#status-codes)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Common Use Cases](#common-use-cases)

---

## Overview

The Project Submission API handles the final phase of the freelance project lifecycle:
- Freelancers submit their completed work
- Clients review and approve/reject submissions
- Automatic project assignment upon approval

**Base URL**: `/api/v1/projects-tasks`

---

## Authentication

All endpoints require JWT authentication via Bearer token.

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **CLIENT** | View submissions for own projects; approve/reject submissions |
| **VIDEOGRAPHER** | Submit completed work; view own submissions |
| **VIDEO_EDITOR** | Submit completed work; view own submissions |
| **ADMIN** | Full access to all submissions |
| **SUPER_ADMIN** | Full access to all submissions |

---

## Status Codes

### Submission Status
- `0` - Submitted (pending client review)
- `1` - Approved (client approved, freelancer assigned to project)
- `2` - Rejected (client rejected the submission)

---

## API Endpoints

### Submit Project

Submit completed work for a project (freelancers only).

**Endpoint**: `POST /api/v1/projects-tasks/:id/submit`

**Authentication**: Required (VIDEOGRAPHER, VIDEO_EDITOR)

**Request Body**:
```json
{
  "user_id": 86,
  "submitted_files": "https://dropbox.com/project-files/final-video.mp4",
  "additional_notes": "Completed as per requirements"
}
```

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
    "created_at": "2025-11-01T13:53:37.500Z"
  },
  "message": "Project submitted successfully",
  "success": true
}
```

---

### Approve/Reject Submission

Approve or reject a submitted project (clients only).

**Endpoint**: `PATCH /api/v1/projects-tasks/submissions/:submissionId/approve`

**Authentication**: Required (CLIENT, ADMIN, SUPER_ADMIN)

**Request Body**:
```json
{
  "status": 1
}
```

**Status Values**: `0` (pending), `1` (approved), `2` (rejected)

**Response**: `200 OK`
```json
{
  "data": {
    "submission_id": 3,
    "status": 1,
    "updated_by": 85,
    "updated_at": "2025-11-01T13:53:37.600Z"
  },
  "message": "Submission status updated successfully",
  "success": true
}
```

**Note**: Approval automatically assigns freelancer to project and updates project status to 1 (assigned).

---

### Get Submission by ID

Retrieve details of a specific submission.

**Endpoint**: `GET /api/v1/projects-tasks/submissions/:submissionId`

**Authentication**: Required (CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN)

**Response**: `200 OK`
```json
{
  "data": {
    "submission_id": 3,
    "projects_task_id": 15,
    "user_id": 86,
    "submitted_files": "https://dropbox.com/project-files/final-video.mp4",
    "additional_notes": "Completed as per requirements",
    "status": 0,
    "created_at": "2025-11-01T13:53:37.500Z",
    "freelancer_first_name": "Test",
    "freelancer_last_name": "Videographer",
    "project_title": "Wedding Video Editing",
    "budget": 3000.00
  },
  "success": true
}
```

---

### Get Submissions by Project

Retrieve all submissions for a specific project.

**Endpoint**: `GET /api/v1/projects-tasks/:projectId/submissions`

**Authentication**: Required (CLIENT, ADMIN, SUPER_ADMIN)

**Response**: `200 OK`
```json
{
  "data": [
    {
      "submission_id": 3,
      "user_id": 86,
      "submitted_files": "https://dropbox.com/submission1.mp4",
      "status": 0,
      "freelancer_first_name": "Test",
      "freelancer_last_name": "Videographer",
      "created_at": "2025-11-01T13:53:37.500Z"
    }
  ],
  "count": 1,
  "success": true
}
```

---

### Get Submissions by Freelancer

Retrieve all submissions made by a specific freelancer.

**Endpoint**: `GET /api/v1/projects-tasks/submissions/freelancer/:userId`

**Authentication**: Required (VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN)

**Response**: `200 OK`
```json
{
  "data": [
    {
      "submission_id": 3,
      "projects_task_id": 15,
      "submitted_files": "https://dropbox.com/submission1.mp4",
      "status": 1,
      "project_title": "Wedding Video Editing",
      "budget": 3000.00,
      "client_first_name": "Test",
      "client_last_name": "Client",
      "created_at": "2025-11-01T13:53:37.500Z"
    }
  ],
  "count": 1,
  "success": true
}
```

---

### Get All Submissions

Retrieve all submissions with optional filtering (admin only).

**Endpoint**: `GET /api/v1/projects-tasks/submissions`

**Authentication**: Required (ADMIN, SUPER_ADMIN)

**Query Parameters**:
- `status` - Filter by submission status (0, 1, or 2)
- `projects_task_id` - Filter by project ID
- `user_id` - Filter by freelancer user ID

**Response**: `200 OK`
```json
{
  "data": [
    {
      "submission_id": 3,
      "projects_task_id": 15,
      "user_id": 86,
      "submitted_files": "https://dropbox.com/submission1.mp4",
      "status": 0,
      "freelancer_first_name": "Test",
      "freelancer_last_name": "Videographer",
      "project_title": "Wedding Video Editing",
      "client_first_name": "Test",
      "client_last_name": "Client"
    }
  ],
  "count": 1,
  "success": true
}
```

---

## Data Models

### Submission Object
```typescript
{
  submission_id: number;              // Primary key, auto-generated
  projects_task_id: number;           // Foreign key to projects_task table
  user_id: number;                    // Foreign key to users table (freelancer)
  submitted_files: string;            // Required: URL/path to submitted files
  additional_notes?: string | null;   // Optional: submission notes
  status: number;                     // 0: submitted, 1: approved, 2: rejected
  created_at: string;                 // ISO timestamp, auto-generated
  updated_at: string;                 // ISO timestamp, auto-updated
}
```

### Submission with Joined Data
When fetching submissions, additional data is joined from related tables:

```typescript
{
  // ...all submission fields...

  // Freelancer information
  freelancer_first_name: string;
  freelancer_last_name: string;
  freelancer_email: string;
  freelancer_profile_title?: string;

  // Project information
  project_title: string;
  budget: number;

  // Client information
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
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
    "timestamp": "2025-11-01T13:53:37.000Z",
    "version": "v1"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful PATCH, GET requests |
| 201 | Created | Successful POST (submission created) |
| 400 | Bad Request | Validation error, missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have required role/permissions |
| 404 | Not Found | Project or submission doesn't exist |
| 409 | Conflict | Project already submitted by this user |
| 500 | Internal Server Error | Server-side error |

---

## Common Use Cases

### Freelancer Submits Completed Work

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

### Client Approves Submission

```javascript
const approveSubmission = async (submissionId, approved) => {
  const response = await fetch(
    `/api/v1/projects-tasks/submissions/${submissionId}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${clientToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: approved ? 1 : 2 })
    }
  );

  return await response.json();
};
```

### Client Views Project Submissions

```javascript
const getProjectSubmissions = async (projectId) => {
  const response = await fetch(
    `/api/v1/projects-tasks/${projectId}/submissions`,
    {
      headers: {
        'Authorization': `Bearer ${clientToken}`
      }
    }
  );

  return await response.json();
};
```

### Freelancer Views Own Submissions

```javascript
const getMySubmissions = async (userId) => {
  const response = await fetch(
    `/api/v1/projects-tasks/submissions/freelancer/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${freelancerToken}`
      }
    }
  );

  return await response.json();
};
```

---

## Testing

Comprehensive tests are available for all endpoints:

**Test Location**: `tests/submit-project/`

**Test Files**:
- `test-submit-project.js` (5 tests)
- `test-approve-submission.js` (7 tests)
- `test-get-submission-by-id.js` (7 tests)
- `test-get-submissions-by-project.js` (7 tests)
- `test-get-submissions-by-freelancer.js` (7 tests)
- `test-get-all-submissions.js` (8 tests)

Run all tests:
```bash
cd tests/submit-project
node run-submission-tests.js
```

---

## Database Schema

Submissions are stored in the `submitted_projects` table with foreign keys to `projects_task` and `users` tables.

---

**Last Updated**: November 2, 2025  
**API Version**: v1  
**Test Coverage**: 100% (41 tests passing)