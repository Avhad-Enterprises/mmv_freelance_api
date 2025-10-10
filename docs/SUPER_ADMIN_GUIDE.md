# Super Admin Management System

## Setup Instructions

### 1. Create Super Admin Account

Run the script to create your first super admin:

```bash
# Using default credentials
npx ts-node scripts/create-super-admin.ts

# Using custom credentials
npx ts-node scripts/create-super-admin.ts --email "admin@yourcompany.com" --password "YourSecurePassword123!" --first-name "Admin" --last-name "User"
```

**Default Credentials:**
- Email: `superadmin@mmv.com`
- Password: `SuperAdmin123!`

### 2. Login as Super Admin

Use the login endpoint with super admin credentials:

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "superadmin@mmv.com",
  "password": "SuperAdmin123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "email": "superadmin@mmv.com",
      "first_name": "Super",
      "last_name": "Admin",
      "username": "superadmin",
      "roles": ["SUPER_ADMIN"]
    },
    "token": "eyJhbGci..."
  }
}
```

## Super Admin Capabilities

### User Management

#### 1. Get All Users (with Pagination)
```
GET /api/v1/users?page=1&limit=10&search=john&role=CLIENT
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `search` (optional): Search by name, email, or username
- `role` (optional): Filter by role (CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN)

#### 2. Create New User
```
POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone_number": "+1234567890",
  "city": "New York",
  "country": "USA",
  "roleName": "CLIENT",
  "profileData": {
    "company_name": "John's Company",
    "industry": "Marketing"
  }
}
```

#### 3. Update User
```
PUT /api/v1/users/123
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "John Updated",
  "email": "john.updated@example.com",
  "password": "NewPassword123!"
}
```

#### 4. Delete User
```
DELETE /api/v1/users/123
Authorization: Bearer {token}
```

#### 5. Get User Details
```
GET /api/v1/users/123
Authorization: Bearer {token}
```

#### 6. Get User with Profile
```
GET /api/v1/users/123/profile
Authorization: Bearer {token}
```

#### 7. Ban/Unban User
```
POST /api/v1/users/123/ban
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Violation of terms"
}
```

```
POST /api/v1/users/123/unban
Authorization: Bearer {token}
```

### Role Management

#### 1. Get User's Roles
```
GET /api/v1/users/123/roles
Authorization: Bearer {token}
```

#### 2. Assign Role to User
```
POST /api/v1/users/123/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "roleName": "ADMIN"
}
```

#### 3. Remove Role from User
```
DELETE /api/v1/users/123/roles/2
Authorization: Bearer {token}
```

#### 4. Get User's Permissions
```
GET /api/v1/users/123/permissions
Authorization: Bearer {token}
```

### Role & Permission Management

#### 1. Get All Roles
```
GET /api/v1/role/getrole
Authorization: Bearer {token}
```

#### 2. Create New Role
```
POST /api/v1/role/insertrole
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "CUSTOM_ROLE",
  "label": "Custom Role",
  "description": "A custom role for specific purposes"
}
```

#### 3. Get All Permissions
```
GET /api/v1/permission/getpermission
Authorization: Bearer {token}
```

#### 4. Create New Permission
```
POST /api/v1/permission/insertpermission
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "custom.action",
  "label": "Custom Action",
  "module": "custom",
  "description": "Allows custom actions"
}
```

## User Creation by Role Type

### Creating a Client
```json
{
  "first_name": "Business",
  "last_name": "Owner",
  "email": "business@company.com",
  "password": "SecurePass123!",
  "roleName": "CLIENT",
  "profileData": {
    "company_name": "ABC Company",
    "industry": "Technology",
    "website": "https://abc.com",
    "budget_min": 1000,
    "budget_max": 10000
  }
}
```

### Creating a Videographer
```json
{
  "first_name": "Video",
  "last_name": "Shooter",
  "email": "videographer@example.com",
  "password": "SecurePass123!",
  "roleName": "VIDEOGRAPHER",
  "profileData": {
    "profile_title": "Professional Videographer",
    "experience_level": "expert",
    "hourly_rate": 75,
    "skills": ["Wedding Videography", "Corporate Videos"],
    "short_description": "Experienced videographer specializing in events"
  }
}
```

### Creating a Video Editor
```json
{
  "first_name": "Video",
  "last_name": "Editor",
  "email": "editor@example.com",
  "password": "SecurePass123!",
  "roleName": "VIDEO_EDITOR",
  "profileData": {
    "profile_title": "Professional Video Editor",
    "experience_level": "intermediate",
    "hourly_rate": 50,
    "skills": ["After Effects", "Premiere Pro"],
    "short_description": "Creative video editor with motion graphics expertise"
  }
}
```

### Creating an Admin
```json
{
  "first_name": "Platform",
  "last_name": "Admin",
  "email": "admin@mmv.com",
  "password": "SecurePass123!",
  "roleName": "ADMIN",
  "profileData": {}
}
```

## Security Features

### Permissions
Super Admins have all permissions (`*` wildcard), including:
- `users.view`, `users.create`, `users.update`, `users.delete`, `users.ban`
- `admin.dashboard`, `admin.analytics`, `admin.users`, `admin.roles`
- `projects.*`, `payments.*`, `content.*`, `reviews.*`, `reports.*`

### Role Hierarchy
1. **SUPER_ADMIN**: Full platform access, can manage all users and roles
2. **ADMIN**: Platform management, limited user management
3. **CLIENT**: Project posting and management
4. **VIDEOGRAPHER**: Project application and completion
5. **VIDEO_EDITOR**: Video editing projects

### Best Practices

1. **Change Default Password**: Always change the default super admin password after first login
2. **Limit Super Admins**: Only create super admin accounts when necessary
3. **Use ADMIN Role**: For most administrative tasks, use ADMIN role instead of SUPER_ADMIN
4. **Monitor Activity**: Keep track of user creation and role assignments
5. **Secure Endpoints**: All admin endpoints require proper authentication and permissions

## Error Handling

Common error responses:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

**Common Status Codes:**
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (user/resource not found)
- `409`: Conflict (email already exists)

## Troubleshooting

### Cannot Login as Super Admin
1. Verify the super admin was created successfully
2. Check email and password
3. Ensure the user has SUPER_ADMIN role assigned

### Permission Denied Errors
1. Verify the token is valid and not expired
2. Check if the user has the required role (SUPER_ADMIN)
3. Ensure the user has the specific permission for the action

### User Creation Fails
1. Check for duplicate email addresses
2. Verify all required fields are provided
3. Ensure the role name is valid
4. Check profile data structure for the specific role type