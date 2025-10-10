# Public APIs for Homepage

## Overview
These public APIs provide data for the homepage without requiring authentication. They return active/available content for job listings and freelancer discovery.

## 1. Get All Active Jobs
**Endpoint:** `GET /api/v1/projectsTask/getallprojectlisting`

**Purpose:** Returns all active (pending/unassigned) jobs for homepage display.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "projects_task_id": 1,
      "client_id": 123,
      "project_title": "Wedding Video Editing",
      "project_category": "Wedding",
      "deadline": "2025-12-31T00:00:00.000Z",
      "status": 0,
      "project_description": "Need professional wedding video editing...",
      "budget": 5000,
      "tags": ["wedding", "editing"],
      "skills_required": ["Adobe Premiere", "After Effects"],
      "project_files": [],
      "client_user_id": 123,
      "client_first_name": "John",
      "client_last_name": "Doe",
      "client_profile_picture": "https://...",
      "client_company_name": "ABC Productions"
    }
  ]
}
```

**Notes:**
- Only returns jobs with `status = 0` (pending/unassigned)
- Excludes deleted jobs (`is_deleted = false`)
- Includes client information for display

## 2. Get All Available Freelancers
**Endpoint:** `GET /api/v1/freelancers/getfreelancers`

**Purpose:** Returns all active videographers and video editors for freelancer showcase.

**Response:**
```json
{
  "success": true,
  "count": 11,
  "data": [
    {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "profile_picture": "https://...",
      "city": "Mumbai",
      "country": "India",
      "freelancer_id": 1,
      "profile_title": "Senior Video Editor",
      "short_description": "Professional editor with 5+ years experience",
      "experience_level": "expert",
      "skills": ["Adobe Premiere", "After Effects", "DaVinci Resolve"],
      "languages": ["English", "Hindi"],
      "portfolio_links": ["https://vimeo.com/johndoe"],
      "rate_amount": "2500.00",
      "currency": "INR",
      "availability": "full-time",
      "role_name": "VIDEO_EDITOR"
    }
  ]
}
```

**Notes:**
- Returns both `VIDEOGRAPHER` and `VIDEO_EDITOR` roles
- Only active, non-banned users
- Includes complete profile information for cards/display

## Usage in Frontend

```javascript
// Get active jobs for homepage
const jobs = await fetch('/api/v1/projectsTask/getallprojectlisting');
const jobsData = await jobs.json();

// Get freelancers for showcase
const freelancers = await fetch('/api/v1/freelancers/getfreelancers');
const freelancersData = await freelancers.json();
```

## Error Handling
Both endpoints return standard error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing
Run the test suite: `node tests/test-public-apis.js`