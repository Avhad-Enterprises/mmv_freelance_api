# Firebase Admin SDK Setup Guide

## Overview
This guide will help you set up Firebase Admin SDK for the backend API to enable chat authentication with custom tokens.

## Prerequisites
- Firebase project created
- Firebase Admin SDK installed (already included in package.json)

## Step 1: Generate Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Project Settings** (gear icon)
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file and keep it secure

## Step 2: Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### How to Get Values from Service Account JSON:

From the downloaded JSON file, copy:
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters as-is)
- `client_email` → `FIREBASE_CLIENT_EMAIL`

**Important:** The private key must include `\n` for line breaks. Example:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...\n-----END PRIVATE KEY-----\n"
```

## Step 3: Restart the Server

After adding the environment variables, restart your backend server:

```bash
npm run dev
# or
npm start
```

## Step 4: Test the Endpoint

### Request
```http
GET http://localhost:8000/api/v1/auth/firebase-token
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Expected Response
```json
{
  "success": true,
  "message": "Firebase token generated successfully",
  "data": {
    "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Troubleshooting

### Error: "Firebase Admin is not initialized"
- Check that all three environment variables are set correctly
- Ensure the private key includes proper `\n` characters
- Restart the server after adding environment variables

### Error: "User authentication required"
- Make sure you're sending a valid JWT token in the Authorization header
- Token format: `Bearer YOUR_TOKEN`

### Error: "Firebase authentication service is unavailable"
- Verify Firebase Admin SDK configuration
- Check server logs for initialization errors
- Ensure service account has proper permissions in Firebase Console

## Security Notes

1. **Never commit the service account JSON file** to version control
2. **Keep environment variables secure** - use `.env` file (already in .gitignore)
3. **Rotate service account keys** periodically
4. **Limit service account permissions** to only what's needed

## How It Works

1. Frontend user logs in with your authentication system (JWT)
2. Frontend requests a Firebase custom token from `/api/v1/auth/firebase-token`
3. Backend validates the JWT token
4. Backend generates a Firebase custom token using Firebase Admin SDK
5. Frontend uses the custom token to sign in to Firebase Client SDK
6. User can now access Firestore chat features with their authenticated identity

## API Endpoint Details

**Endpoint:** `GET /api/v1/auth/firebase-token`

**Authentication:** Required (JWT Bearer Token)

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    customToken: string;  // Use this to sign in to Firebase on frontend
  }
}
```

**Custom Claims Included:**
- `email`: User's email address
- `firstName`: User's first name
- `roles`: User's roles (if available)

## Frontend Integration

Once the token is generated, use it in your frontend:

```typescript
import { getAuth, signInWithCustomToken } from "firebase/auth";

const response = await fetch('/api/v1/auth/firebase-token', {
  headers: { 'Authorization': `Bearer ${userJwtToken}` }
});

const { data } = await response.json();
const auth = getAuth();
await signInWithCustomToken(auth, data.customToken);

// Now user is authenticated with Firebase!
```

## Additional Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Custom Token Authentication](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
