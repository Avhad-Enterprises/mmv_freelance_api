# Freelancers API Frontend Guide

## Overview
The Freelancers API provides endpoints for discovering and managing freelancer profiles in the MMV platform. This includes public discovery endpoints for clients to browse freelancers and authenticated endpoints for detailed freelancer information.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
- Public endpoints: No authentication required
- Protected endpoints: Bearer token authentication required

## Endpoints

### 1. Get All Freelancers (Public)
Get a list of all freelancers for public browsing (no sensitive information included).

**Endpoint:** `GET /freelancers/getfreelancers-public`

**Authentication:** None required

**Response Format:**
```json
{
  "success": true,
  "count": 95,
  "data": [
    {
      "user_id": 10,
      "first_name": "John",
      "last_name": "Videographer",
      "username": "videographer-test-1760776702141-broyc3dqm",
      "profile_picture": "https://mmv-uploads.s3.ap-south-1.amazonaws.com/profile_photos/...",
      "bio": null,
      "timezone": null,
      "address_line_first": null,
      "address_line_second": null,
      "city": "Los Angeles",
      "state": "California",
      "country": "United States",
      "pincode": null,
      "latitude": null,
      "longitude": null,
      "is_active": true,
      "is_banned": false,
      "is_deleted": false,
      "email_notifications": true,
      "created_at": "2025-10-18T08:38:22.473Z",
      "updated_at": "2025-10-18T08:38:22.473Z",
      "freelancer_id": 1,
      "profile_title": "John Videographer",
      "role": "Lead Videographer",
      "short_description": "Expert videographer specializing in commercial shoots",
      "experience_level": "expert",
      "skills": ["cinematography", "drone", "editing"],
      "superpowers": ["color grading", "motion graphics"],
      "skill_tags": ["cinematography", "drone", "editing"],
      "base_skills": ["camera operation", "lighting", "sound"],
      "languages": ["English", "Spanish"],
      "portfolio_links": ["https://vimeo.com/portfolio", "https://youtube.com/channel"],
      "certification": null,
      "education": null,
      "previous_works": null,
      "services": null,
      "rate_amount": "150.00",
      "currency": "INR",
      "availability": "full-time",
      "work_type": null,
      "hours_per_week": null,
      "id_type": "passport",
      "id_document_url": "https://mmv-uploads.s3.ap-south-1.amazonaws.com/id_documents/...",
      "kyc_verified": false,
      "aadhaar_verification": false,
      "hire_count": 0,
      "review_id": 0,
      "total_earnings": 0,
      "time_spent": 0,
      "projects_applied": [],
      "projects_completed": [],
      "payment_method": null,
      "bank_account_info": null,
      "role_name": "VIDEOGRAPHER"
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Fetch all freelancers for public browsing
const fetchFreelancers = async () => {
  try {
    const response = await fetch('/api/v1/freelancers/getfreelancers-public');
    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.count} freelancers`);
      // Display freelancers in UI
      displayFreelancers(data.data);
    }
  } catch (error) {
    console.error('Error fetching freelancers:', error);
  }
};
```

### 2. Get All Freelancers (Authenticated)
Get complete freelancer information including sensitive data (requires authentication).

**Endpoint:** `GET /freelancers/getfreelancers`

**Authentication:** Bearer token required

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response Format:**
```json
{
  "success": true,
  "count": 95,
  "data": [
    {
      "user_id": 10,
      "first_name": "John",
      "last_name": "Videographer",
      "username": "videographer-test-1760776702141-broyc3dqm",
      "email": "videographer-test-1760776702141-broyc3dqm@test.com",
      "phone_number": "+1-555-0123",
      // ... all public fields plus email and phone
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Fetch all freelancers with authentication
const fetchFreelancersAuthenticated = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/v1/freelancers/getfreelancers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.count} freelancers`);
      // Process complete freelancer data
      processFreelancerData(data.data);
    }
  } catch (error) {
    console.error('Error fetching freelancers:', error);
  }
};
```

### 3. Get Available Freelancers
Get freelancers who are currently available for work.

**Endpoint:** `GET /freelancers/getavailablefreelancers`

**Authentication:** Bearer token required

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response Format:**
```json
{
  "success": true,
  "count": 85,
  "data": [
    {
      // Freelancers with availability status
      "availability": "full-time",
      // ... other freelancer fields
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Fetch available freelancers
const fetchAvailableFreelancers = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/v1/freelancers/getavailablefreelancers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.count} available freelancers`);
      // Filter and display available freelancers
      const availableFreelancers = data.data.filter(f =>
        f.availability === 'full-time' ||
        f.availability === 'part-time' ||
        f.availability === 'freelance'
      );
      displayAvailableFreelancers(availableFreelancers);
    }
  } catch (error) {
    console.error('Error fetching available freelancers:', error);
  }
};
```

## Data Structure

### Freelancer Object Fields
- `user_id`: Unique user identifier
- `first_name`, `last_name`: User's name
- `username`: Unique username
- `email`: Email address (only in authenticated responses)
- `phone_number`: Phone number (only in authenticated responses)
- `profile_picture`: Profile image URL
- `profile_title`: Professional title
- `short_description`: Brief professional description
- `experience_level`: "beginner", "intermediate", "expert", or "professional"
- `skills`: Array of primary skills
- `superpowers`: Array of special skills/expertise
- `skill_tags`: Additional skill tags
- `languages`: Languages spoken
- `portfolio_links`: Array of portfolio URLs
- `rate_amount`: Hourly/daily rate
- `currency`: Currency code (e.g., "INR", "USD")
- `availability`: "full-time", "part-time", "freelance", etc.
- `role_name`: Role type ("VIDEO_EDITOR", "VIDEOGRAPHER", etc.)
- `kyc_verified`: KYC verification status
- `hire_count`: Number of times hired
- `review_id`: Review identifier
- `total_earnings`: Total earnings
- `time_spent`: Time spent on projects

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```

```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

## Frontend Integration Examples

### React Component for Freelancer Grid
```jsx
import React, { useState, useEffect } from 'react';

const FreelancerGrid = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const response = await fetch('/api/v1/freelancers/getfreelancers-public');
      const data = await response.json();

      if (data.success) {
        setFreelancers(data.data);
      } else {
        setError('Failed to fetch freelancers');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading freelancers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="freelancer-grid">
      {freelancers.map(freelancer => (
        <div key={freelancer.user_id} className="freelancer-card">
          <img src={freelancer.profile_picture} alt={freelancer.profile_title} />
          <h3>{freelancer.first_name} {freelancer.last_name}</h3>
          <p className="title">{freelancer.profile_title}</p>
          <p className="description">{freelancer.short_description}</p>
          <div className="skills">
            {freelancer.skills.map(skill => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>
          <div className="rate">
            {freelancer.rate_amount} {freelancer.currency}
          </div>
          <div className="availability">
            {freelancer.availability}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FreelancerGrid;
```

### Freelancer Search/Filter Component
```jsx
import React, { useState, useEffect } from 'react';

const FreelancerSearch = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [freelancers, searchTerm, selectedSkill, availabilityFilter]);

  const fetchFreelancers = async () => {
    try {
      const response = await fetch('/api/v1/freelancers/getfreelancers-public');
      const data = await response.json();
      if (data.success) {
        setFreelancers(data.data);
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    }
  };

  const filterFreelancers = () => {
    let filtered = freelancers;

    // Search by name or title
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.profile_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by skill
    if (selectedSkill) {
      filtered = filtered.filter(f =>
        f.skills.includes(selectedSkill) ||
        f.superpowers.includes(selectedSkill)
      );
    }

    // Filter by availability
    if (availabilityFilter) {
      filtered = filtered.filter(f => f.availability === availabilityFilter);
    }

    setFilteredFreelancers(filtered);
  };

  return (
    <div className="freelancer-search">
      <div className="filters">
        <input
          type="text"
          placeholder="Search freelancers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
          <option value="">All Skills</option>
          <option value="video_editing">Video Editing</option>
          <option value="cinematography">Cinematography</option>
          <option value="color_grading">Color Grading</option>
          {/* Add more skill options */}
        </select>
        <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
          <option value="">All Availability</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="freelance">Freelance</option>
        </select>
      </div>

      <div className="results">
        <p>Found {filteredFreelancers.length} freelancers</p>
        {/* Render filtered freelancers */}
      </div>
    </div>
  );
};

export default FreelancerSearch;
```

## Testing

The freelancers API includes comprehensive tests that verify:
- Public endpoint accessibility without authentication
- Authenticated endpoint protection
- Response structure validation
- Data privacy (email/phone exclusion in public responses)
- Availability filtering

Run tests with:
```bash
# Run all freelancer tests
node tests/freelancers/run-freelancers-tests.js

# Run individual tests
node tests/freelancers/test-get-all-freelancers-public.js
node tests/freelancers/test-get-all-freelancers.js
node tests/freelancers/test-get-available-freelancers.js
```

## Notes
- The public endpoint (`getfreelancers-public`) excludes sensitive information like email and phone numbers
- All endpoints return data in the standard format: `{success: boolean, count: number, data: array}`
- Freelancer profiles include comprehensive information for client evaluation
- The API supports filtering by availability status
- All monetary values include currency information</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/FREELANCERS_API_FRONTEND_GUIDE.md