# Client API Documentation

## Overview
Client-specific endpoints for managing client profiles, statistics, and administrative operations. All endpoints require authentication.

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

### 1. Get All Clients
**GET** `/clients/getallclient`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Retrieve a list of all clients in the system.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "company_name": "ABC Corp",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### 2. Get My Profile
**GET** `/clients/profile`

**Required Roles:** CLIENT

**Description:** Get the current authenticated client's profile information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "company_name": "ABC Corp",
      "phone_number": "+1234567890",
      "address_line_first": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001",
      "website": "https://abc.com",
      "bio": "Company description",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "profile": {
      "company_name": "ABC Corp",
      "industry": "film_production",
      "website": "https://abc.com",
      "business_documents": ["https://example.com/doc1.pdf"]
    },
    "userType": "CLIENT"
  }
}
```

---

### 3. Update Profile
**PATCH** `/clients/profile`

**Required Roles:** CLIENT

**Description:** Update the current authenticated client's profile information. This endpoint only updates fields in the client_profiles table.

**Request Body:**
```json
{
  "company_name": "ABC Corporation",
  "industry": "film_production",
  "website": "https://abc-corp.com",
  "company_size": "11-50",
  "required_services": ["video_editing", "videography"],
  "required_skills": ["premiere_pro", "after_effects"],
  "budget_min": 1000,
  "budget_max": 5000,
  "business_documents": ["https://example.com/doc1.pdf"],
  "work_arrangement": "remote",
  "project_frequency": "recurring"
}
```

**Validation:** All fields are optional. Uses ClientProfileUpdateDto validation.

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "company_name": "ABC Corporation",
      "phone_number": "+1234567890",
      "address_line_first": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001",
      "website": "https://abc-corp.com",
      "bio": "Updated company description",
      "updated_at": "2025-10-18T10:00:00Z"
    },
    "profile": {
      "company_name": "ABC Corporation",
      "industry": "film_production",
      "website": "https://abc-corp.com",
      "company_size": "11-50",
      "required_services": ["video_editing", "videography"],
      "budget_min": 1000,
      "budget_max": 5000
    },
    "userType": "CLIENT"
  }
}
```

---

### 4. Get Profile Statistics
**GET** `/clients/profile/stats`

**Required Roles:** CLIENT

**Description:** Get statistics and metrics for the current authenticated client.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projects_created": [],
    "total_spent": 0,
    "active_projects": 0
  }
}
```

---

### 5. Update Business Documents
**PATCH** `/clients/profile/documents`

**Required Roles:** CLIENT

**Description:** Update business documents for the current authenticated client.

**Request Body:**
```json
{
  "document_urls": [
    "https://example.com/license.pdf",
    "https://example.com/tax-id.pdf",
    "https://example.com/insurance.pdf"
  ]
}
```

**Validation:** document_urls must be an array of strings.

**Response (200):**
```json
{
  "success": true,
  "message": "Business documents updated successfully"
}
```

---

### 6. Get Client by ID
**GET** `/clients/:id`

**Required Roles:** ADMIN, SUPER_ADMIN

**Description:** Get detailed information about a specific client by their user ID.

**Path Parameters:**
- `id` (number): The client's user ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "company_name": "ABC Corp",
      "phone_number": "+1234567890",
      "address_line_first": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001",
      "website": "https://abc.com",
      "bio": "Company description",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "profile": {
      "company_name": "ABC Corp",
      "industry": "film_production",
      "business_documents": ["https://example.com/doc1.pdf"]
    },
    "userType": "CLIENT"
  }
}
```

---

## Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication token missing"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Client not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed"
}
```

---

## Notes for Frontend Integration

1. **Authentication:** All requests must include the JWT token in the Authorization header
2. **Role-based Access:** Different endpoints require different user roles (CLIENT, ADMIN, SUPER_ADMIN)
3. **Validation:** Profile update requests are validated using ClientProfileUpdateDto with support for arrays and enums
4. **Document Uploads:** Business documents are stored as an array of URLs in the `business_documents` field
5. **Response Structure:** All responses follow the standard API response format with `success`, `data`, and optional `message` fields
6. **Separation of Concerns:** `/clients/profile` only updates client_profiles table fields. Use `/users/me` to update basic user information (users table)