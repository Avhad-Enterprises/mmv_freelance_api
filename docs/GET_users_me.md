# GET /users/me - Get Current User Profile

Get the authenticated user's complete profile information including type-specific data.

## Endpoint

```
GET /api/v1/users/me
```

## Authentication

**Required**: JWT Bearer token in Authorization header

```
Authorization: Bearer <your_jwt_token>
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "phone_number": "+1234567890",
      "phone_verified": true,
      "email_verified": true,
      "profile_picture": "https://supabase-endpoint/object/public/bucket/profile_photos/user123/PROFILE_PHOTO_1234567890_abc123.jpg",
      "bio": "Professional videographer with 5+ years experience",
      "timezone": "America/New_York",
      "category": "videography",
      "address_line_first": "123 Main St",
      "address_line_second": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "is_active": true,
      "is_banned": false,
      "is_deleted": false,
      "banned_reason": null,
      "email_notifications": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:45:00Z",
      "last_login_at": "2024-01-20T14:45:00Z"
    },
    "profile": {
      // Profile data varies by user type (see examples below)
    },
    "userType": "VIDEOGRAPHER"
  }
}
```

## User Types and Profile Data

### CLIENT Profile
```json
{
  "profile": {
    "client_id": 456,
    "company_name": "ABC Corp",
    "website": "https://abc-corp.com",
    "social_links": {
      "linkedin": "https://linkedin.com/company/abc-corp",
      "twitter": "@abc_corp"
    },
    "company_description": "Leading video production company",
    "industry": "Media & Entertainment",
    "company_size": "51-200",
    "project_title": "Corporate Training Video",
    "project_description": "Need a professional training video for our employees",
    "project_category": "Corporate",
    "project_budget": 5000,
    "project_timeline": "3 months",
    "work_arrangement": "remote",
    "project_frequency": "one-time",
    "hiring_preferences": "experienced",
    "terms_accepted": true,
    "privacy_policy_accepted": true,
    "business_document_url": "https://supabase-endpoint/object/public/bucket/business_docs/user123/BUSINESS_DOC_1234567890_xyz789.pdf"
  },
  "userType": "CLIENT"
}
```

### VIDEOGRAPHER Profile
```json
{
  "profile": {
    "freelancer_id": 789,
    "profile_title": "John Doe - Professional Videographer",
    "skills": "[\"cinematography\",\"editing\",\"color grading\"]",
    "skill_tags": "[\"cinematography\",\"editing\",\"color grading\"]",
    "superpowers": "[\"drone operation\",\"motion graphics\"]",
    "portfolio_links": "[\"https://vimeo.com/johndoe\",\"https://youtube.com/@johndoe\"]",
    "rate_amount": 150,
    "currency": "USD",
    "short_description": "Creative videographer specializing in commercials and documentaries",
    "languages": "[\"English\",\"Spanish\"]",
    "availability": "full-time",
    "id_type": "passport",
    "id_document_url": "https://supabase-endpoint/object/public/bucket/id_docs/user123/ID_DOC_1234567890_def456.jpg",
    "experience_level": "expert",
    "role": "videographer",
    "base_skills": "[\"camera operation\",\"lighting\",\"sound\"]",
    "videographer": {
      "videographer_id": 101,
      "freelancer_id": 789
    }
  },
  "userType": "VIDEOGRAPHER"
}
```

### VIDEO_EDITOR Profile
```json
{
  "profile": {
    "freelancer_id": 790,
    "profile_title": "John Doe - Professional Video Editor",
    "skills": "[\"premiere pro\",\"after effects\",\"davinci resolve\"]",
    "skill_tags": "[\"premiere pro\",\"after effects\",\"davinci resolve\"]",
    "superpowers": "[\"motion graphics\",\"color grading\",\"sound design\"]",
    "portfolio_links": "[\"https://vimeo.com/johndoe\",\"https://behance.net/johndoe\"]",
    "rate_amount": 120,
    "currency": "USD",
    "short_description": "Expert video editor with 7+ years in post-production",
    "languages": "[\"English\"]",
    "availability": "full-time",
    "id_type": "drivers_license",
    "id_document_url": "https://supabase-endpoint/object/public/bucket/id_docs/user123/ID_DOC_1234567890_ghi789.jpg",
    "experience_level": "expert",
    "role": "video_editor",
    "base_skills": "[\"editing\",\"color correction\",\"audio mixing\"]",
    "videoeditor": {
      "videoeditor_id": 102,
      "freelancer_id": 790
    }
  },
  "userType": "VIDEO_EDITOR"
}
```

### ADMIN Profile
```json
{
  "profile": {
    "admin_id": 111,
    "department": "IT",
    "position": "System Administrator",
    "permissions": "full_access",
    "notes": "Platform administrator with full system access"
  },
  "userType": "ADMIN"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Usage Examples

### JavaScript (Fetch API)
```javascript
const token = localStorage.getItem('authToken');

fetch('/api/v1/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('User profile:', data.data);
    console.log('User type:', data.data.userType);
    console.log('Profile data:', data.data.profile);
  }
})
.catch(error => console.error('Error:', error));
```

### cURL
```bash
curl -X GET \
  'https://api.makemyvid.io/api/v1/users/me' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

## Notes

- **Authentication Required**: This endpoint requires a valid JWT token
- **User Type Detection**: The system automatically determines the user type based on their roles (CLIENT > VIDEOGRAPHER > VIDEO_EDITOR > ADMIN)
- **Profile Loading**: For freelancers (VIDEOGRAPHER/VIDEO_EDITOR), both the freelancer profile and specific role profile are loaded
- **Image URLs**: Profile pictures and document URLs are stored as full Supabase S3 URLs
- **Role Priority**: If a user has multiple roles, the highest priority role determines the profile type loaded

## Related Endpoints

- `PATCH /api/v1/users/me` - Update user profile
- `GET /api/v1/users/me/roles` - Get user roles
- `GET /api/v1/users/me/has-profile` - Check if user has profile
- `DELETE /api/v1/users/me` - Delete user account</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/GET_users_me.md