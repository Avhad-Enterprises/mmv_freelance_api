# User Profile Update APIs Documentation

This document provides comprehensive information about all user profile update endpoints in the MMV Freelance API. The API now provides unified endpoints where role-specific APIs can update both user basic information and role-specific profile data in a single request.

## Overview

The API provides 3 unified update endpoints:

1. **Client Profile** (`/clients/profile`) - **UNIFIED**: Updates both user info and client-specific business information
2. **Videographer Profile** (`/videographers/profile`) - **UNIFIED**: Updates both user info and videographer professional information
3. **Video Editor Profile** (`/videoeditors/profile`) - **UNIFIED**: Updates both user info and video editor professional information

## Key Changes (v2.0)

- **Unified Updates**: Role-specific endpoints now accept both user table fields and profile table fields
- **Single API Call**: Frontend can now update all profile information with one request per role
- **Backward Compatibility**: All existing fields remain supported
- **Optional Fields**: All fields remain optional - only provided fields are updated

## Authentication

All endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Update Client Profile

**Endpoint:** `PATCH /api/v1/clients/profile`

**Required Roles:** CLIENT

**Description:** **UNIFIED ENDPOINT** - Updates both user basic information (users table) and client-specific profile information (client_profiles table) in a single request. This eliminates the need for separate calls to `/users/me` and `/clients/profile`.

### Request Body (All fields optional - mix user and profile fields as needed)
```json
{
  // User Table Fields (same as /users/me endpoint)
  "first_name": "string",
  "last_name": "string",
  "username": "string",
  "email": "string",
  "phone_number": "string",
  "phone_verified": "boolean",
  "email_verified": "boolean",
  "profile_picture": "string (URL)",
  "bio": "string",
  "timezone": "string",
  "address_line_first": "string",
  "address_line_second": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "email_notifications": "boolean",

  // Client Profile Fields (client_profiles table)
  "company_name": "string",
  "industry": "film_production | ad_agency | marketing | events | real_estate | education | e_commerce | technology | entertainment | corporate | other",
  "website": "string (URL)",
  "social_links": "object | string",
  "company_size": "1-10 | 11-50 | 51-200 | 201-500 | 500+",
  "required_services": "string[]",
  "required_skills": "string[]",
  "required_editor_proficiencies": "string[]",
  "required_videographer_proficiencies": "string[]",
  "budget_min": "number (minimum: 0)",
  "budget_max": "number (minimum: 0)",
  "tax_id": "string",
  "business_documents": "string[]",
  "work_arrangement": "remote | on_site | hybrid",
  "project_frequency": "one_time | recurring | long_term | ongoing",
  "hiring_preferences": "object",
  "expected_start_date": "string",
  "project_duration": "less_than_1_month | 1_3_months | 3_6_months | 6_months_plus",
  "payment_method": "object"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Client profile updated successfully",
  "data": {
    "user": {
      "user_id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "phone_number": "+1234567890",
      "phone_verified": true,
      "email_verified": true,
      "profile_picture": "https://example.com/avatar.jpg",
      "bio": "Professional client",
      "timezone": "America/New_York",
      "address_line_first": "123 Main St",
      "address_line_second": "Suite 100",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001",
      "email_notifications": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-10-20T10:00:00Z"
    },
    "profile": {
      "client_id": 1,
      "user_id": 2,
      "company_name": "ABC Productions LLC",
      "industry": "film_production",
      "website": "https://abcproductions.com",
      "social_links": {
        "linkedin": "https://linkedin.com/company/abc-productions",
        "twitter": "@abcproductions"
      },
      "company_size": "11-50",
      "required_services": ["video_editing", "videography"],
      "required_skills": ["cinematography", "color_grading"],
      "required_editor_proficiencies": ["Adobe Premiere", "After Effects"],
      "required_videographer_proficiencies": ["Canon EOS R5", "Professional Lighting"],
      "budget_min": 5000,
      "budget_max": 25000,
      "business_documents": ["https://example.com/doc1.pdf"],
      "work_arrangement": "remote",
      "project_frequency": "recurring",
      "hiring_preferences": {
        "preferred_communication": "email",
        "response_time_expectation": "24_hours"
      },
      "expected_start_date": "2025-11-01",
      "project_duration": "3_6_months",
      "payment_method": {
        "type": "bank_transfer",
        "currency": "USD"
      },
      "tax_id": "TAX123456",
      "projects_created": [],
      "total_spent": 0,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-10-20T10:00:00Z"
    },
    "userType": "CLIENT"
  },
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

---

## 2. Update Videographer Profile

**Endpoint:** `PATCH /api/v1/videographers/profile`

**Required Roles:** VIDEOGRAPHER

**Description:** **UNIFIED ENDPOINT** - Updates both user basic information (users table) and videographer-specific profile information (freelancer_profiles table) in a single request. This eliminates the need for separate calls to `/users/me` and `/videographers/profile`.

### Request Body (All fields optional - mix user and profile fields as needed)
```json
{
  // User Table Fields (same as /users/me endpoint)
  "first_name": "string",
  "last_name": "string",
  "username": "string",
  "email": "string",
  "phone_number": "string",
  "phone_verified": "boolean",
  "email_verified": "boolean",
  "profile_picture": "string (URL)",
  "bio": "string",
  "timezone": "string",
  "address_line_first": "string",
  "address_line_second": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "email_notifications": "boolean",

  // Videographer Profile Fields (freelancer_profiles table)
  "profile_title": "string",
  "role": "string",
  "short_description": "string",
  "experience_level": "entry | intermediate | expert | master",
  "skills": "string[]",
  "software_skills": "string[]",
  "superpowers": "string[]",
  "skill_tags": "string[]",
  "base_skills": "string[]",
  "languages": "string[]",
  "portfolio_links": "string[]",
  "certification": "object",
  "education": "object",
  "previous_works": "object",
  "services": "object",
  "rate_amount": "number (minimum: 0)",
  "currency": "string",
  "availability": "string",
  "work_type": "string",
  "hours_per_week": "string",
  "id_type": "string",
  "id_document_url": "string",
  "kyc_verified": "boolean",
  "aadhaar_verification": "boolean",
  "payment_method": "object",
  "bank_account_info": "object"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": 3,
      "first_name": "Mike",
      "last_name": "Johnson",
      "username": "mikejohnson",
      "email": "mike@example.com",
      "phone_number": "+1234567890",
      "phone_verified": true,
      "email_verified": true,
      "profile_picture": "https://example.com/avatar.jpg",
      "bio": "Professional videographer",
      "timezone": "America/Los_Angeles",
      "address_line_first": "456 Hollywood Blvd",
      "address_line_second": null,
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA",
      "pincode": "90210",
      "email_notifications": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-10-20T10:00:00Z"
    },
    "profile": {
      "freelancer_id": 2,
      "user_id": 3,
      "profile_title": "Senior Wedding Videographer",
      "role": "Lead Videographer",
      "short_description": "Award-winning videographer specializing in weddings",
      "experience_level": "expert",
      "skills": ["cinematography", "lighting", "post-production"],
      "superpowers": ["creative storytelling", "technical expertise"],
      "skill_tags": ["wedding", "corporate", "event"],
      "base_skills": ["Canon EOS R5", "DJI Ronin"],
      "languages": ["English", "Spanish"],
      "portfolio_links": ["https://vimeo.com/mikejohnson"],
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
      "updated_at": "2025-10-20T10:00:00Z",
      "videographer": null
    },
    "userType": "VIDEOGRAPHER"
  },
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

---

## 3. Update Video Editor Profile

**Endpoint:** `PATCH /api/v1/videoeditors/profile`

**Required Roles:** VIDEO_EDITOR

**Description:** **UNIFIED ENDPOINT** - Updates both user basic information (users table) and video editor-specific profile information (freelancer_profiles table) in a single request. This eliminates the need for separate calls to `/users/me` and `/videoeditors/profile`.

### Request Body (All fields optional - mix user and profile fields as needed)
```json
{
  // User Table Fields (same as /users/me endpoint)
  "first_name": "string",
  "last_name": "string",
  "username": "string",
  "email": "string",
  "phone_number": "string",
  "phone_verified": "boolean",
  "email_verified": "boolean",
  "profile_picture": "string (URL)",
  "bio": "string",
  "timezone": "string",
  "address_line_first": "string",
  "address_line_second": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "email_notifications": "boolean",

  // Video Editor Profile Fields (freelancer_profiles table)
  "profile_title": "string",
  "role": "string",
  "short_description": "string",
  "experience_level": "entry | intermediate | expert | master",
  "skills": "string[]",
  "software_skills": "string[]",
  "superpowers": "string[]",
  "skill_tags": "string[]",
  "base_skills": "string[]",
  "languages": "string[]",
  "portfolio_links": "string[]",
  "certification": "object",
  "education": "object",
  "previous_works": "object",
  "services": "object",
  "rate_amount": "number (minimum: 0)",
  "currency": "string",
  "availability": "string",
  "work_type": "string",
  "hours_per_week": "string",
  "id_type": "string",
  "id_document_url": "string",
  "kyc_verified": "boolean",
  "aadhaar_verification": "boolean",
  "payment_method": "object",
  "bank_account_info": "object"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": 4,
      "first_name": "Sarah",
      "last_name": "Davis",
      "username": "sarahdavis",
      "email": "sarah@example.com",
      "phone_number": "+1234567890",
      "phone_verified": true,
      "email_verified": true,
      "profile_picture": "https://example.com/avatar.jpg",
      "bio": "Professional video editor",
      "timezone": "America/New_York",
      "address_line_first": "789 Editing St",
      "address_line_second": "Floor 5",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001",
      "email_notifications": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-10-20T10:00:00Z"
    },
    "profile": {
      "freelancer_id": 3,
      "user_id": 4,
      "profile_title": "Senior Video Editor",
      "role": "Lead Editor",
      "short_description": "Award-winning video editor specializing in corporate content",
      "experience_level": "expert",
      "skills": ["video_editing", "color_grading", "motion_graphics"],
      "superpowers": ["creative editing", "technical expertise"],
      "skill_tags": ["corporate", "commercial", "documentary"],
      "base_skills": ["Adobe Premiere", "After Effects"],
      "languages": ["English", "French"],
      "portfolio_links": ["https://behance.net/sarah-davis"],
      "rate_amount": 95.00,
      "currency": "USD",
      "availability": "full-time",
      "work_type": "remote",
      "hours_per_week": "30_40",
      "hire_count": 35,
      "total_earnings": 55000.00,
      "time_spent": 2400,
      "projects_applied": [1, 2, 3, 4],
      "projects_completed": [1, 2, 3],
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-10-20T10:00:00Z",
      "videoeditor": null
    },
    "userType": "VIDEO_EDITOR"
  },
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

---

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    },
    {
      "field": "rate_amount",
      "message": "rate_amount must be a positive number"
    }
  ],
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication token missing",
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

---

## Validation Rules

### Common Validation Rules
- **All fields are optional** - Only provided fields will be updated
- **String fields** - Must be non-empty strings when provided
- **Email fields** - Must be valid email format
- **URL fields** - Must be valid URLs
- **Number fields** - Must be valid numbers, with minimum constraints where specified
- **Array fields** - Must be arrays or JSON-parseable strings
- **Boolean fields** - Must be true/false values
- **Enum fields** - Must match one of the allowed values

### Field-Specific Validation
- `rate_amount`: Must be ≥ 0
- `budget_min`, `budget_max`: Must be ≥ 0
- `email`: Must be valid email format
- `profile_picture`, `website`: Must be valid URLs
- `phone_number`: String format (no specific validation)

---

## Notes

1. **Unified Updates (v2.0)**: Role-specific endpoints now handle both user and profile table updates in a single request, improving frontend UX by reducing API calls.

2. **Flexible Updates**: Since all fields are optional, you can update any combination of user and profile fields in a single request.

3. **Data Types**: Array and object fields can be sent as JSON objects or JSON-parseable strings.

4. **Role-Based Access**: Each profile update endpoint requires the appropriate user role.

5. **Response Consistency**: All successful responses follow the same structure with `success`, `message`, `data`, and `meta` fields.

6. **Error Handling**: Comprehensive validation with detailed error messages for debugging.

7. **Security**: All updates are performed with proper authentication and authorization checks.</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/USER_PROFILE_UPDATE_APIS.md