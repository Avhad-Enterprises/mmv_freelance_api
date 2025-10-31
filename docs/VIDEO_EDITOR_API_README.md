# Video Editor API Documentation

## Overview
Video editor-specific endpoints for managing video editor profiles, discovery, availability, and statistics. Includes public discovery routes and protected profile management routes.

## Base URL
```
/api/v1
```

## Authentication
All endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get All Video Editors
**GET** `/videoeditors/getvideoeditors`

**Required Roles:** Authentication required

**Description:** Retrieve a list of all video editors in the system for discovery purposes.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 2,
      "first_name": "Mike",
      "last_name": "Johnson",
      "username": "mikejohnson",
      "email": "mike@example.com",
      "company_name": "MJ Video Editing",
      "specialization": ["wedding", "corporate", "music_video", "color_grading"],
      "experience_years": 7,
      "hourly_rate": 85.00,
      "software_skills": ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro"],
      "rating": 4.9,
      "total_reviews": 38,
      "location": "Los Angeles, CA",
      "is_available": true,
      "portfolio_url": "https://mj-editing.com",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 2. Get Top-Rated Video Editors
**GET** `/videoeditors/top-rated`

**Required Roles:** Authentication required

**Description:** Retrieve a list of top-rated video editors sorted by rating and review count.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 2,
      "first_name": "Mike",
      "last_name": "Johnson",
      "username": "mikejohnson",
      "rating": 4.9,
      "total_reviews": 38,
      "specialization": ["wedding", "corporate", "music_video"],
      "hourly_rate": 85.00,
      "software_skills": ["Adobe Premiere Pro", "After Effects"],
      "location": "Los Angeles, CA",
      "is_available": true
    }
  ],
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 3. Get Available Editors with Task Counts
**GET** `/videoeditors/available`

**Required Roles:** Authentication required

**Description:** Get video editors who are currently available, including their current task load for assignment planning.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 2,
      "first_name": "Mike",
      "last_name": "Johnson",
      "username": "mikejohnson",
      "rating": 4.9,
      "is_available": true,
      "current_tasks": 2,
      "max_concurrent_tasks": 5,
      "specialization": ["wedding", "corporate"],
      "hourly_rate": 85.00,
      "estimated_completion_time": "3-5 days",
      "location": "Los Angeles, CA"
    }
  ],
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 4. Get Video Editor by Username
**GET** `/videoeditors/username/:username`

**Required Roles:** Authentication required

**Description:** Get detailed information about a video editor by their username.

**Path Parameters:**
- `username` (string): The video editor's username

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 2,
      "first_name": "Mike",
      "last_name": "Johnson",
      "username": "mikejohnson",
      "email": "mike@example.com",
      "company_name": "MJ Video Editing",
      "phone": "+1234567890",
      "address": "456 Editing St",
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA",
      "zip_code": "90210",
      "website": "https://mj-editing.com",
      "bio": "Professional video editor specializing in wedding films and corporate content",
      "specialization": ["wedding", "corporate", "music_video", "color_grading"],
      "experience_years": 7,
      "hourly_rate": 85.00,
      "software_skills": ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro"],
      "hardware_specs": ["Mac Pro", "27-inch 5K Display", "External SSD Storage"],
      "languages": ["English"],
      "portfolio_url": "https://mj-editing.com/portfolio",
      "social_links": {
        "instagram": "@mjvideoediting",
        "vimeo": "mjvideoediting",
        "behance": "mj-editing"
      },
      "rating": 4.9,
      "total_reviews": 38,
      "is_available": true,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "stats": {
      "total_projects": 45,
      "active_projects": 2,
      "completed_projects": 43,
      "total_earnings": 35000.00,
      "avg_project_value": 777.78,
      "total_reviews": 38,
      "avg_rating": 4.9
    }
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 5. Get My Profile
**GET** `/videoeditors/profile`

**Required Roles:** VIDEO_EDITOR

**Description:** Get the current authenticated video editor's profile information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 2,
      "first_name": "Mike",
      "last_name": "Johnson",
      "username": "mikejohnson",
      "email": "mike@example.com",
      "phone": "+1234567890",
      "address_line_first": "456 Editing St",
      "address_line_second": null,
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA",
      "pincode": "90210",
      "website": "https://mj-editing.com",
      "bio": "Professional video editor specializing in wedding films and corporate content",
      "timezone": "America/Los_Angeles",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "is_active": true,
      "is_banned": false,
      "is_deleted": false,
      "email_notifications": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "profile": {
      "freelancer_id": 1,
      "user_id": 2,
      "profile_title": "Senior Video Editor",
      "role": "Lead Editor",
      "short_description": "Award-winning video editor specializing in wedding films, corporate content, and music videos",
      "experience_level": "expert",
      "skills": ["video editing", "color grading", "motion graphics"],
      "superpowers": ["creative editing", "technical expertise"],
      "skill_tags": ["wedding", "corporate", "music_video"],
      "base_skills": ["Adobe Premiere", "After Effects"],
      "languages": ["English", "Spanish"],
      "portfolio_links": ["https://portfolio.example.com"],
      "rate_amount": 95.00,
      "currency": "USD",
      "availability": "full-time",
      "work_type": "remote",
      "hours_per_week": "30_40",
      "hire_count": 15,
      "total_earnings": 25000.00,
      "time_spent": 1200,
      "projects_applied": [1, 2, 3],
      "projects_completed": [1, 2],
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z",
      "videoeditor": null
    },
    "userType": "VIDEO_EDITOR"
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 6. Update Profile
**PATCH** `/videoeditors/profile`

**Required Roles:** VIDEO_EDITOR

**Description:** Update the current authenticated video editor's profile information. This endpoint only updates fields in the freelancer_profiles table.

**Request Body:**
```json
{
  "profile_title": "Senior Video Editor",
  "role": "Lead Editor",
  "short_description": "Award-winning video editor specializing in wedding films, corporate content, and music videos",
  "experience_level": "expert",
  "skills": ["video editing", "color grading", "motion graphics"],
  "superpowers": ["creative editing", "technical expertise"],
  "portfolio_links": ["https://portfolio.example.com"],
  "rate_amount": 95.00,
  "currency": "USD",
  "availability": "full-time",
  "work_type": "remote",
  "hours_per_week": "30_40",
  "languages": ["English", "Spanish"]
}
```

**Validation:** All fields are optional. Uses VideoEditorUpdateDto validation.

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": 2,
      "first_name": "Mike",
      "last_name": "Johnson",
      "username": "mikejohnson",
      "email": "mike@example.com",
      "company_name": "MJ Video Editing Studio",
      "phone": "+1234567890",
      "address": "456 Editing Street",
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA",
      "zip_code": "90210",
      "website": "https://mj-editing-studio.com",
      "bio": "Award-winning video editor specializing in wedding films, corporate content, and music videos",
      "specialization": ["wedding", "corporate", "music_video", "color_grading", "motion_graphics"],
      "experience_years": 8,
      "hourly_rate": 95.00,
      "software_skills": ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro", "Motion"],
      "hardware_specs": ["Mac Pro M2", "27-inch 5K Display", "External SSD Storage", "Color Calibration Monitor"],
      "languages": ["English", "Spanish"],
      "portfolio_url": "https://mj-editing-studio.com/portfolio",
      "social_links": {
        "instagram": "@mjvideoediting",
        "vimeo": "mjvideoediting",
        "behance": "mj-editing",
        "linkedin": "mike-johnson-video-editing"
      },
      "is_available": true,
      "updated_at": "2025-10-18T10:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 7. Get Profile Statistics
**GET** `/videoeditors/profile/stats`

**Required Roles:** VIDEO_EDITOR

**Description:** Get statistics and metrics for the current authenticated video editor.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_projects": 45,
      "active_projects": 2,
      "completed_projects": 43,
      "total_earnings": 35000.00,
      "avg_project_value": 777.78,
      "monthly_earnings": 2916.67,
      "total_reviews": 38,
      "avg_rating": 4.9,
      "avg_completion_time_days": 4.2,
      "on_time_delivery_rate": 96.0,
      "client_satisfaction": 4.8,
      "revisions_avg_per_project": 1.3
    }
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 8. Get Video Editor by ID
**GET** `/videoeditors/:id`

**Required Roles:** Authentication required

**Description:** Get detailed information about a specific video editor by their user ID.

**Path Parameters:**
- `id` (number): The video editor's user ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 2,
      "first_name": "Mike",
      "last_name": "Johnson",
      "username": "mikejohnson",
      "email": "mike@example.com",
      "company_name": "MJ Video Editing",
      "phone": "+1234567890",
      "address": "456 Editing St",
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA",
      "zip_code": "90210",
      "website": "https://mj-editing.com",
      "bio": "Professional video editor specializing in wedding films and corporate content",
      "specialization": ["wedding", "corporate", "music_video", "color_grading"],
      "experience_years": 7,
      "hourly_rate": 85.00,
      "software_skills": ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro"],
      "hardware_specs": ["Mac Pro", "27-inch 5K Display", "External SSD Storage"],
      "languages": ["English"],
      "portfolio_url": "https://mj-editing.com/portfolio",
      "social_links": {
        "instagram": "@mjvideoediting",
        "vimeo": "mjvideoediting",
        "behance": "mj-editing"
      },
      "rating": 4.9,
      "total_reviews": 38,
      "is_available": true,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "stats": {
      "total_projects": 45,
      "active_projects": 2,
      "completed_projects": 43,
      "total_earnings": 35000.00,
      "avg_project_value": 777.78,
      "total_reviews": 38,
      "avg_rating": 4.9
    },
    "reviews": [
      {
        "review_id": 2,
        "client_name": "Sarah Wilson",
        "rating": 5,
        "comment": "Outstanding editing work on our corporate video!",
        "created_at": "2025-09-15T00:00:00Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

## Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication token missing",
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Video editor not found",
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "hourly_rate",
      "message": "Hourly rate must be a positive number"
    }
  ],
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

## Notes for Frontend Integration

1. **Authentication:** All requests must include the JWT token in the Authorization header
2. **Role-based Access:** Profile management endpoints require VIDEO_EDITOR role, discovery endpoints require general authentication
3. **Validation:** Profile update requests are validated using VideoEditorUpdateDto
4. **Availability Tracking:** The `/available` endpoint is crucial for task assignment and shows current workload
5. **Specialized Fields:** Video editor profiles include software skills, hardware specs, and editing-specific specializations
6. **Task Management:** Statistics include completion rates, revisions, and delivery performance metrics
7. **Response Structure:** All responses follow the standard API response format with `success`, `data`, and `meta` fields