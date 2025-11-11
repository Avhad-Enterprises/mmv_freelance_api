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
- `GET /api/v1/users/me/profile-completion` - Get profile completion status
- `DELETE /api/v1/users/me` - Delete user account

---

# GET /users/me/profile-completion - Get Profile Completion Status

Get the completion status of the authenticated user's profile.

## Endpoint

```
GET /api/v1/users/me/profile-completion
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
    "completed": 16,
    "total": 20,
    "percentage": 80,
    "completedFields": [
      "user.first_name",
      "user.last_name",
      "user.email",
      "user.phone_number",
      "user.city",
      "user.country",
      "user.pincode",
      "freelancer_profile.profile_title",
      "freelancer_profile.short_description",
      "freelancer_profile.experience_level",
      "freelancer_profile.skills",
      "freelancer_profile.languages",
      "freelancer_profile.rate_amount",
      "freelancer_profile.currency",
      "freelancer_profile.availability",
      "freelancer_profile.portfolio_links"
    ],
    "missingFields": [
      "user.address_line_first",
      "user.state",
      "freelancer_profile.work_type",
      "freelancer_profile.hours_per_week"
    ]
  }
}
```

## Completion Criteria by User Type

### CLIENT
**Total Fields**: 18
- **User Fields** (9): first_name, last_name, email, phone_number, address_line_first, city, state, country, pincode
- **Profile Fields** (9): company_name, company_description, industry, company_size, work_arrangement, project_frequency, hiring_preferences, terms_accepted, privacy_policy_accepted

### VIDEOGRAPHER
**Total Fields**: 20
- **User Fields** (9): first_name, last_name, email, phone_number, address_line_first, city, state, country, pincode
- **Freelancer Profile Fields** (11): profile_title, short_description, experience_level, skills, languages, rate_amount, currency, availability, work_type, hours_per_week, portfolio_links

### VIDEO_EDITOR
**Total Fields**: 20
- **User Fields** (9): first_name, last_name, email, phone_number, address_line_first, city, state, country, pincode
- **Freelancer Profile Fields** (11): profile_title, short_description, experience_level, skills, languages, rate_amount, currency, availability, work_type, hours_per_week, portfolio_links

### ADMIN
**Total Fields**: 4
- **User Fields** (4): first_name, last_name, email, phone_number

## Field Validation Rules

- **String fields**: Must not be empty or null
- **Array fields**: Must have at least one item
- **Number fields**: Must be greater than 0
- **Boolean fields**: Must be true

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

fetch('/api/v1/users/me/profile-completion', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    const { completed, total, percentage, completedFields, missingFields } = data.data;
    console.log(`Profile ${percentage}% complete (${completed}/${total})`);
    
    // Show progress bar
    updateProgressBar(percentage);
    
    // Highlight missing fields
    highlightMissingFields(missingFields);
  }
})
.catch(error => console.error('Error:', error));
```

### cURL
```bash
curl -X GET \
  'https://api.makemyvid.io/api/v1/users/me/profile-completion' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

## Notes

- **Authentication Required**: This endpoint requires a valid JWT token
- **Dynamic Criteria**: Completion criteria vary based on user type (CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN)
- **Real-time Calculation**: Completion is calculated in real-time based on current profile data
- **Frontend Integration**: Perfect for progress bars, completion checklists, and profile setup wizards
- **Field-level Detail**: Provides both summary stats and detailed field-level completion information</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/GET_users_me.md