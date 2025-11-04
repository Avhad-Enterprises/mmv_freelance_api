# Bidding System Implementation Documentation

## Overview

The bidding system allows clients to enable competitive bidding on their projects, where freelancers can submit custom bid amounts and messages instead of applying with fixed pricing. This creates a marketplace-like experience where freelancers can offer competitive rates.

## Database Schema Changes

### Projects Task Table (`projects_task`)
- **New Field**: `bidding_enabled` (boolean, default: false)
  - When `true`: Project accepts bids with custom amounts
  - When `false`: Project uses standard application process

### Applied Projects Table (`applied_projects`)
- **New Fields**:
  - `bid_amount` (decimal, nullable): The freelancer's bid amount
  - `bid_message` (text, nullable): Optional message explaining the bid

## API Endpoints

### 1. Apply to Project
**Endpoint**: `POST /api/v1/applications/projects/apply`

**Authentication**: Required (VIDEOGRAPHER, VIDEO_EDITOR roles)

**Request Body**:
```json
{
  "projects_task_id": 123,
  "description": "Optional application description",
  "bid_amount": 4500.00,        // Required if bidding_enabled = true
  "bid_message": "I can deliver high quality work for this price"  // Optional
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Applied to project successfully",
  "alreadyApplied": false,
  "data": {
    "applied_projects_id": 456,
    "projects_task_id": 123,
    "user_id": 86,
    "bid_amount": "4500.00",
    "bid_message": "I can deliver high quality work for this price",
    "status": 0,
    "created_at": "2025-11-04T19:40:47.087Z"
  },
  "credits_deducted": 1
}
```

**Validation Rules**:
- **Credits Required**: 1 credit per application (automatically deducted)
- **Bidding Projects**: `bid_amount` must be > 0 when `bidding_enabled = true`
- **Non-Bidding Projects**: `bid_amount` and `bid_message` are ignored
- **Duplicate Applications**: Cannot apply to same project twice

### 2. Get Project Applications (Client View)
**Endpoint**: `GET /api/v1/applications/projects/{project_id}/applications`

**Authentication**: Required (CLIENT role)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "applied_projects_id": 95,
      "projects_task_id": 322,
      "user_id": 86,
      "bid_amount": "4500.00",
      "bid_message": "I can deliver high quality work for this price",
      "status": 0,
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture": "https://example.com/avatar.jpg",
      "email": "freelancer@example.com",
      "bio": "Experienced video editor"
    }
  ],
  "message": "got all applications for project task ID 322"
}
```

### 3. Get My Applications (Freelancer View)
**Endpoint**: `GET /api/v1/applications/my-applications`

**Authentication**: Required (VIDEOGRAPHER, VIDEO_EDITOR roles)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "applied_projects_id": 95,
      "projects_task_id": 322,
      "bid_amount": "4500.00",
      "bid_message": "I can deliver high quality work for this price",
      "project_title": "Test Bidding Enabled Project",
      "project_category": "Video Editing",
      "bidding_enabled": true,
      "budget": "5000.00",
      "deadline": "2024-12-30T18:30:00.000Z"
    }
  ],
  "message": "got all applications for user 86"
}
```

### 4. Withdraw Application
**Endpoint**: `DELETE /api/v1/applications/withdraw/{application_id}`

**Authentication**: Required (VIDEOGRAPHER, VIDEO_EDITOR roles)

**Response**:
```json
{
  "success": true,
  "message": "Application withdrawn successfully"
}
```

## Frontend Integration Guide

### Creating Projects with Bidding

When creating a project, include the `bidding_enabled` field:

```javascript
const createProjectData = {
  client_id: 2,
  project_title: "Logo Design Competition",
  project_category: "Graphic Design",
  deadline: "2024-12-31",
  project_description: "Need creative logo designs",
  budget: 1000.00,
  bidding_enabled: true,  // Enable bidding for this project
  // ... other project fields
};

const response = await fetch('/api/v1/projects-tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(createProjectData)
});
```

### Applying to Projects

Check if bidding is enabled before showing bid fields:

```javascript
// First, get project details to check bidding_enabled
const projectResponse = await fetch(`/api/v1/projects-tasks/${projectId}`);
const project = await projectResponse.json();

if (project.data.bidding_enabled) {
  // Show bid amount and message fields
  const applicationData = {
    projects_task_id: projectId,
    bid_amount: 750.00,
    bid_message: "High-quality work at competitive price"
  };
} else {
  // Standard application
  const applicationData = {
    projects_task_id: projectId,
    description: "I'm interested in this project"
  };
}

// Submit application
const applyResponse = await fetch('/api/v1/applications/projects/apply', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(applicationData)
});
```

### Displaying Applications

For clients viewing applications:

```javascript
const applicationsResponse = await fetch(`/api/v1/applications/projects/${projectId}/applications`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const applications = await applicationsResponse.json();

// Display applications with conditional bid information
applications.data.forEach(app => {
  if (app.bid_amount) {
    // Show bid details
    console.log(`Bid: $${app.bid_amount} - ${app.bid_message}`);
  } else {
    // Show standard application
    console.log(`Application: ${app.description}`);
  }
});
```

### Freelancer Dashboard

Show different application views based on bidding status:

```javascript
const myApplicationsResponse = await fetch('/api/v1/applications/my-applications', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const applications = await myApplicationsResponse.json();

applications.data.forEach(app => {
  const bidInfo = app.bid_amount
    ? `Bid: $${app.bid_amount}`
    : 'Standard Application';

  console.log(`${app.project_title} - ${bidInfo}`);
});
```

## Error Handling

### Common Error Responses

**Insufficient Credits**:
```json
{
  "success": false,
  "message": "Insufficient credits. Please purchase more credits to apply.",
  "statusCode": 400
}
```

**Missing Bid Amount**:
```json
{
  "success": false,
  "message": "Bid amount is required and must be greater than 0 for projects with bidding enabled",
  "statusCode": 400
}
```

**Already Applied**:
```json
{
  "success": true,
  "message": "Already applied to this project",
  "alreadyApplied": true,
  "data": { /* existing application data */ }
}
```

**Project Not Found**:
```json
{
  "success": false,
  "message": "Project not found",
  "statusCode": 404
}
```

## Credits System Integration

- **Cost**: 1 credit per application (both bidding and non-bidding projects)
- **Automatic Deduction**: Credits are deducted when application is submitted
- **Validation**: Credit balance is checked before allowing application
- **Purchase Required**: Users must purchase credits if balance is insufficient

## Migration Notes

The bidding system uses database migrations to add new fields:
- `bidding_enabled` field added to `projects_task` table
- `bid_amount` and `bid_message` fields added to `applied_projects` table

Existing projects default to `bidding_enabled: false` to maintain backward compatibility.

## Testing

Comprehensive tests cover:
- Bidding-enabled vs bidding-disabled project applications
- Bid validation requirements
- Credit deduction verification
- Application withdrawal functionality
- Client application viewing with bid details

Run tests with: `node tests/applied_projects/run-applied-projects-tests.js`