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
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
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
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zip_code": "10001",
      "website": "https://abc.com",
      "bio": "Company description",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
  }
}
```

---

### 3. Update Profile
**PATCH** `/clients/profile`

**Required Roles:** CLIENT

**Description:** Update the current authenticated client's profile information.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "ABC Corporation",
  "phone": "+1234567890",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zip_code": "10001",
  "website": "https://abc-corp.com",
  "bio": "Updated company description"
}
```

**Validation:** All fields are optional. Uses ClientUpdateDto validation.

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
      "phone": "+1234567890",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zip_code": "10001",
      "website": "https://abc-corp.com",
      "bio": "Updated company description",
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

### 4. Get Profile Statistics
**GET** `/clients/profile/stats`

**Required Roles:** CLIENT

**Description:** Get statistics and metrics for the current authenticated client.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_projects": 15,
      "active_projects": 5,
      "completed_projects": 10,
      "total_spent": 25000.00,
      "avg_project_cost": 1666.67,
      "total_reviews": 8,
      "avg_rating": 4.5
    }
  },
  "meta": {
    "timestamp": "2025-10-18T10:00:00Z",
    "version": "v1"
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
  "business_license": "https://example.com/license.pdf",
  "tax_id": "https://example.com/tax-id.pdf",
  "insurance_certificate": "https://example.com/insurance.pdf",
  "other_documents": [
    "https://example.com/doc1.pdf",
    "https://example.com/doc2.pdf"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Business documents updated successfully",
  "data": {
    "documents": {
      "business_license": "https://example.com/license.pdf",
      "tax_id": "https://example.com/tax-id.pdf",
      "insurance_certificate": "https://example.com/insurance.pdf",
      "other_documents": [
        "https://example.com/doc1.pdf",
        "https://example.com/doc2.pdf"
      ],
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
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zip_code": "10001",
      "website": "https://abc.com",
      "bio": "Company description",
      "business_documents": {
        "business_license": "https://example.com/license.pdf",
        "tax_id": "https://example.com/tax-id.pdf"
      },
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "stats": {
      "total_projects": 15,
      "active_projects": 5,
      "completed_projects": 10
    }
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
  "message": "Client not found",
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
      "field": "email",
      "message": "Invalid email format"
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
2. **Role-based Access:** Different endpoints require different user roles
3. **Validation:** Profile update requests are validated using ClientUpdateDto
4. **File Uploads:** Document endpoints expect file URLs (upload handling done separately)
5. **Response Structure:** All responses follow the standard API response format with `success`, `data`, and `meta` fields