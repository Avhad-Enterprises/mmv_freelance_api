# WebSocket Chat API Documentation

## Overview
The WebSocket API provides real-time communication features including 1-on-1 chat, typing indicators, and real-time notifications. It is built using `socket.io`.

## Connection

**URL:** `http://localhost:8000` (or your production API URL)
**Path:** `/socket.io`
**Transports:** `websocket`, `polling`

### Authentication
Authentication is required to connect. You must provide a valid JWT token.

**Method 1: Auth Object (Preferred)**
```javascript
const socket = io('http://localhost:8000', {
  path: '/socket.io',
  auth: {
    token: 'YOUR_JWT_TOKEN' // Can be "Bearer <token>" or just "<token>"
  }
});
```

**Method 2: Query Parameter (Alternative)**
```javascript
// Not explicitly handled in code but often supported by some clients if auth object fails, 
// strictly speaking the backend code checks handshake.auth.token or handshake.headers.authorization
```

**Method 3: Extra Headers**
```javascript
const socket = io('http://localhost:8000', {
  path: '/socket.io',
  extraHeaders: {
    Authorization: 'Bearer YOUR_JWT_TOKEN'
  }
});
```

## Client -> Server Events (Emitted by Frontend)

### 1. Join Conversation
Join a specific conversation room to receive messages.

**Event:** `join_conversation`
**Payload:** `conversationId` (number | string)

```javascript
socket.emit('join_conversation', 123);
```

### 2. Leave Conversation
Leave a conversation room.

**Event:** `leave_conversation`
**Payload:** `conversationId` (number | string)

```javascript
socket.emit('leave_conversation', 123);
```

### 3. Send Message
Send a new message to a conversation.

**Event:** `send_message`
**Payload:**
```json
{
  "conversationId": 123,
  "content": "Hello world!",
  "toUserId": 456
}
```

**Response:**
- If successful, the server broadcasts `new_message` to the conversation room.
- If failed, the server emits `error` to the sender.

### 4. Mark Messages as Read
Mark all unread messages in a conversation as read.

**Event:** `mark_read`
**Payload:**
```json
{
  "conversationId": 123
}
```

### 5. Typing Indicators
Notify the other user that you are typing.

**Event:** `typing_start`
**Payload:**
```json
{
  "conversationId": 123,
  "toUserId": 456
}
```

**Event:** `typing_stop`
**Payload:**
```json
{
  "conversationId": 123,
  "toUserId": 456
}
```

## Server -> Client Events (Listened by Frontend)

### 1. New Message
Received when a new message is sent in a conversation you have joined.

**Event:** `new_message`
**Data Structure (Message Object):**
```json
{
  "id": 101,
  "conversation_id": 123,
  "sender_id": 456,
  "receiver_id": 789,
  "content": "Hello world!",
  "is_read": false,
  "read_at": null,
  "created_at": "2023-10-27T10:00:00.000Z"
}
```

### 2. Message Notification (Global)
Received when a message is sent to you, regardless of which conversation room you are in (e.g., for showing a global notification toast or updating an unread badge list).

**Event:** `message_notification`
**Data Structure:**
```json
{
  "id": 101,
  "conversation_id": 123,
  "sender_id": 456,
  "receiver_id": 789,
  "content": "Hello world!",
  "is_read": false,
  "created_at": "2023-10-27T10:00:00.000Z",
  "type": "new_message"
}
```

### 3. Messages Read Receipt
Received when the other user marks messages as read in a conversation.

**Event:** `messages_read`
**Data Structure:**
```json
{
  "conversationId": 123,
  "userId": 456, // The user who read the messages
  "readAt": "2023-10-27T10:05:00.000Z"
}
```

### 4. Typing Indicators
Received when the other user starts or stops typing.

**Event:** `typing_start`
**Data Structure:**
```json
{
  "conversationId": 123,
  "userId": 456 // The user who is typing
}
```

**Event:** `typing_stop`
**Data Structure:**
```json
{
  "conversationId": 123,
  "userId": 456 // The user who stopped typing
}
```

### 5. System Notifications
Real-time system notifications (e.g., "Project assigned", "Payment received").

**Event:** `new_notification`
**Data Structure:**
```json
{
  "id": 50,
  "user_id": 789,
  "title": "Project Update",
  "message": "You have been assigned to Project X",
  "type": "project_assigned",
  "created_at": "2023-10-27T12:00:00.000Z"
}
```

### 6. Errors
General socket errors.

**Event:** `error`
**Data Structure:**
```json
{
  "message": "Failed to send message"
}
```

## Example Usage (React)

```javascript
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatComponent = ({ conversationId, currentUserId, token }) => {
  const socketRef = useRef();

  useEffect(() => {
    // 1. Connect
    socketRef.current = io('http://localhost:8000', {
      path: '/socket.io',
      auth: { token }
    });

    const socket = socketRef.current;

    // 2. Setup Listeners
    socket.on('connect', () => {
      console.log('Connected');
      // Join the conversation room
      socket.emit('join_conversation', conversationId);
    });

    socket.on('new_message', (message) => {
      console.log('New message received:', message);
      // Append to UI list
    });

    socket.on('typing_start', ({ userId }) => {
      if (userId !== currentUserId) {
        console.log(`User ${userId} is typing...`);
      }
    });

    return () => {
      // Cleanup
      socket.emit('leave_conversation', conversationId);
      socket.disconnect();
    };
  }, [conversationId, token]);

  const sendMessage = (content, toUserId) => {
    socketRef.current.emit('send_message', {
      conversationId,
      content,
      toUserId
    });
  };

  return <div>Chat UI Here</div>;
};
```
