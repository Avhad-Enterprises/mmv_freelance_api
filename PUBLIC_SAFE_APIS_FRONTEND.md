# Public-Safe APIs for Homepage (No Sensitive Data)

## Overview
These public APIs provide data for the homepage without requiring authentication and exclude sensitive information like email addresses and phone numbers. They return active/available content for job listings and freelancer discovery.

## 1. Get All Active Jobs (Public-Safe)
**Endpoint:** `GET /api/v1/projectsTask/getallprojectlisting-public`

**Purpose:** Returns all active (pending/unassigned) jobs for homepage display, excluding any sensitive client information.

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
      "client_company_name": "ABC Productions",
      "client_industry": "film"
    }
  ]
}
```

**Notes:**
- Only returns jobs with `status = 0` (pending/unassigned)
- Excludes deleted jobs (`is_deleted = false`)
- Includes client display information but excludes email and phone number
- Perfect for public homepage job listings

## 2. Get All Available Freelancers (Public-Safe)
**Endpoint:** `GET /api/v1/freelancers/getfreelancers-public`

**Purpose:** Returns all active videographers and video editors for freelancer showcase, excluding email and phone number.

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
      "username": "johndoe",
      "profile_picture": "https://...",
      "bio": "Professional video editor...",
      "timezone": "UTC+5:30",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "pincode": "400001",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "is_active": true,
      "is_banned": false,
      "is_deleted": false,
      "email_notifications": true,
      "created_at": "2025-10-03T17:09:45.453Z",
      "updated_at": "2025-10-03T17:09:45.453Z",
      "freelancer_id": 1,
      "profile_title": "Senior Video Editor",
      "short_description": "Professional editor with 5+ years experience",
      "experience_level": "expert",
      "skills": ["Adobe Premiere", "After Effects", "DaVinci Resolve"],
      "superpowers": ["Color Grading", "Motion Graphics"],
      "skill_tags": ["Adobe Premiere", "After Effects"],
      "base_skills": ["Video Editing", "Color Correction"],
      "languages": ["English", "Hindi"],
      "portfolio_links": ["https://vimeo.com/johndoe"],
      "certification": null,
      "education": null,
      "previous_works": null,
      "services": null,
      "rate_amount": "2500.00",
      "currency": "INR",
      "availability": "full-time",
      "work_type": null,
      "hours_per_week": null,
      "id_type": "passport",
      "id_document_url": "https://...",
      "kyc_verified": false,
      "aadhaar_verification": false,
      "hire_count": 0,
      "review_id": 0,
      "total_earnings": 0,
      "time_spent": 0,
      "projects_applied": [],
      "projects_completed": [],
      "payout_method": null,
      "bank_account_info": null,
      "role_name": "VIDEO_EDITOR"
    }
  ]
}
```

**Notes:**
- Returns both `VIDEOGRAPHER` and `VIDEO_EDITOR` roles
- Only active, non-banned users
- **Excludes:** `email`, `phone_number`, `phone_verified`, `email_verified`, `reset_token`, `reset_token_expires`, `login_attempts`, `last_login_at`, `banned_reason`
- Includes complete profile information for rich UI display
- Perfect for public freelancer showcase

## Key Differences from Regular APIs

| Field | Regular API | Public-Safe API |
|-------|-------------|-----------------|
| Client Email | ✅ Included | ❌ Excluded |
| Client Phone | ✅ Included | ❌ Excluded |
| Freelancer Email | ✅ Included | ❌ Excluded |
| Freelancer Phone | ✅ Included | ❌ Excluded |
| Authentication | 🔒 Required | 🔓 Not Required |

## Usage in Frontend

```javascript
// Get active jobs for homepage (public-safe)
const jobs = await fetch('/api/v1/projectsTask/getallprojectlisting-public');
const jobsData = await jobs.json();

// Get freelancers for showcase (public-safe)
const freelancers = await fetch('/api/v1/freelancers/getfreelancers-public');
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
Run the test suite: `node tests/test-public-safe-apis.js`

## Security Notes
- These endpoints are designed for public access and homepage display
- Sensitive contact information is excluded to protect user privacy
- All other profile and project information remains available for rich UI experiences
- No authentication tokens required for these endpoints