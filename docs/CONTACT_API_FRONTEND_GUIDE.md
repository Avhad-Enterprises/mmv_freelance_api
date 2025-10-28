# Contact Form API Documentation

## Overview
The Contact Form API allows users to submit inquiries and messages to the company. The API includes both public endpoints for form submission and admin-only endpoints for managing submissions.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
- **Public endpoints**: No authentication required
- **Admin endpoints**: Require SUPER_ADMIN or ADMIN role with Bearer token

---

## Public Endpoints

### 1. Submit Contact Form
**Endpoint:** `POST /contact/submit`

**Description:** Allows users to submit contact form inquiries.

**Request Body:**
```json
{
  "name": "string (required, max 255 chars)",
  "email": "string (required, valid email, max 255 chars)",
  "subject": "string (optional, max 255 chars)",
  "message": "string (required, max 2000 chars)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/v1/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "General Inquiry",
    "message": "Hello, I am interested in your video production services."
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully. You will receive a confirmation email shortly.",
  "data": {
    "contact_id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "General Inquiry",
    "message": "Hello, I am interested in your video production services.",
    "status": "pending",
    "created_at": "2025-10-28T13:33:25.681Z"
  }
}
```

**Error Responses:**
- **400 Bad Request**: Validation errors
```json
{
  "success": false,
  "message": "email must be an email, message should not be empty, message must be shorter than or equal to 2000 characters",
  "meta": {
    "timestamp": "2025-10-28T13:33:25.681Z",
    "version": "v1"
  }
}
```

---

## Admin Endpoints

### 2. Get All Contact Submissions
**Endpoint:** `GET /contact/messages`

**Description:** Retrieve all contact submissions with pagination (Admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (pending, responded, closed)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/contact/messages?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "contact_id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "subject": "General Inquiry",
        "message": "Hello, I am interested in your services.",
        "ip_address": "::1",
        "user_agent": "Mozilla/5.0...",
        "status": "pending",
        "notes": null,
        "is_active": true,
        "created_at": "2025-10-28T13:33:25.681Z",
        "updated_at": "2025-10-28T13:33:25.681Z",
        "is_deleted": false,
        "responded_at": null,
        "closed_at": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "message": "Contact submissions retrieved successfully"
}
```

### 3. Get Contact Submission by ID
**Endpoint:** `GET /contact/messages/:id`

**Description:** Retrieve a specific contact submission by ID (Admin only).

**Path Parameters:**
- `id`: Contact submission ID (number)

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/v1/contact/messages/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "contact_id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "General Inquiry",
    "message": "Hello, I am interested in your services.",
    "ip_address": "::1",
    "user_agent": "Mozilla/5.0...",
    "status": "pending",
    "notes": null,
    "is_active": true,
    "created_at": "2025-10-28T13:33:25.681Z",
    "updated_at": "2025-10-28T13:33:25.681Z",
    "is_deleted": false,
    "responded_at": null,
    "closed_at": null
  },
  "message": "Contact submission retrieved successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Contact submission not found"
}
```

### 4. Update Contact Status
**Endpoint:** `PATCH /contact/messages/:id/status`

**Description:** Update the status of a contact submission (Admin only).

**Path Parameters:**
- `id`: Contact submission ID (number)

**Request Body:**
```json
{
  "status": "pending|responded|closed",
  "notes": "Optional notes about the update"
}
```

**Example Request:**
```bash
curl -X PATCH http://localhost:8000/api/v1/contact/messages/1/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "responded",
    "notes": "Responded via email on 2025-10-28"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "contact_id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "General Inquiry",
    "message": "Hello, I am interested in your services.",
    "status": "responded",
    "notes": "Responded via email on 2025-10-28",
    "responded_at": "2025-10-28T14:00:00.000Z",
    "updated_at": "2025-10-28T14:00:00.000Z"
  },
  "message": "Contact status updated successfully"
}
```

---

## Email Notifications

When a contact form is submitted successfully, an email is automatically sent to `harshalpatilself@gmail.com` with the following format:

**Subject:** `Contact Form: {subject}` or `Contact Form Inquiry` (if no subject provided)

**Email Body:**
```
New Contact Form Submission

Contact Details:
Name: John Doe
Email: john.doe@example.com
Subject: General Inquiry (if provided)
Submitted: 2025-10-28T13:33:25.681Z
IP Address: ::1 (if available)

Message:
Hello, I am interested in your video production services.

---
This message was sent from the MMV Freelance contact form.
```

**Note:** Email sending is non-blocking and will not affect the API response if email delivery fails.

---

## Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Testing

### Run Contact Form Tests
```bash
# Test public contact submission
node tests/contact/test-contact-submit.js

# Test admin contact management
node tests/contact/test-contact-admin.js

# Run all contact tests
node tests/contact/run-contact-tests.js
```

### Test Data
- **Admin Login**: `testadmin@example.com` / `TestAdmin123!`
- **Test Contact**: Any valid name, email, and message

---

## Database Schema

The contact submissions are stored in the `contact_submissions` table:

```sql
CREATE TABLE contact_submissions (
  contact_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status ENUM('pending', 'responded', 'closed') DEFAULT 'pending',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  responded_at TIMESTAMP,
  closed_at TIMESTAMP
);
```

---

## Security Features

1. **Input Validation**: Server-side validation for all inputs using class-validator
2. **XSS Prevention**: Input sanitization and validation constraints
3. **Rate Limiting**: Planned for future implementation (5 submissions/hour/IP)
4. **Authentication**: Admin endpoints require SUPER_ADMIN or ADMIN role with Bearer token
5. **Audit Trail**: All submissions tracked with timestamps and IP addresses
6. **Non-blocking Email**: Email notifications are sent asynchronously and won't block API responses

---

## Future Enhancements

- [x] Auto-reply feature for users (implemented)
- [ ] Rate limiting implementation
- [ ] File attachment support
- [ ] Contact categories/tags
- [ ] Bulk operations for admins
- [ ] Analytics and reporting
- [ ] Email delivery status tracking