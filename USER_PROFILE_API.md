# User Profile API Documentation

## Overview
The User Profile API allows authenticated users to retrieve their complete profile information, including basic user details and type-specific profile data (client, videographer, or video editor profiles).

## Endpoint
```
GET /api/v1/users/me
```

## Authentication
- **Required**: JWT Bearer token in Authorization header
- **Header**: `Authorization: Bearer <your_jwt_token>`

## Request
### Method
GET

### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Body
No request body required

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 3,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "phone_verified": false,
      "email_verified": false,
      "profile_picture": "https://example.com/profile.jpg",
      "bio": "Professional photographer",
      "timezone": "UTC",
      "address_line_first": "123 Main St",
      "address_line_second": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "pincode": "10001",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "is_active": true,
      "is_banned": false,
      "is_deleted": false,
      "banned_reason": null,
      "reset_token": null,
      "reset_token_expires": null,
      "login_attempts": 0,
      "last_login_at": "2025-10-03T17:29:13.577Z",
      "email_notifications": true,
      "created_at": "2025-10-03T17:26:51.373Z",
      "updated_at": "2025-10-03T17:29:13.577Z"
    },
    "profile": {
      // Profile data varies by user type (client/freelancer)
      // See examples below for different user types
    },
    "userType": "CLIENT" // or "VIDEOGRAPHER" or "VIDEO_EDITOR"
  }
}
```

## User Type Specific Profile Data

### Client Profile
```json
{
  "client_id": 1,
  "user_id": 3,
  "company_name": "ABC Corp",
  "website": "https://abc.com",
  "company_description": "Leading digital marketing agency",
  "industry": "ad_agency",
  "social_links": ["https://linkedin.com/company/abc"],
  "company_size": "11-50",
  "project_title": "E-commerce Website",
  "project_description": "Building a modern e-commerce platform",
  "project_category": "web_development",
  "project_budget": "50000.00",
  "project_timeline": "3 months",
  "terms_accepted": true,
  "privacy_policy_accepted": true,
  "address": "123 Business St, Suite 100",
  "tax_id": "TX123456",
  "business_documents": null,
  "id_document_url": "https://example.com/id.pdf",
  "business_document_url": "https://example.com/business.pdf",
  "work_arrangement": "remote",
  "project_frequency": "monthly",
  "hiring_preferences": "experienced",
  "expected_start_date": "2025-11-01",
  "project_duration": "ongoing",
  "projects_created": [],
  "total_spent": 0,
  "payment_method": "bank_transfer",
  "created_at": "2025-10-03T17:26:51.408Z",
  "updated_at": "2025-10-03T17:26:51.408Z"
}
```

### Videographer Profile
```json
{
  "profile_id": 1,
  "user_id": 5,
  "profile_title": "Professional Videographer",
  "skills": "[\"Cinematography\",\"Video Editing\"]",
  "skill_tags": "[\"Wedding\",\"Corporate\"]",
  "superpowers": "[\"Drone Operation\",\"Color Grading\"]",
  "portfolio_links": "[\"https://vimeo.com/user123\"]",
  "rate_amount": 150,
  "currency": "USD",
  "short_description": "Award-winning videographer with 5+ years experience",
  "languages": "[\"English\",\"Spanish\"]",
  "availability": "full-time",
  "id_type": "passport",
  "id_document_url": "https://example.com/id.pdf",
  "experience_level": "expert",
  "role": "Senior Videographer",
  "base_skills": "[\"Camera Operation\",\"Lighting\"]",
  "address": "456 Creative Ave, Studio 200",
  "created_at": "2025-10-03T17:26:51.408Z",
  "updated_at": "2025-10-03T17:26:51.408Z"
}
```

### Video Editor Profile
```json
{
  "profile_id": 2,
  "user_id": 7,
  "profile_title": "Expert Video Editor",
  "skills": "[\"Adobe Premiere\",\"After Effects\"]",
  "skill_tags": "[\"Motion Graphics\",\"Color Correction\"]",
  "superpowers": "[\"3D Animation\",\"Sound Design\"]",
  "portfolio_links": "[\"https://youtube.com/user123\"]",
  "rate_amount": 75,
  "currency": "USD",
  "short_description": "Creative video editor specializing in motion graphics",
  "languages": "[\"English\"]",
  "availability": "part-time",
  "id_type": "driving_license",
  "id_document_url": "https://example.com/id.pdf",
  "experience_level": "intermediate",
  "role": "Video Editor",
  "base_skills": "[\"Compositing\",\"Audio Editing\"]",
  "address": "789 Edit St, Floor 3",
  "created_at": "2025-10-03T17:26:51.408Z",
  "updated_at": "2025-10-03T17:26:51.408Z"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

## Usage Examples

### cURL
```bash
curl -X GET \
  http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript (fetch)
```javascript
const token = 'YOUR_JWT_TOKEN';

fetch('http://localhost:8000/api/v1/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('User Profile:', data);
})
.catch(error => {
  console.error('Error:', error);
});
```

### Python (requests)
```python
import requests

url = "http://localhost:8000/api/v1/users/me"
headers = {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
profile_data = response.json()

print("User Profile:", profile_data)
```

## Notes
- The profile data structure varies based on user type (CLIENT, VIDEOGRAPHER, VIDEO_EDITOR)
- Some fields may contain JSON strings that need to be parsed
- File URLs (profile pictures, documents) are served from cloud storage
- Boolean fields indicate user preferences and verification status
- Timestamps are in ISO 8601 format

## Related Endpoints
- `PATCH /api/v1/users/me` - Update user profile
- `POST /api/v1/auth/login` - Get authentication token
- `GET /api/v1/users/me/has-profile` - Check if user has profile</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/USER_PROFILE_API.md