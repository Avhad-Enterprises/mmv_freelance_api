# MMV Freelance API - Authentication & Registration Documentation

## 🚀 Quick Start for Frontend Developers

This document provides the **definitive API specification** for integrating with the MMV Freelance backend authentication system. All endpoints, request/response formats, and field specifications are documented here.

---

## 📋 Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Login API](#login-api)
3. [Registration API](#registration-api)
4. [Response Format](#response-format)
5. [Field Specifications](#field-specifications)
6. [Error Handling](#error-handling)
7. [File Upload Guidelines](#file-upload-guidelines)
8. [Testing & Examples](#testing--examples)

---

## 🔗 Base URL & Authentication

**Base URL:** `http://localhost:8000/api/v1` (Development)  
**Production URL:** `[TO_BE_PROVIDED]/api/v1`

**Authentication:** JWT Token  
**Header:** `Authorization: Bearer <token>`

---

## 🔐 Login API

### Endpoint
```
POST /api/v1/auth/login
```

### Request Body
```typescript
{
  email: string;      // Can be email OR username
  password: string;   // Minimum 6 characters
}
```

### Request Example
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 123,
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "account_type": "freelancer",
      "is_active": true,
      "email_verified": false,
      "phone_verified": false,
      "created_at": "2025-10-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "redirectUrl": "/dashboard/candidate-dashboard"
  },
  "meta": {
    "timestamp": "2025-10-01T10:30:00.000Z",
    "version": "v1"
  }
}
```

### Redirect URLs
- **Freelancers:** `/dashboard/candidate-dashboard`
- **Clients:** `/dashboard/employ-dashboard`

---

## 📝 Registration API

### Endpoint
```
POST /api/v1/auth/register
```

### Content Type
```
multipart/form-data
```

### Rate Limiting
- **3 registration attempts per hour per IP**
- **5MB file size limit**

---

## 👨‍💼 Freelancer Registration

### Complete Request Body
```typescript
{
  // Step 1: Basic Information
  username: string;               // Required, min 3 characters
  first_name: string;             // Required
  last_name: string;              // Required
  email: string;                  // Required, valid email
  password: string;               // Required, min 6 characters
  account_type: "freelancer";     // Required

  // Step 2: Professional Information
  profile_title: string;          // Required
  skills: string[];               // Required, min 1 skill
  experience_level: string;       // Required: "entry" | "intermediate" | "expert" | "master"
  portfolio_links?: string;       // Optional, URL format
  hourly_rate: number;            // Required, range: 100-10000

  // Step 3: Contact & Location
  phone_number: string;           // Required, 10 digits
  street_address: string;         // Required
  country: string;                // Required, ISO country code
  state: string;                  // Required, ISO state code
  city: string;                   // Required
  zip_code: string;               // Required, 6 digits
  id_type: string;                // Required: "passport" | "driving_license" | "national_id"
  id_document: File;              // Required, image/* or .pdf

  // Step 4: Work Preferences
  availability: string;           // Required: "full_time" | "part_time" | "flexible" | "on_demand"
  hours_per_week: string;         // Required: "less_than_20" | "20_30" | "30_40" | "more_than_40"
  work_type: string;              // Required: "remote" | "on_site" | "hybrid"
  languages: string[];            // Required, min 1 language
}
```

---

## 🏢 Client Registration

### Complete Request Body
```typescript
{
  // Step 1: Basic Information
  username: string;               // Required, min 3 characters
  first_name: string;             // Required
  last_name: string;              // Required
  email: string;                  // Required, valid email
  password: string;               // Required, min 6 characters
  account_type: "client";         // Required

  // Step 2: Company Information
  company_name: string;           // Required
  industry: string;               // Required: "film" | "ad_agency" | "events" | "youtube" | "corporate" | "other"
  website?: string;               // Optional, URL format
  social_links?: string;          // Optional
  company_size: string;           // Required: "1-10" | "11-50" | "51-200" | "200+"
  required_services: string[];    // Required, min 1 service
  required_skills: string[];      // Required, min 1 skill
  required_editor_proficiencies: string[];      // Required, min 1 proficiency
  required_videographer_proficiencies: string[]; // Required, min 1 proficiency
  budget_min: number;             // Required, min 0
  budget_max: number;             // Required, > budget_min

  // Step 3: Contact & Business Details
  phone_number: string;           // Required, 10 digits
  address: string;                // Required (business address)
  country: string;                // Required, ISO country code
  state: string;                  // Required, ISO state code
  city: string;                   // Required
  pincode: string;                // Required, 5-6 digits
  business_documents?: File[];    // Optional, max 5 files (.pdf, .doc, .docx, image/*)
  tax_id?: string;                // Optional

  // Step 4: Work Preferences
  work_arrangement: string;       // Required: "remote" | "on_site" | "hybrid"
  project_frequency: string;      // Required: "one_time" | "occasional" | "ongoing"
  hiring_preferences: string;     // Required: "individuals" | "agencies" | "both"
  expected_start_date?: string;   // Optional, date format
  project_duration?: string;      // Optional: "less_than_week" | "1_2_weeks" | "2_4_weeks" | "1_3_months" | "3_plus_months"
}
```

---

## 📄 Success Response Format

### Registration Success (201)
```json
{
  "success": true,
  "message": "Freelancer registered successfully",
  "data": {
    "user": {
      "user_id": 124,
      "username": "jane_designer",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "account_type": "freelancer",
      "phone_verified": false,
      "email_verified": false,
      "is_active": true,
      "created_at": "2025-10-01T10:45:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "redirectUrl": "/dashboard/candidate-dashboard"
  },
  "meta": {
    "timestamp": "2025-10-01T10:45:00.000Z",
    "version": "v1"
  }
}
```

---

## ❌ Error Response Format

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Username is required",
    "Email must be a valid email address",
    "Password must be at least 6 characters"
  ],
  "meta": {
    "timestamp": "2025-10-01T10:45:00.000Z",
    "version": "v1"
  }
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "message": "Too many registration attempts, please try again after an hour",
  "meta": {
    "timestamp": "2025-10-01T10:45:00.000Z",
    "version": "v1"
  }
}
```

### Business Logic Validation Error (400)
```json
{
  "success": false,
  "message": "Required freelancer fields missing",
  "errors": [
    "profile_title is required for freelancer accounts",
    "skills is required for freelancer accounts",
    "hourly_rate is required for freelancer accounts"
  ],
  "meta": {
    "timestamp": "2025-10-01T10:45:00.000Z",
    "version": "v1"
  }
}
```

### File Upload Error (400)
```json
{
  "success": false,
  "message": "ID document required",
  "errors": [
    "Freelancer accounts must provide government-issued ID"
  ],
  "meta": {
    "timestamp": "2025-10-01T10:45:00.000Z",
    "version": "v1"
  }
}
```

### Login Error (401)
```json
{
  "success": false,
  "message": "Invalid credentials",
  "meta": {
    "timestamp": "2025-10-01T10:45:00.000Z",
    "version": "v1"
  }
}
```

### Duplicate User Error (400)
```json
{
  "success": false,
  "message": "User already exists",
  "errors": [
    "Email already registered",
    "Username already taken"
  ],
  "meta": {
    "timestamp": "2025-10-01T10:45:00.000Z",
    "version": "v1"
  }
}
```

---

## ⚠️ CRITICAL IMPLEMENTATION NOTES

### Required vs Optional Fields by Account Type

#### Always Required (Both Account Types)
- `username`, `first_name`, `last_name`, `email`, `password`, `account_type`
- `phone_number`, `country`, `state`, `city`

#### Freelancer Required Fields
- `profile_title`, `skills[]`, `experience_level`, `hourly_rate`
- `street_address`, `zip_code`, `id_type`, `id_document` (file)
- `availability`, `hours_per_week`, `work_type`, `languages[]`

#### Client Required Fields  
- `company_name`, `industry`, `company_size`
- `required_services[]`, `required_skills[]`
- `required_editor_proficiencies[]`, `required_videographer_proficiencies[]`
- `budget_min`, `budget_max`, `address`, `pincode`
- `work_arrangement`, `project_frequency`, `hiring_preferences`

#### Optional Fields
- **Freelancer:** `portfolio_links`
- **Client:** `website`, `social_links`, `business_documents[]`, `tax_id`, `expected_start_date`, `project_duration`

### Array Field Format
🔴 **MUST USE:** `fieldName[]` syntax for arrays in FormData
```javascript
// ✅ Correct
formData.append('skills[]', 'UI Design');
formData.append('skills[]', 'Figma');

// ❌ Wrong  
formData.append('skills', JSON.stringify(['UI Design', 'Figma']));
```

### File Upload Requirements
- **Content-Type:** Must be `multipart/form-data`
- **Freelancer:** `id_document` file is required
- **Client:** `business_documents` files are optional (max 5)
- **File Size:** 5MB limit per file
- **Formats:** Images (jpg, png, gif) and PDF files only

---

## 📋 Field Specifications

### Account Types
- `"freelancer"` (not "candidate")
- `"client"` (not "employer")

### Phone Number Format
- **Length:** Exactly 10 digits
- **Format:** Numeric only, no country code
- **Example:** `"9876543210"`

### Password Requirements
- **Minimum:** 6 characters
- **Backend validation:** No additional requirements (frontend can add more)

### Country/State/City
- **Country:** ISO country codes (`"IN"`, `"US"`)
- **State:** ISO state codes (`"MH"`, `"CA"`)
- **City:** City names (string)

### File Upload Requirements

#### Freelancer ID Document
- **Field name:** `id_document`
- **Required:** Yes
- **Max files:** 1
- **Accepted formats:** `image/*`, `.pdf`
- **Max size:** 5MB

#### Client Business Documents
- **Field name:** `business_documents`
- **Required:** No
- **Max files:** 5
- **Accepted formats:** `.pdf`, `.doc`, `.docx`, `image/*`
- **Max size:** 5MB per file

---

## 🔒 Security Features

### Middleware Validation Order
The registration endpoint processes requests through multiple validation layers:

1. **Rate Limiting** - Prevents spam (3 attempts/hour)
2. **Security Sanitization** - XSS protection, SQL injection prevention
3. **File Upload Processing** - Multer handles file uploads
4. **DTO Validation** - Class-validator checks field formats
5. **Business Logic Validation** - Database constraints and business rules
6. **Controller Processing** - Final user creation

### Rate Limiting
- **Registration:** 3 attempts per hour per IP
- **Login:** 5 attempts per 15 minutes per IP
- **General API:** 100 requests per 15 minutes per IP

### Input Security
- **XSS Protection:** All string inputs are sanitized
- **SQL Injection Prevention:** Pattern detection and parameterized queries
- **File Upload Security:** Server-side validation and file type checking

### Business Logic Validation
- **Duplicate Prevention:** Email and username uniqueness checked
- **Account-Type Validation:** Required fields enforced based on account type
- **File Requirements:** 
  - Freelancers: `id_document` required
  - Clients: `business_documents` optional

### Array Field Handling
⚠️ **CRITICAL:** Array fields must be sent using square bracket notation:
- ✅ Correct: `skills[]`, `languages[]`, `required_services[]`
- ❌ Wrong: JSON stringified arrays in FormData
- ✅ Multiple values: Send multiple form fields with same name

---

## 🧪 Testing Examples

### cURL Examples

#### Login Request
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Freelancer Registration
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -F "username=jane_designer" \
  -F "first_name=Jane" \
  -F "last_name=Smith" \
  -F "email=jane@example.com" \
  -F "password=password123" \
  -F "account_type=freelancer" \
  -F "profile_title=UI/UX Designer" \
  -F "skills[]=UI Design" \
  -F "skills[]=Figma" \
  -F "skills[]=Adobe XD" \
  -F "experience_level=intermediate" \
  -F "hourly_rate=2500" \
  -F "phone_number=9876543210" \
  -F "street_address=123 Main Street" \
  -F "country=IN" \
  -F "state=MH" \
  -F "city=Mumbai" \
  -F "zip_code=400001" \
  -F "id_type=passport" \
  -F "availability=full_time" \
  -F "hours_per_week=30_40" \
  -F "work_type=remote" \
  -F "languages[]=English" \
  -F "languages[]=Hindi" \
  -F "id_document=@/path/to/id_document.pdf"
```

#### Client Registration
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -F "username=company_user" \
  -F "first_name=John" \
  -F "last_name=Manager" \
  -F "email=john@company.com" \
  -F "password=password123" \
  -F "account_type=client" \
  -F "company_name=Creative Studios Ltd" \
  -F "industry=film" \
  -F "company_size=11-50" \
  -F "required_services[]=Video Editing" \
  -F "required_services[]=Motion Graphics" \
  -F "required_skills[]=Adobe Premiere" \
  -F "required_skills[]=After Effects" \
  -F "required_editor_proficiencies[]=Color Grading" \
  -F "required_videographer_proficiencies[]=DSLR Operation" \
  -F "budget_min=50000" \
  -F "budget_max=200000" \
  -F "phone_number=9876543210" \
  -F "address=456 Business Plaza, Mumbai" \
  -F "country=IN" \
  -F "state=MH" \
  -F "city=Mumbai" \
  -F "pincode=400001" \
  -F "work_arrangement=hybrid" \
  -F "project_frequency=ongoing" \
  -F "hiring_preferences=both" \
  -F "business_documents=@/path/to/business_doc1.pdf" \
  -F "business_documents=@/path/to/business_doc2.pdf"
```

### JavaScript Fetch Example

#### Registration with FormData
```javascript
const formData = new FormData();
formData.append('username', 'jane_designer');
formData.append('first_name', 'Jane');
formData.append('last_name', 'Smith');
formData.append('email', 'jane@example.com');
formData.append('password', 'password123');
formData.append('account_type', 'freelancer');
formData.append('profile_title', 'UI/UX Designer');

// ⚠️ IMPORTANT: Array fields must be sent as individual form fields
formData.append('skills[]', 'UI Design');
formData.append('skills[]', 'Figma');
formData.append('skills[]', 'Adobe XD');

formData.append('experience_level', 'intermediate');
formData.append('hourly_rate', '2500');
formData.append('phone_number', '9876543210');
formData.append('street_address', '123 Main Street');
formData.append('country', 'IN');
formData.append('state', 'MH');
formData.append('city', 'Mumbai');
formData.append('zip_code', '400001');
formData.append('id_type', 'passport');
formData.append('availability', 'full_time');
formData.append('hours_per_week', '30_40');
formData.append('work_type', 'remote');

// Languages array
formData.append('languages[]', 'English');
formData.append('languages[]', 'Hindi');

// File upload
formData.append('id_document', fileInput.files[0]);

fetch('http://localhost:8000/api/v1/auth/register', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    window.location.href = data.data.redirectUrl;
  } else {
    console.error('Registration failed:', data.errors);
  }
});
```

#### Client Registration Example
```javascript
const formData = new FormData();
// Basic information
formData.append('username', 'company_user');
formData.append('first_name', 'John');
formData.append('last_name', 'Manager');
formData.append('email', 'john@company.com');
formData.append('password', 'password123');
formData.append('account_type', 'client');

// Company information
formData.append('company_name', 'Creative Studios Ltd');
formData.append('industry', 'film');
formData.append('company_size', '11-50');

// Required services (array)
formData.append('required_services[]', 'Video Editing');
formData.append('required_services[]', 'Motion Graphics');

// Required skills (array)
formData.append('required_skills[]', 'Adobe Premiere');
formData.append('required_skills[]', 'After Effects');

// Required proficiencies (arrays)
formData.append('required_editor_proficiencies[]', 'Color Grading');
formData.append('required_videographer_proficiencies[]', 'DSLR Operation');

formData.append('budget_min', '50000');
formData.append('budget_max', '200000');

// Contact details
formData.append('phone_number', '9876543210');
formData.append('address', '456 Business Plaza, Mumbai');
formData.append('country', 'IN');
formData.append('state', 'MH');
formData.append('city', 'Mumbai');
formData.append('pincode', '400001');

// Work preferences
formData.append('work_arrangement', 'hybrid');
formData.append('project_frequency', 'ongoing');
formData.append('hiring_preferences', 'both');

// Optional business documents
if (businessDocuments.length > 0) {
  businessDocuments.forEach(file => {
    formData.append('business_documents', file);
  });
}

// Send request
fetch('http://localhost:8000/api/v1/auth/register', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    window.location.href = data.data.redirectUrl;
  } else {
    console.error('Registration failed:', data.errors);
  }
});
```

---

## 🗄️ Database Schema Reference

### Key Fields in Users Table

| Field | Type | Description | Used By |
|-------|------|-------------|---------|
| `user_id` | Integer | Primary key | Both |
| `username` | String | Unique username | Both |
| `first_name` | String | First name | Both |
| `last_name` | String | Last name | Both |
| `email` | String | Email address (unique) | Both |
| `account_type` | String | "freelancer" or "client" | Both |
| `phone_number` | String | 10-digit phone number | Both |
| `street_address` | String | Street address | Freelancer |
| `address` | String | Business address | Client |
| `zip_code` | String | Postal code | Freelancer |
| `pincode` | String | Postal code | Client |
| `country` | String | ISO country code | Both |
| `state` | String | ISO state code | Both |
| `city` | String | City name | Both |
| `skills` | JSONB | Array of skills | Freelancer |
| `languages` | JSONB | Array of languages | Freelancer |
| `hourly_rate` | Decimal | Hourly rate in INR | Freelancer |
| `company_name` | String | Company name | Client |
| `industry` | String | Industry type | Client |
| `required_services` | JSONB | Required services array | Client |
| `budget_min` | Decimal | Minimum budget | Client |
| `budget_max` | Decimal | Maximum budget | Client |
| `id_document_url` | String | ID document file path | Freelancer |
| `business_documents` | JSONB | Business docs array | Client |

---

## 🚦 HTTP Status Codes

| Status | Description | When Used |
|--------|-------------|-----------|
| 200 | Success | Login successful |
| 201 | Created | Registration successful |
| 400 | Bad Request | Validation errors, duplicate user |
| 401 | Unauthorized | Invalid credentials |
| 413 | Payload Too Large | File size exceeds limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## � Troubleshooting Common Issues

### 1. Array Fields Not Working
**Problem:** Validation errors about missing array fields  
**Solution:** Use `fieldName[]` syntax, not JSON strings
```javascript
// ✅ Correct
formData.append('skills[]', 'UI Design');
formData.append('skills[]', 'Figma');

// ❌ Wrong
formData.append('skills', JSON.stringify(['UI Design', 'Figma']));
```

### 2. File Upload Fails
**Problem:** "Only images and PDF files are allowed" error  
**Solution:** Check file MIME type and size
- Allowed: `image/*`, `application/pdf`
- Max size: 5MB per file

### 3. Rate Limit Errors
**Problem:** "Too many registration attempts" error  
**Solution:** Wait for the rate limit window to reset
- Registration: 1 hour cooldown
- Login: 15 minutes cooldown

### 4. Missing Required Fields
**Problem:** Business validation errors about missing fields  
**Solution:** Ensure all account-type specific fields are included
- Check the "Required vs Optional Fields" section above
- Verify field names match exactly (case-sensitive)

### 5. Duplicate User Errors
**Problem:** "Email already registered" or "Username already taken"  
**Solution:** These are legitimate backend validations
- Use different email/username
- Implement proper error handling in frontend

### 6. CORS Issues (Development)
**Problem:** Browser blocks requests due to CORS  
**Solution:** Backend already configured for development
- Ensure using correct localhost port (8000)
- Check if server is running

---

## �📞 Support & Contact

For API integration support:
- **Email:** [TO_BE_PROVIDED]
- **Documentation Issues:** Create GitHub issue
- **API Testing:** Use Postman collection (available on request)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2025-10-01 | Initial API documentation |

---

**Note:** This documentation reflects the current backend implementation. The frontend should use these exact endpoints and field specifications for proper integration.