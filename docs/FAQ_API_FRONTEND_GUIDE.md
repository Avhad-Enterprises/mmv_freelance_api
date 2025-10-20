# FAQ API Documentation

## Overview
The FAQ (Frequently Asked Questions) API provides endpoints for managing and retrieving FAQ entries. Public endpoints allow users to view FAQs without authentication, while administrative endpoints require proper authentication and role-based permissions.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
- **Public Endpoints**: No authentication required
- **Admin Endpoints**: Requires `SUPER_ADMIN` or `ADMIN` role with valid JWT token

## Endpoints

### 1. Get All FAQs (Public)
**Endpoint:** `GET /faq`

**Purpose:** Retrieve all active FAQ entries for public display.

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "faq_id": 1,
      "question": "How do I create a project posting?",
      "answer": "To create a project posting, log in to your account, go to the dashboard, and click 'Post New Project'. Fill in the project details, budget, and requirements.",
      "type": "general",
      "tags": ["projects", "posting"],
      "is_active": true,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "message": "FAQs retrieved successfully"
}
```

**Notes:**
- Returns only active FAQs (`is_active = true`)
- Excludes soft-deleted FAQs (`is_deleted = false`)
- Ordered by creation date (newest first)

### 2. Get FAQ by ID (Public)
**Endpoint:** `GET /faq/:id`

**Purpose:** Retrieve a specific FAQ entry by its ID.

**Authentication:** None required

**Parameters:**
- `id` (path): FAQ ID number

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "faq_id": 1,
    "question": "How do I create a project posting?",
    "answer": "To create a project posting, log in to your account, go to the dashboard, and click 'Post New Project'. Fill in the project details, budget, and requirements.",
    "type": "general",
    "tags": ["projects", "posting"],
    "is_active": true,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  },
  "message": "FAQ retrieved successfully"
}
```

**Error Responses:**
- `400`: Invalid FAQ ID format
- `404`: FAQ not found

### 3. Create FAQ (Admin Only)
**Endpoint:** `POST /faq`

**Purpose:** Create a new FAQ entry.

**Authentication:** Required (`SUPER_ADMIN` or `ADMIN` role)

**Request Body:**
```json
{
  "question": "How do I reset my password?",
  "answer": "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email.",
  "type": "account",
  "tags": ["password", "reset", "account"],
  "is_active": true
}
```

**Required Fields:**
- `question`: The FAQ question (string, required)
- `answer`: The FAQ answer (string, required)

**Optional Fields:**
- `type`: FAQ category/type (string, default: "general")
- `tags`: Array of tags (string[], optional)
- `is_active`: Whether FAQ is active (boolean, default: true)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "faq_id": 2,
    "question": "How do I reset my password?",
    "answer": "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email.",
    "type": "account",
    "tags": ["password", "reset", "account"],
    "is_active": true,
    "created_by": 1,
    "created_at": "2025-01-20T14:30:00.000Z",
    "updated_at": "2025-01-20T14:30:00.000Z"
  },
  "message": "FAQ created successfully"
}
```

**Error Responses:**
- `400`: Validation error (missing required fields)
- `401`: Authentication required
- `403`: Insufficient permissions

### 4. Update FAQ (Admin Only)
**Endpoint:** `PUT /faq`

**Purpose:** Update an existing FAQ entry.

**Authentication:** Required (`SUPER_ADMIN` or `ADMIN` role)

**Request Body:**
```json
{
  "faq_id": 2,
  "question": "How do I reset my account password?",
  "answer": "Click on 'Forgot Password' on the login page, enter your registered email address, and follow the instructions sent to your email to reset your password.",
  "type": "account",
  "tags": ["password", "reset", "account", "security"],
  "is_active": true
}
```

**Required Fields:**
- `faq_id`: The ID of the FAQ to update (number, required)

**Optional Fields:**
- Any field from the create request can be updated

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "faq_id": 2,
    "question": "How do I reset my account password?",
    "answer": "Click on 'Forgot Password' on the login page, enter your registered email address, and follow the instructions sent to your email to reset your password.",
    "type": "account",
    "tags": ["password", "reset", "account", "security"],
    "is_active": true,
    "updated_by": 1,
    "updated_at": "2025-01-20T15:00:00.000Z"
  },
  "message": "FAQ updated successfully"
}
```

**Error Responses:**
- `400`: Missing FAQ ID or validation error
- `401`: Authentication required
- `403`: Insufficient permissions
- `404`: FAQ not found

### 5. Delete FAQ (Admin Only)
**Endpoint:** `DELETE /faq`

**Purpose:** Soft delete an FAQ entry (marks as deleted).

**Authentication:** Required (`SUPER_ADMIN` or `ADMIN` role)

**Request Body:**
```json
{
  "faq_id": 2
}
```

**Required Fields:**
- `faq_id`: The ID of the FAQ to delete (number, required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "faq_id": 2,
    "question": "How do I reset my account password?",
    "answer": "Click on 'Forgot Password' on the login page...",
    "is_deleted": true,
    "deleted_by": 1,
    "deleted_at": "2025-01-20T16:00:00.000Z"
  },
  "message": "FAQ deleted successfully"
}
```

**Error Responses:**
- `400`: Missing FAQ ID
- `401`: Authentication required
- `403`: Insufficient permissions
- `404`: FAQ not found

## Data Types

### FAQ Object
```typescript
interface FAQ {
  faq_id?: number;
  question: string;
  answer: string;
  type?: string;
  tags?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  deleted_at?: string;
  is_deleted?: boolean;
}
```

## Frontend Usage Examples

### Fetch All FAQs
```javascript
const fetchFAQs = async () => {
  try {
    const response = await fetch('/api/v1/faq');
    const data = await response.json();

    if (data.success) {
      console.log('FAQs:', data.data);
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error);
  }
};
```

### Create FAQ (Admin)
```javascript
const createFAQ = async (faqData, token) => {
  try {
    const response = await fetch('/api/v1/faq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(faqData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating FAQ:', error);
  }
};
```

### Update FAQ (Admin)
```javascript
const updateFAQ = async (faqData, token) => {
  try {
    const response = await fetch('/api/v1/faq', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(faqData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating FAQ:', error);
  }
};
```

### Delete FAQ (Admin)
```javascript
const deleteFAQ = async (faqId, token) => {
  try {
    const response = await fetch('/api/v1/faq', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ faq_id: faqId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting FAQ:', error);
  }
};
```

## Testing

Run the FAQ test suite:
```bash
# Run all FAQ tests
node tests/faq/run-faq-tests.js

# Run specific test
node tests/faq/test-get-all-faqs.js
node tests/faq/test-get-faq-by-id.js
node tests/faq/test-create-faq.js
node tests/faq/test-update-faq.js
node tests/faq/test-delete-faq.js
```

## Error Handling

All endpoints follow consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "meta": {
    "timestamp": "2025-01-20T16:00:00.000Z",
    "version": "v1"
  }
}
```

## Notes

- **Soft Deletes**: Deleted FAQs are marked as `is_deleted = true` and `deleted_at` timestamp, but remain in the database
- **Audit Trail**: All create/update/delete operations track the user who performed the action
- **Public Access**: Read operations (GET) are public, write operations (POST/PUT/DELETE) require admin authentication
- **Data Validation**: All inputs are validated using class-validator decorators
- **Ordering**: FAQs are returned ordered by creation date (newest first)