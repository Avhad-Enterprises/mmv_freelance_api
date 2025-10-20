# User Profile Update APIs Documentation

This document provides comprehensive information about all user profile update endpoints in the MMV Freelance API. The API follows a separation of concerns architecture where different endpoints update different database tables.

## Overview

The API provides 4 distinct update endpoints, each responsible for updating specific aspects of user profiles:

1. **User Basic Info** (`/users/me`) - Updates core user account information
2. **Client Profile** (`/clients/profile`) - Updates client-specific business information
3. **Videographer Profile** (`/videographers/profile`) - Updates videographer professional information
4. **Video Editor Profile** (`/videoeditors/profile`) - Updates video editor professional information

## Authentication

All endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Update User Basic Information

**Endpoint:** `PATCH /api/v1/users/me`

**Required Roles:** Any authenticated user

**Description:** Updates basic user account information stored in the `users` table. This includes identity, contact details, and general profile information.

### Request Body (All fields optional)
```json
{
  // Identity
  "first_name": "string",
  "last_name": "string",
  "username": "string",
  "email": "string",

  // Contact
  "phone_number": "string",
  "phone_verified": "boolean",
  "email_verified": "boolean",

  // Profile
  "profile_picture": "string (URL)",
  "bio": "string",
  "timezone": "string",

  // Address
  "address_line_first": "string",
  "address_line_second": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",

  // Notifications
  "email_notifications": "boolean"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "phone_verified": true,
      "email_verified": true,
      "profile_picture": "https://example.com/avatar.jpg",
      "bio": "Professional user",
      "timezone": "UTC",
      "address_line_first": "123 Main St",
      "address_line_second": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001",
      "email_notifications": true,
      "updated_at": "2025-10-20T10:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

---

## 2. Update Client Profile

**Endpoint:** `PATCH /api/v1/clients/profile`

**Required Roles:** CLIENT

**Description:** Updates client-specific profile information stored in the `client_profiles` table. This includes company details, business requirements, and hiring preferences.

### Request Body (All fields optional)
```json
{
  // Company Info
  "company_name": "string",
  "industry": "film_production | ad_agency | marketing | events | real_estate | education | e_commerce | technology | entertainment | corporate | other",
  "website": "string (URL)",
  "social_links": "object | string",
  "company_size": "1-10 | 11-50 | 51-200 | 201-500 | 500+",

  // Requirements
  "required_services": "string[]",
  "required_skills": "string[]",
  "required_editor_proficiencies": "string[]",
  "required_videographer_proficiencies": "string[]",

  // Budget
  "budget_min": "number (minimum: 0)",
  "budget_max": "number (minimum: 0)",

  // Business Details
  "tax_id": "string",
  "business_documents": "string[]",

  // Preferences
  "work_arrangement": "remote | on_site | hybrid",
  "project_frequency": "one_time | recurring | long_term | ongoing",
  "hiring_preferences": "object",
  "expected_start_date": "string",
  "project_duration": "less_than_1_month | 1_3_months | 3_6_months | 6_months_plus",

  // Payment
  "payment_method": "object"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "username": "janesmith",
      "email": "jane@example.com",
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
      "budget_min": 5000,
      "budget_max": 25000,
      "work_arrangement": "remote",
      "project_frequency": "recurring",
      "updated_at": "2025-10-20T10:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

---

## 3. Update Videographer Profile

**Endpoint:** `PATCH /api/v1/videographers/profile`

**Required Roles:** VIDEOGRAPHER

**Description:** Updates videographer-specific profile information stored in the `freelancer_profiles` table. This includes professional details, skills, pricing, and portfolio information.

### Request Body (All fields optional)
```json
{
  // Professional Info
  "profile_title": "string",
  "role": "string",
  "short_description": "string",
  "experience_level": "entry | intermediate | expert | master",

  // Skills & Expertise
  "skills": "string[]",
  "superpowers": "string[]",
  "skill_tags": "string[]",
  "base_skills": "string[]",
  "languages": "string[]",

  // Portfolio & Credentials
  "portfolio_links": "string[]",
  "certification": "object",
  "education": "object",
  "previous_works": "object",
  "services": "object",

  // Pricing & Availability
  "rate_amount": "number (minimum: 0)",
  "currency": "string",
  "availability": "string",
  "work_type": "string",
  "hours_per_week": "string",

  // Verification
  "id_type": "string",
  "id_document_url": "string",
  "kyc_verified": "boolean",
  "aadhaar_verification": "boolean",

  // Payment
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
      "company_name": "MJ Videography",
      "profile_title": "Senior Wedding Videographer",
      "role": "Lead Videographer",
      "short_description": "Award-winning videographer specializing in weddings",
      "experience_level": "expert",
      "skills": ["cinematography", "lighting", "post-production"],
      "superpowers": ["creative storytelling", "technical expertise"],
      "portfolio_links": ["https://vimeo.com/mikejohnson"],
      "rate_amount": 175.00,
      "currency": "USD",
      "availability": "part-time",
      "languages": ["English", "Spanish"],
      "updated_at": "2025-10-20T10:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-10-20T10:00:00Z",
    "version": "v1"
  }
}
```

---

## 4. Update Video Editor Profile

**Endpoint:** `PATCH /api/v1/videoeditors/profile`

**Required Roles:** VIDEO_EDITOR

**Description:** Updates video editor-specific profile information stored in the `freelancer_profiles` table. This includes professional details, editing skills, pricing, and portfolio information.

### Request Body (All fields optional)
```json
{
  // Professional Info
  "profile_title": "string",
  "role": "string",
  "short_description": "string",
  "experience_level": "entry | intermediate | expert | master",

  // Skills & Expertise
  "skills": "string[]",
  "superpowers": "string[]",
  "skill_tags": "string[]",
  "base_skills": "string[]",
  "languages": "string[]",

  // Portfolio & Credentials
  "portfolio_links": "string[]",
  "certification": "object",
  "education": "object",
  "previous_works": "object",
  "services": "object",

  // Pricing & Availability
  "rate_amount": "number (minimum: 0)",
  "currency": "string",
  "availability": "string",
  "work_type": "string",
  "hours_per_week": "string",

  // Verification
  "id_type": "string",
  "id_document_url": "string",
  "kyc_verified": "boolean",
  "aadhaar_verification": "boolean",

  // Payment
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
      "company_name": "SD Video Editing",
      "profile_title": "Senior Video Editor",
      "role": "Lead Editor",
      "short_description": "Award-winning video editor specializing in corporate content",
      "experience_level": "expert",
      "skills": ["video_editing", "color_grading", "motion_graphics"],
      "superpowers": ["creative editing", "technical expertise"],
      "portfolio_links": ["https://behance.net/sarah-davis"],
      "rate_amount": 95.00,
      "currency": "USD",
      "availability": "full-time",
      "languages": ["English", "French"],
      "updated_at": "2025-10-20T10:00:00Z"
    }
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

1. **Separation of Concerns**: Each endpoint updates only its designated database table to maintain clean data architecture.

2. **Partial Updates**: Since all fields are optional, you can update any subset of fields in a single request.

3. **Data Types**: Array and object fields can be sent as JSON objects or JSON-parseable strings.

4. **Role-Based Access**: Each profile update endpoint requires the appropriate user role.

5. **Response Consistency**: All successful responses follow the same structure with `success`, `message`, `data`, and `meta` fields.

6. **Error Handling**: Comprehensive validation with detailed error messages for debugging.

7. **Security**: All updates are performed with proper authentication and authorization checks.</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/USER_PROFILE_UPDATE_APIS.md