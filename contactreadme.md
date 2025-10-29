# Contact Form Feature - Backend API Requirements

## Overview
The contact form allows users (visitors, potential clients, or customers) to send inquiries, questions, or messages directly to the company. Currently implemented using EmailJS on the frontend, this document outlines the requirements to implement this feature through backend APIs.

## Current Implementation
- **Frontend:** Contact form in `/contact` page using EmailJS service
- **Flow:** Frontend → EmailJS → Email sent to `info@makemyvid.io`
- **Fields:** Name*, Email*, Subject (optional), Message*

## Required Backend APIs

### 1. Contact Form Submission API
**Endpoint:** `POST /api/v1/contact/submit`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "subject": "string (optional)",
  "message": "string"
}
```

**Validation Rules:**
- `name`: Required, string, max 255 characters
- `email`: Required, valid email format, max 255 characters
- `subject`: Optional, string, max 255 characters
- `message`: Required, string, max 2000 characters

**Response (Success):**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Error message"
  }
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Validation error
- `429`: Rate limit exceeded
- `500`: Server error

## Backend Implementation Requirements

### 1. Email Service Integration
Choose one of the following email services:
- **SendGrid** (recommended)
- **Mailgun**
- **AWS SES**
- **NodeMailer** with SMTP

### 2. Email Template
Subject: `{subject || "Contact Form Inquiry"}`

Body:
```
New contact form submission from {name}

Email: {email}
Subject: {subject}
Message:
{message}

Sent at: {timestamp}
```

### 3. Security & Validation
- **Input Sanitization:** Sanitize all inputs to prevent XSS
- **Rate Limiting:** Implement rate limiting (e.g., 5 submissions per hour per IP)
- **Spam Protection:** Consider CAPTCHA integration
- **CORS:** Allow requests from frontend domain

### 4. Error Handling
- Log all submissions and errors
- Send appropriate error responses
- Handle email service failures gracefully

## Database Schema (Optional - for storing submissions)

```sql
CREATE TABLE contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'responded', 'closed') DEFAULT 'pending',
  notes TEXT
);

-- Indexes
CREATE INDEX idx_contact_email ON contact_submissions(email);
CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_submitted_at ON contact_submissions(submitted_at);
```

## Optional Enhancements

### 1. Contact History API (Admin Dashboard)
**Endpoint:** `GET /api/v1/admin/contact/messages`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (pending/responded/closed)
- `search`: Search in name/email/subject

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### 2. Update Contact Status API
**Endpoint:** `PATCH /api/v1/admin/contact/{id}/status`

**Request Body:**
```json
{
  "status": "responded",
  "notes": "Responded via email on 2025-10-28"
}
```

### 3. Contact Categories
Predefined subjects to help categorize inquiries:
- General Inquiry
- Technical Support
- Partnership
- Billing
- Bug Report
- Feature Request

### 4. File Attachments
Allow users to attach files (images, documents) to their messages.

### 5. Auto-Reply Feature
Send an automatic confirmation email to the user after successful submission.

## Frontend Integration

### Current Contact Form Location
- File: `/src/app/components/forms/contact-form.tsx`
- Replace EmailJS implementation with API call

### API Integration Code
```javascript
const submitContactForm = async (formData) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/contact/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      notifySuccess('Your message sent successfully');
      resetForm();
    } else {
      notifyError(result.message);
    }
  } catch (error) {
    notifyError('Failed to send message. Please try again.');
  }
};
```

## Testing Requirements

### Unit Tests
- Form validation
- API request/response handling
- Error scenarios

### Integration Tests
- Email sending functionality
- Database operations (if storing submissions)
- Rate limiting

### Manual Testing
- Form submission with all field combinations
- Email delivery verification
- Admin dashboard (if implemented)

## Deployment Considerations

### Environment Variables
```env
# Email Service Configuration
EMAIL_SERVICE_API_KEY=your_api_key
EMAIL_FROM=info@makemyvid.io
EMAIL_TO=info@makemyvid.io

# Database (if storing submissions)
DATABASE_URL=your_database_url

# Rate Limiting
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=5
```

### Monitoring
- Email delivery rates
- Form submission volumes
- Error rates
- Response times

## Security Considerations

1. **Input Validation:** Both client and server-side validation
2. **Rate Limiting:** Prevent abuse/spam
3. **HTTPS:** Ensure all communications are encrypted
4. **Data Privacy:** Handle user data according to privacy regulations
5. **Logging:** Log submissions without storing sensitive data unnecessarily

## Performance Considerations

1. **Async Email Sending:** Don't block API response on email sending
2. **Queue System:** Use message queues for high-volume scenarios
3. **Caching:** Cache email templates if needed
4. **Database Indexing:** Proper indexes for admin queries

## Maintenance

1. **Email Service Monitoring:** Monitor delivery rates and bounce rates
2. **Database Cleanup:** Regular cleanup of old submissions if storing
3. **Template Updates:** Easy way to update email templates
4. **Admin Interface:** Dashboard for managing submissions

---

**Note:** This document provides a complete specification for implementing the contact form feature on the backend. The implementation should prioritize security, reliability, and user experience.</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_frontend/CONTACT_FORM_BACKEND_API_README.md