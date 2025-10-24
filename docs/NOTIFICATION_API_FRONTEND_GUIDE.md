# Notification API Guide

## Overview
The Notification API allows managing user notifications including creating, reading, marking as read, and deleting notifications.

## Authentication
All notification endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

## Endpoints

### 1. Get My Notifications
Get all notifications for the authenticated user.

```bash
GET /api/v1/notification/my-notifications
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "title": "New Project Match",
      "message": "A new project matches your skills",
      "type": "project_match",
      "related_id": 456,
      "related_type": "project",
      "redirect_url": "/projects/456",
      "is_read": false,
      "read_at": null,
      "meta": {
        "project_title": "Video Editor Needed",
        "budget": 1000
      },
      "created_at": "2025-10-24T10:00:00Z",
      "updated_at": "2025-10-24T10:00:00Z"
    }
  ]
}
```

### 2. Create Notification
Create a new notification for a user. Requires ADMIN or SUPER_ADMIN role.

```bash
POST /api/v1/notification
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 123,
  "title": "Welcome!",
  "message": "Welcome to our platform",
  "type": "welcome",
  "redirect_url": "/dashboard",
  "meta": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification created",
  "data": {
    "id": 1,
    "user_id": 123,
    "title": "Welcome!",
    "message": "Welcome to our platform",
    "type": "welcome",
    "redirect_url": "/dashboard",
    "is_read": false,
    "meta": {
      "key": "value"
    },
    "created_at": "2025-10-24T10:00:00Z",
    "updated_at": "2025-10-24T10:00:00Z"
  }
}
```

### 3. Mark Notification as Read
Mark a specific notification as read.

```bash
GET /api/v1/notification/read/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification 1 marked as read successfully",
  "data": {
    "id": 1,
    "is_read": true,
    "read_at": "2025-10-24T10:30:00Z"
  }
}
```

### 4. Mark All Notifications as Read
Mark all notifications for the authenticated user as read.

```bash
POST /api/v1/notification/read-all
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "data": 5
}
```

### 5. Get Unread Notification Count
Get the count of unread notifications for the authenticated user.

```bash
GET /api/v1/notification/my-count
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Unread Notification count fetched successfully",
  "data": 3
}
```

### 6. Delete Notification
Delete a specific notification. User can only delete their own notifications unless they have ADMIN role.

```bash
DELETE /api/v1/notification/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification 1 deleted"
}
```

## Notification Types
Common notification types used in the system:
- `welcome`: Welcome messages for new users
- `project_match`: Matching projects based on skills
- `project_applied`: When someone applies to a project
- `project_update`: Updates to project status
- `payment`: Payment related notifications
- `system`: System announcements
- `message`: Direct messages
- `review`: New reviews received

## Meta Field Usage
The `meta` field allows storing additional contextual data:

```json
{
  "project_match": {
    "project_id": 123,
    "project_title": "Video Editor Needed",
    "budget": 1000,
    "deadline": "2025-11-24"
  },
  "payment": {
    "amount": 500,
    "currency": "USD",
    "transaction_id": "tx_123"
  },
  "message": {
    "sender_id": 456,
    "sender_name": "John Doe",
    "thread_id": "thread_123"
  }
}
```

## Error Handling

### Common Errors

```json
{
  "success": false,
  "message": "Notification not found",
  "statusCode": 404
}
```

**Status Codes:**
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (notification doesn't exist)
- `500`: Server Error

## Best Practices

1. **Real-time Updates**: Use WebSocket connections to receive notifications in real-time
2. **Pagination**: When fetching notifications, use pagination parameters if available
3. **Error Handling**: Always handle error responses gracefully
4. **Read Status**: Track read/unread status to show proper indicators in UI
5. **Cleanup**: Periodically clean up old notifications (e.g., older than 30 days)

## Frontend Integration Example

```typescript
// Fetch notifications
async function fetchNotifications() {
  const response = await fetch('/api/v1/notification/my-notifications', {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  return response.json();
}

// Mark as read
async function markAsRead(notificationId: number) {
  const response = await fetch(`/api/v1/notification/read/${notificationId}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  return response.json();
}

// Create notification (admin only)
async function createNotification(data: NotificationData) {
  const response = await fetch('/api/v1/notification', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

## WebSocket Integration (Optional)

If your system supports WebSocket notifications:

```typescript
const ws = new WebSocket('ws://your-api/notifications');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Update UI with new notification
  updateNotificationUI(notification);
};

// Handle reconnection
ws.onclose = () => {
  setTimeout(() => {
    // Attempt to reconnect
  }, 1000);
};
```

## Testing
Use the provided test suite to verify notification functionality:

```bash
# Run notification API tests
node tests/notification/test-notification-routes.js
```