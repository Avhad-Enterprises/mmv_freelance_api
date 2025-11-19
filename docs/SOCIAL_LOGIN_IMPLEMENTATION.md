# Social Media Login Implementation Plan

## Overview
Given the complex registration forms (25+ fields each), social login should create a **basic user account** and redirect users to complete their profile with the remaining required fields.

## Recommended Architecture

### 1. **Frontend OAuth Flow**
```typescript
// Use Firebase Auth or direct OAuth libraries
// Example with Firebase:
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const handleGoogleLogin = async (userType: 'client' | 'videographer' | 'videoeditor') => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();
  
  // Send to backend
  const response = await fetch('/api/auth/social-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      token,
      userType
    })
  });
};
```

### 2. **Backend Social Auth Endpoint**
```typescript
// Add to auth.routes.ts
this.router.post(
  `${this.path}/social-login`,
  validationMiddleware(SocialLoginDto, 'body'),
  this.authController.socialLogin
);

// Add to auth.controller.ts
public async socialLogin(req: Request, res: Response) {
  const { provider, token, userType } = req.body;
  
  // Verify token and get user info
  const socialUser = await this.authService.verifySocialToken(provider, token);
  
  // Check if user exists
  let user = await this.authService.findUserByEmail(socialUser.email);
  
  if (!user) {
    // Create basic user account
    user = await this.authService.createSocialUser(socialUser, userType);
    
    // Return partial registration response
    return res.status(201).json({
      message: 'Account created, please complete your profile',
      user: { id: user.id, email: user.email, user_type: userType },
      requiresCompletion: true,
      completionUrl: `/complete-profile/${userType}`
    });
  }
  
  // Existing user - generate JWT
  const token = this.authService.generateToken(user);
  res.json({ token, user });
}
```

### 3. **Social Auth Service Methods**
```typescript
// Add to auth.service.ts
public async verifySocialToken(provider: string, token: string) {
  switch (provider) {
    case 'google':
      return this.verifyGoogleToken(token);
    case 'facebook':
      return this.verifyFacebookToken(token);
    default:
      throw new HttpException(400, 'Unsupported provider');
  }
}

private async verifyGoogleToken(token: string) {
  const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
  return {
    email: response.data.email,
    firstName: response.data.given_name,
    lastName: response.data.family_name,
    profilePicture: response.data.picture,
    providerId: response.data.sub
  };
}

public async createSocialUser(socialUser: any, userType: string) {
  // Create basic user record
  const [userId] = await DB(USERS_TABLE).insert({
    email: socialUser.email,
    first_name: socialUser.firstName,
    last_name: socialUser.lastName,
    profile_picture: socialUser.profilePicture,
    user_type: userType,
    is_social_login: true,
    social_provider: 'google',
    social_provider_id: socialUser.providerId,
    email_verified: true, // Social logins are pre-verified
    registration_status: 'partial' // Flag for completion
  });
  
  // Assign basic role
  await assignRole(userId, userType); // 'client', 'videographer', etc.
  
  return { id: userId, ...socialUser };
}
```

### 4. **Profile Completion Flow**
```typescript
// New endpoint for completing social registration
this.router.post(
  `${this.path}/complete-profile/:userType`,
  validationMiddleware(ClientRegistrationDto, 'body'), // Full DTO
  this.authController.completeSocialProfile
);

// In controller
public async completeSocialProfile(req: Request, res: Response) {
  const { userType } = req.params;
  const userId = req.user.id; // From JWT middleware
  
  // Update user with full profile data
  await this.authService.completeProfile(userId, req.body, userType);
  
  // Generate full JWT
  const token = this.authService.generateToken(updatedUser);
  res.json({ token, user: updatedUser });
}
```

## Benefits of This Approach

1. **Fast Onboarding**: Users can sign up in seconds
2. **Gradual Engagement**: Collect complex data over time
3. **Reduced Friction**: No overwhelming forms initially
4. **Flexible**: Works with existing complex registration logic
5. **Secure**: Proper token verification with providers

## Implementation Steps

1. **Install Dependencies**: `npm install axios jsonwebtoken bcrypt`
2. **Add Social DTOs**: Create `SocialLoginDto` and completion DTOs
3. **Update Auth Service**: Add social verification methods
4. **Update Database**: Add social login fields to users table
5. **Frontend Integration**: Add OAuth buttons and completion forms
6. **Testing**: Test full flow for each user type

## Security Considerations

- Always verify tokens server-side
- Store minimal social data (email, name, provider ID)
- Use HTTPS for all auth endpoints
- Implement rate limiting on social auth endpoints
- Handle token expiration gracefully

This approach maintains your existing complex registration logic while providing a smooth social login experience.