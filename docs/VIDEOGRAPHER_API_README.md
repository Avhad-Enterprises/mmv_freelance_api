# Videographer API Documentation

## Overview
Videographer-specific endpoints for managing videographer profiles, discovery, and statistics. Includes public discovery routes and protected profile management routes.

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

### 1. Get All Videographers
**GET** `/videographers/getvideographers`

**Required Roles:** CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN

**Description:** Retrieve a list of all videographers in the system for discovery purposes.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "company_name": "Jane's Video Productions",
      "specialization": ["wedding", "corporate", "event"],
      "experience_years": 5,
      "hourly_rate": 150.00,
      "rating": 4.8,
      "total_reviews": 25,
      "location": "Los Angeles, CA",
      "is_available": true,
      "portfolio_url": "https://portfolio.example.com",
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

### 2. Get Top-Rated Videographers
**GET** `/videographers/top-rated`

**Required Roles:** CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN

**Description:** Retrieve a list of top-rated videographers sorted by rating and review count.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "username": "janesmith",
      "rating": 4.9,
      "total_reviews": 45,
      "specialization": ["wedding", "corporate"],
      "hourly_rate": 200.00,
      "location": "New York, NY",
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

### 3. Get Videographer by Username
**GET** `/videographers/username/:username`

**Required Roles:** Authentication required

**Description:** Get detailed information about a videographer by their username.

**Path Parameters:**
- `username` (string): The videographer's username

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "company_name": "Jane's Video Productions",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zip_code": "10001",
      "website": "https://janesvideos.com",
      "bio": "Professional videographer specializing in weddings and corporate events",
      "specialization": ["wedding", "corporate", "event"],
      "experience_years": 5,
      "hourly_rate": 150.00,
      "equipment": ["Canon EOS R5", "DJI Ronin", "Professional Lighting Kit"],
      "languages": ["English", "Spanish"],
      "portfolio_url": "https://portfolio.example.com",
      "social_links": {
        "instagram": "@janesmithvideos",
        "youtube": "JaneSmithProductions"
      },
      "rating": 4.8,
      "total_reviews": 25,
      "is_available": true,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "stats": {
      "total_projects": 30,
      "active_projects": 3,
      "completed_projects": 27,
      "total_earnings": 45000.00,
      "avg_project_value": 1500.00,
      "total_reviews": 25,
      "avg_rating": 4.8
    }
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 4. Get My Profile
**GET** `/videographers/profile`

**Required Roles:** VIDEOGRAPHER

**Description:** Get the current authenticated videographer's profile information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "address_line_first": "123 Main St",
      "address_line_second": null,
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001",
      "website": "https://janesvideos.com",
      "bio": "Professional videographer specializing in weddings and corporate events",
      "timezone": "America/New_York",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "is_active": true,
      "is_banned": false,
      "is_deleted": false,
      "email_notifications": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "profile": {
      "freelancer_id": 1,
      "user_id": 1,
      "profile_title": "Senior Wedding Videographer",
      "role": "Lead Videographer",
      "short_description": "Award-winning videographer specializing in weddings and corporate events",
      "experience_level": "expert",
      "skills": ["cinematography", "lighting", "post-production"],
      "superpowers": ["creative storytelling", "technical expertise"],
      "skill_tags": ["wedding", "corporate", "event"],
      "base_skills": ["Canon EOS R5", "DJI Ronin"],
      "languages": ["English", "Spanish"],
      "portfolio_links": ["https://portfolio.example.com"],
      "rate_amount": 175.00,
      "currency": "USD",
      "availability": "part-time",
      "work_type": "remote",
      "hours_per_week": "20_30",
      "hire_count": 25,
      "total_earnings": 45000.00,
      "time_spent": 1800,
      "projects_applied": [1, 2, 3],
      "projects_completed": [1, 2],
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z",
      "videographer": null
    },
    "userType": "VIDEOGRAPHER"
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 5. Update Profile
**PATCH** `/videographers/profile`

**Required Roles:** VIDEOGRAPHER

**Description:** Update the current authenticated videographer's profile information. This endpoint only updates fields in the freelancer_profiles table.

**Request Body:**
```json
{
  "profile_title": "Senior Wedding Videographer",
  "role": "Lead Videographer",
  "short_description": "Award-winning videographer specializing in weddings and corporate events",
  "experience_level": "expert",
  "skills": ["cinematography", "lighting", "post-production"],
  "superpowers": ["creative storytelling", "technical expertise"],
  "portfolio_links": ["https://portfolio.example.com"],
  "rate_amount": 175.00,
  "currency": "USD",
  "availability": "part-time",
  "work_type": "remote",
  "hours_per_week": "20_30",
  "languages": ["English", "Spanish", "French"]
}
```

**Validation:** All fields are optional. Uses VideographerUpdateDto validation.

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "company_name": "Jane's Video Productions LLC",
      "phone": "+1234567890",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zip_code": "10001",
      "website": "https://janesvideos.com",
      "bio": "Award-winning videographer specializing in weddings and corporate events",
      "specialization": ["wedding", "corporate", "event", "documentary"],
      "experience_years": 6,
      "hourly_rate": 175.00,
      "equipment": ["Canon EOS R5", "DJI Ronin", "Professional Lighting Kit", "Audio Equipment"],
      "languages": ["English", "Spanish", "French"],
      "portfolio_url": "https://new-portfolio.example.com",
      "social_links": {
        "instagram": "@janesmithvideos",
        "youtube": "JaneSmithProductions",
        "linkedin": "jane-smith-videography"
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

### 6. Get Profile Statistics
**GET** `/videographers/profile/stats`

**Required Roles:** VIDEOGRAPHER

**Description:** Get statistics and metrics for the current authenticated videographer.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_projects": 30,
      "active_projects": 3,
      "completed_projects": 27,
      "total_earnings": 45000.00,
      "avg_project_value": 1500.00,
      "monthly_earnings": 3750.00,
      "total_reviews": 25,
      "avg_rating": 4.8,
      "response_time_hours": 2.5,
      "completion_rate": 95.0,
      "client_satisfaction": 4.7
    }
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 7. Get Videographer by ID
**GET** `/videographers/:id`

**Required Roles:** Authentication required

**Description:** Get detailed information about a specific videographer by their user ID.

**Path Parameters:**
- `id` (number): The videographer's user ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "company_name": "Jane's Video Productions",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zip_code": "10001",
      "website": "https://janesvideos.com",
      "bio": "Professional videographer specializing in weddings and corporate events",
      "specialization": ["wedding", "corporate", "event"],
      "experience_years": 5,
      "hourly_rate": 150.00,
      "equipment": ["Canon EOS R5", "DJI Ronin", "Professional Lighting Kit"],
      "languages": ["English", "Spanish"],
      "portfolio_url": "https://portfolio.example.com",
      "social_links": {
        "instagram": "@janesmithvideos",
        "youtube": "JaneSmithProductions"
      },
      "rating": 4.8,
      "total_reviews": 25,
      "is_available": true,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "stats": {
      "total_projects": 30,
      "active_projects": 3,
      "completed_projects": 27,
      "total_earnings": 45000.00,
      "avg_project_value": 1500.00,
      "total_reviews": 25,
      "avg_rating": 4.8
    },
    "reviews": [
      {
        "review_id": 1,
        "client_name": "John Doe",
        "rating": 5,
        "comment": "Excellent work on our wedding video!",
        "created_at": "2025-09-01T00:00:00Z"
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
  "message": "Videographer not found",
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
2. **Role-based Access:** Different endpoints require different user roles (VIDEOGRAPHER for profile management, general authentication for discovery)
3. **Validation:** Profile update requests are validated using FreelancerUpdateDto
4. **Public Discovery:** Endpoints like `/getvideographers` and `/top-rated` allow authenticated users to discover videographers
5. **Profile Data:** Videographer profiles include specialized fields like equipment, specialization, hourly rates, and portfolio information
6. **Statistics:** Comprehensive statistics available for videographers to track their performance and earnings
7. **Response Structure:** All responses follow the standard API response format with `success`, `data`, and `meta` fields