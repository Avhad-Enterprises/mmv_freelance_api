# Project Bidding System API Guide

## Overview
The Project Bidding System allows freelancers to place bids on projects, and clients to review and accept bids. This guide covers all bidding-related endpoints and their usage.

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

## Endpoints

### 1. Create a Bid
Place a new bid on a project.

```bash
POST /api/v1/project-bids
Authorization: Bearer {token}
Content-Type: application/json

{
    "project_id": 123,
    "bid_amount": 1000.00,
    "delivery_time_days": 14,
    "proposal": "Detailed proposal explaining why you're the best fit...",
    "milestones": [
        {
            "description": "Initial Design",
            "amount": 300,
            "due_days": 5
        },
        {
            "description": "Final Delivery",
            "amount": 700,
            "due_days": 14
        }
    ],
    "is_featured": false,
    "additional_services": {
        "revisions": 2,
        "source_files": true
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Bid created successfully",
    "data": {
        "bid_id": 1,
        "project_id": 123,
        "freelancer_id": 456,
        "bid_amount": 1000.00,
        "delivery_time_days": 14,
        "status": "pending",
        "created_at": "2025-10-24T10:00:00Z"
    }
}
```

### 2. Update a Bid
Update an existing bid (only if status is 'pending').

```bash
PUT /api/v1/project-bids/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "bid_amount": 1200.00,
    "delivery_time_days": 10,
    "proposal": "Updated proposal...",
    "milestones": [...]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Bid updated successfully",
    "data": {
        "bid_id": 1,
        "bid_amount": 1200.00,
        "delivery_time_days": 10,
        "status": "pending",
        "updated_at": "2025-10-24T11:00:00Z"
    }
}
```

### 3. Update Bid Status
Accept or reject a bid (Client/Admin only).

```bash
PATCH /api/v1/project-bids/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
    "status": "accepted",
    "reason": "Best value for money and excellent proposal"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Bid accepted successfully",
    "data": {
        "bid_id": 1,
        "status": "accepted",
        "updated_at": "2025-10-24T12:00:00Z"
    }
}
```

### 4. Get Project Bids
Get all bids for a specific project.

```bash
GET /api/v1/project-bids/project/{projectId}
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "bid_id": 1,
            "freelancer_id": 456,
            "bid_amount": 1000.00,
            "delivery_time_days": 14,
            "status": "pending",
            "is_featured": true,
            "created_at": "2025-10-24T10:00:00Z"
        },
        {
            "bid_id": 2,
            "freelancer_id": 789,
            "bid_amount": 1500.00,
            "delivery_time_days": 7,
            "status": "pending",
            "is_featured": false,
            "created_at": "2025-10-24T11:00:00Z"
        }
    ]
}
```

### 5. Get Freelancer's Bids
Get all bids placed by the authenticated freelancer.

```bash
GET /api/v1/project-bids/my-bids
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "bid_id": 1,
            "project_id": 123,
            "bid_amount": 1000.00,
            "status": "pending",
            "created_at": "2025-10-24T10:00:00Z"
        }
    ]
}
```

### 6. Delete a Bid
Delete a pending bid.

```bash
DELETE /api/v1/project-bids/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "message": "Bid deleted successfully"
}
```

## Bid Statuses
- `pending`: Initial state when bid is placed
- `accepted`: Bid was accepted by the client
- `rejected`: Bid was rejected by the client
- `withdrawn`: Bid was withdrawn by the freelancer

## Features

### Featured Bids
- Featured bids appear at the top of the project's bid list
- Requires additional payment or premium account
- Has higher visibility to project owners

### Milestones
Structure your bid with milestones for complex projects:
```json
{
    "milestones": [
        {
            "description": "Research and Planning",
            "amount": 200,
            "due_days": 3
        },
        {
            "description": "Development Phase 1",
            "amount": 400,
            "due_days": 7
        },
        {
            "description": "Final Delivery",
            "amount": 400,
            "due_days": 14
        }
    ]
}
```

### Additional Services
Offer extra services with your bid:
```json
{
    "additional_services": {
        "revisions": 3,
        "rush_delivery": true,
        "source_files": true,
        "commercial_rights": true
    }
}
```

## Error Handling

### Common Errors

```json
{
    "success": false,
    "message": "Error message",
    "statusCode": 400
}
```

**Status Codes:**
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Bid or Project not found
- `409`: Conflict (e.g., duplicate bid)

## Best Practices

1. **Competitive Bidding**
   - Research project requirements thoroughly
   - Provide detailed proposals
   - Set realistic delivery times
   - Structure milestones for complex projects

2. **Client Selection**
   - Review multiple bids before selecting
   - Consider both price and quality
   - Check freelancer profiles and reviews
   - Evaluate delivery timeframes

3. **Communication**
   - Use proposal field to explain your approach
   - Be clear about what's included
   - Specify any conditions or requirements
   - Detail milestone deliverables

## Frontend Integration Example

```typescript
// Place a bid
async function placeBid(projectId: number, bidData: CreateBidDto) {
    const response = await fetch('/api/v1/project-bids', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            project_id: projectId,
            ...bidData
        })
    });
    return response.json();
}

// Get project bids with sorting
async function getProjectBids(projectId: number) {
    const response = await fetch(`/api/v1/project-bids/project/${projectId}`, {
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
    });
    const { data } = await response.json();
    
    // Sort by featured status and amount
    return data.sort((a, b) => {
        if (a.is_featured !== b.is_featured) {
            return b.is_featured ? 1 : -1;
        }
        return a.bid_amount - b.bid_amount;
    });
}

// Accept a bid
async function acceptBid(bidId: number) {
    const response = await fetch(`/api/v1/project-bids/${bidId}/status`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'accepted'
        })
    });
    return response.json();
}
```