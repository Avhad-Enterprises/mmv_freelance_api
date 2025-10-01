# Production-Ready User Architecture & Role-Based Access Control (RBAC) Implementation Plan

## 📋 Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Problems Identified](#problems-identified)
3. [Proposed Architecture](#proposed-architecture)
4. [Database Schema Design](#database-schema-design)
5. [Implementation Roadmap](#implementation-roadmap)
6. [File Structure](#file-structure)
7. [Migration Strategy](#migration-strategy)
8. [Benefits](#benefits)

---

## 🔍 Current State Analysis

### **Existing Implementation**

#### **Tables:**
- `users` - Single monolithic table with 80+ fields
- `role` - Basic roles table
- `permission` - Permissions table
- `user_roles` - User-role junction table
- `role_permission` - Role-permission junction table

#### **Account Types:**
- `client` - Businesses hiring freelancers
- `freelancer` - Generic term but actually includes:
  - `videographer` - Video shooting professionals
  - `videoeditor` - Video editing professionals
- `admin` - Platform administrators

#### **Current Field Distribution in `users` table:**

```typescript
// Common fields (✅ Shared by all): ~25 fields
- user_id, first_name, last_name, username, email, password
- phone_number, profile_picture, address_line_first, address_line_second
- city, state, country, pincode, latitude, longitude
- phone_verified, email_verified, is_active, is_banned, is_deleted
- banned_reason, reset_token, reset_token_expires, login_attempts, last_login_at
- bio, timezone, email_notifications
- created_at, updated_at

// Freelancer-specific (❌ NULL for clients): ~25 fields
- profile_title, skills, experience_level, portfolio_links
- hourly_rate, superpowers, skill_tags, short_description
- availability, work_type, hours_per_week, languages
- id_type, id_document_url, kyc_verified, aadhaar_verification
- certification, education, services, previous_works
- projects_applied, projects_completed
- hire_count, review_id, total_earnings, time_spent
- payout_method, bank_account_info

// Client-specific (❌ NULL for freelancers): ~20 fields
- company_name, industry, website, social_links
- company_size, required_services, required_skills
- required_editor_proficiencies, required_videographer_proficiencies
- budget_min, budget_max, address (business address)
- tax_id, business_documents
- work_arrangement, project_frequency, hiring_preferences
- expected_start_date, project_duration
- projects_created, total_spent, payment_method

// Account management (⚠️ Legacy field to remove): ~0 fields
```

---

## ⚠️ Problems Identified

### **1. Database Design Issues**

#### **Single Table with Sparse Data**
- **~70 columns total** in the users table with most being NULL for any given user
- Client has ~25 NULL freelancer-specific fields
- Freelancer has ~20 NULL client-specific fields
- **Database bloat**: Wasted storage and index space on NULL values
- **Query performance**: Slower queries due to extremely wide tables
- **Index inefficiency**: Unused columns consuming index space

#### **Type Confusion**
```typescript
// Current confusing hierarchy:
account_type: 'freelancer' | 'client'  // Top level
role: string                            // Separate role field (redundant)
// But 'freelancer' actually means videographer OR videoeditor
```

#### **Data Integrity Issues**
- No database-level constraints on field usage
- Can have `company_name` set for freelancers
- Can have `hourly_rate` set for clients
- Relies entirely on application-level validation

### **2. Architecture Issues**

#### **Mixed Concerns**
```typescript
// Single service handles all user types
class UsersService {
  getAllActiveClients()      // Client-specific
  getAllActiveFreelancers()  // Freelancer-specific
  getClientById()           // Client-specific
  getFreelancerById()       // Freelancer-specific
  // All in one massive service file
}
```

#### **Inconsistent Terminology**
- `account_type: 'freelancer'` but enum has `videographer` and `videoeditor`
- Registration API uses `videographer`, `videoeditor`, `client`
- Internal code uses `freelancer` as umbrella term
- Confusing for developers and frontend team

#### **Role System Not Utilized**
- Has `role`, `permission`, `user_roles`, `role_permission` tables
- But `account_type` field is used instead for access control
- Role system exists but isn't leveraged properly

### **3. Scalability Issues**

#### **Maintenance Nightmare**
- Single DTO with 50+ optional fields
- One validation file for all user types
- Difficult to add new user types
- Hard to maintain type-specific business logic

#### **Query Complexity**
```typescript
// Current: Complex filtering required
.where({ account_type: 'client', is_active: true })
.select(...50+ columns)

// Many NULL values returned, wasted bandwidth
```

---

## 🎯 Proposed Architecture

### **Core Principle: Polymorphic User System**

```
Base User (Common fields)
    ↓
    ├── Client Profile (Client-specific)
    ├── Videographer Profile (Videographer-specific)
    ├── Video Editor Profile (Video Editor-specific)
    └── Admin Profile (Admin-specific)
```

### **Account Types as Roles**
- Remove `account_type` string field
- Use `user_roles` table properly
- Map account types to roles:
  - `client` → `CLIENT` role
  - `videographer` → `VIDEOGRAPHER` role
  - `videoeditor` → `VIDEO_EDITOR` role
  - `admin` → `ADMIN` role

---

## 📊 Database Schema Design

### **1. Core Tables**

#### **`users` (Base Table) - ~25 fields**
```sql
CREATE TABLE users (
  -- Identity
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  
  -- Contact
  phone_number VARCHAR(50),
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  
  -- Profile
  profile_picture TEXT,
  bio TEXT,
  timezone VARCHAR(50),
  
  -- Address (shared by all)
  address_line_first VARCHAR(255),
  address_line_second VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  pincode VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Account Management
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  banned_reason TEXT,
  
  -- Security
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  last_login_at TIMESTAMP,
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **`freelancer_profiles` (Videographer & Video Editor common fields) - ~30 fields**
```sql
CREATE TABLE freelancer_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Professional Info
  profile_title VARCHAR(255) NOT NULL,
  short_description TEXT,
  experience_level VARCHAR(50),        -- entry, intermediate, expert, master
  
  -- Skills & Expertise
  skills JSONB DEFAULT '[]',           -- Array of skill names
  superpowers JSONB DEFAULT '[]',      -- Unique selling points
  skill_tags JSONB DEFAULT '[]',       -- Skill categories/tags
  languages JSONB DEFAULT '[]',        -- Languages spoken
  
  -- Portfolio & Credentials
  portfolio_links JSONB DEFAULT '[]',  -- Array of portfolio URLs
  certification JSONB,                 -- Certifications
  education JSONB,                     -- Education background
  previous_works JSONB,                -- Previous work samples
  services JSONB,                      -- Services offered
  
  -- Pricing & Availability
  hourly_rate DECIMAL(10, 2),
  availability VARCHAR(50),            -- full_time, part_time, flexible, on_demand
  work_type VARCHAR(50),               -- remote, on_site, hybrid
  hours_per_week VARCHAR(50),          -- less_than_20, 20_30, 30_40, more_than_40
  
  -- Verification
  id_type VARCHAR(50),                 -- passport, driving_license, national_id
  id_document_url TEXT,
  kyc_verified BOOLEAN DEFAULT false,
  aadhaar_verification BOOLEAN DEFAULT false,
  
  -- Stats & Performance
  hire_count INTEGER DEFAULT 0,
  review_id INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  
  -- Projects
  projects_applied JSONB DEFAULT '[]',
  projects_completed JSONB DEFAULT '[]',
  
  -- Payment
  payout_method JSONB,
  bank_account_info JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **`videographer_profiles` (Videographer-specific) - Currently no specific fields**
```sql
CREATE TABLE videographer_profiles (
  videographer_id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL UNIQUE REFERENCES freelancer_profiles(profile_id) ON DELETE CASCADE,
  
  -- NOTE: Current schema has no videographer-specific fields
  -- This table is prepared for future videographer-specific extensions
  -- Examples of future fields could be:
  -- - Specialized videography skills/niches
  -- - Equipment preferences (if tracking becomes needed)
  -- - Shooting style preferences
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **`videoeditor_profiles` (Video Editor-specific) - Currently no specific fields**
```sql
CREATE TABLE videoeditor_profiles (
  editor_id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL UNIQUE REFERENCES freelancer_profiles(profile_id) ON DELETE CASCADE,
  
  -- NOTE: Current schema has no video editor-specific fields
  -- This table is prepared for future video editor-specific extensions
  -- Examples of future fields could be:
  -- - Specialized editing skills/niches
  -- - Software proficiency levels (if detailed tracking becomes needed)
  -- - Editing style preferences
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **`client_profiles` (Client-specific) - ~25 fields**
```sql
CREATE TABLE client_profiles (
  client_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(50),                -- film, ad_agency, events, youtube, corporate, other
  website VARCHAR(255),                -- Company website URL
  social_links VARCHAR(255),           -- Social media links
  company_size VARCHAR(50),            -- 1-10, 11-50, 51-200, 200+
  
  -- Requirements & Services
  required_services JSONB DEFAULT '[]',                      -- Array of required services
  required_skills JSONB DEFAULT '[]',                        -- Array of required skills
  required_editor_proficiencies JSONB DEFAULT '[]',          -- Editor proficiency requirements
  required_videographer_proficiencies JSONB DEFAULT '[]',    -- Videographer proficiency requirements
  
  -- Budget
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  
  -- Business Details
  address VARCHAR(255),                -- Business address
  tax_id VARCHAR(100),                 -- Tax identification number
  business_documents JSONB,            -- Array of business document URLs
  
  -- Work Preferences
  work_arrangement VARCHAR(50),        -- remote, on_site, hybrid
  project_frequency VARCHAR(50),       -- one_time, occasional, ongoing
  hiring_preferences VARCHAR(50),      -- individuals, agencies, both
  expected_start_date VARCHAR(100),    -- Expected project start date
  project_duration VARCHAR(50),        -- less_than_week, 1_2_weeks, 2_4_weeks, 1_3_months, 3_plus_months
  
  -- Stats
  projects_created JSONB DEFAULT '[]',
  total_spent INTEGER DEFAULT 0,
  
  -- Payment
  payment_method JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **`admin_profiles` (Admin-specific) - Currently minimal fields**
```sql
CREATE TABLE admin_profiles (
  admin_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- NOTE: Current schema has no admin-specific fields beyond base user data
  -- This table is prepared for future admin-specific extensions
  -- Examples of future fields could be:
  -- - Admin level/tier
  -- - Department/area of responsibility
  -- - Special permissions
  -- - Admin activity logs reference
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Role & Permission Tables (Current Implementation)**

#### **`role` Table**
```sql
CREATE TABLE role (
  role_id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,    -- Role identifier (e.g., 'CLIENT', 'VIDEOGRAPHER')
  label VARCHAR(100),                   -- Display name
  description TEXT,                     -- Role description
  is_active BOOLEAN DEFAULT true,       -- Active/inactive status
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **`permission` Table**
```sql
CREATE TABLE permission (
  permission_id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,   -- Permission identifier (e.g., 'projects.create')
  label VARCHAR(100),                   -- Display name
  module VARCHAR(50),                   -- Module/feature area
  description TEXT,                     -- Permission description
  is_critical BOOLEAN DEFAULT false,    -- Critical permission flag
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER
);
```

#### **`user_roles` (Junction Table)**
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  role_id INTEGER NOT NULL REFERENCES role(role_id)
);
```

#### **`role_permission` (Junction Table)**
```sql
CREATE TABLE role_permission (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES role(role_id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permission(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

#### **Predefined Roles (To Be Seeded)**
```sql
INSERT INTO role (name, label, description) VALUES
('CLIENT', 'Client', 'Business or individual hiring freelancers'),
('VIDEOGRAPHER', 'Videographer', 'Video shooting professional'),
('VIDEO_EDITOR', 'Video Editor', 'Video editing professional'),
('ADMIN', 'Administrator', 'Platform administrator'),
('SUPER_ADMIN', 'Super Administrator', 'Full platform access');
```

---

## 🗂️ File Structure

### **Proposed Directory Structure**

```
src/
├── features/
│   ├── auth/                           # Authentication (unchanged)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.dto.ts
│   │
│   ├── users/                          # Base user management
│   │   ├── user.controller.ts          # Common user operations
│   │   ├── user.service.ts             # Base user CRUD
│   │   ├── user.routes.ts
│   │   ├── user.dto.ts
│   │   └── user.interface.ts
│   │
│   ├── clients/                        # Client-specific
│   │   ├── client.controller.ts
│   │   ├── client.service.ts           # Client profile operations
│   │   ├── client.routes.ts
│   │   ├── client.dto.ts
│   │   ├── client.interface.ts
│   │   └── client.registration.dto.ts
│   │
│   ├── freelancers/                    # Shared freelancer logic
│   │   ├── freelancer.controller.ts
│   │   ├── freelancer.service.ts       # Base freelancer operations
│   │   ├── freelancer.routes.ts
│   │   ├── freelancer.dto.ts
│   │   └── freelancer.interface.ts
│   │
│   ├── videographers/                  # Videographer-specific
│   │   ├── videographer.controller.ts
│   │   ├── videographer.service.ts     # Extends freelancer service
│   │   ├── videographer.routes.ts
│   │   ├── videographer.dto.ts
│   │   ├── videographer.interface.ts
│   │   └── videographer.registration.dto.ts
│   │
│   ├── videoeditors/                   # Video editor-specific
│   │   ├── videoeditor.controller.ts
│   │   ├── videoeditor.service.ts      # Extends freelancer service
│   │   ├── videoeditor.routes.ts
│   │   ├── videoeditor.dto.ts
│   │   ├── videoeditor.interface.ts
│   │   └── videoeditor.registration.dto.ts
│   │
│   ├── admin/                          # Admin-specific
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── admin.routes.ts
│   │   └── admin.dto.ts
│   │
│   ├── roles/                          # Role management (enhanced)
│   │   ├── role.controller.ts
│   │   ├── role.service.ts
│   │   └── role.routes.ts
│   │
│   └── permissions/                    # Permission management (enhanced)
│       ├── permission.controller.ts
│       ├── permission.service.ts
│       └── permission.routes.ts
│
├── middlewares/
│   ├── auth.middleware.ts              # JWT authentication
│   ├── role.middleware.ts              # NEW: Role-based access
│   ├── permission.middleware.ts        # NEW: Permission-based access
│   └── account-type.middleware.ts      # NEW: Account type validation
│
├── utils/
│   ├── rbac/                           # NEW: RBAC utilities
│   │   ├── role-checker.ts
│   │   ├── permission-checker.ts
│   │   └── access-control.ts
│   │
│   └── user/                           # NEW: User utilities
│       ├── user-type-detector.ts
│       └── profile-loader.ts
│
└── interfaces/
    ├── auth.interface.ts
    ├── rbac.interface.ts               # NEW: RBAC interfaces
    └── user-profile.interface.ts       # NEW: Profile interfaces

database/
├── users.schema.ts                     # Base users table
├── freelancer_profiles.schema.ts       # NEW
├── videographer_profiles.schema.ts     # NEW
├── videoeditor_profiles.schema.ts      # NEW
├── client_profiles.schema.ts           # NEW
├── admin_profiles.schema.ts            # NEW
├── role.schema.ts                      # Enhanced
├── permission.schema.ts                # Enhanced
├── user_roles.schema.ts                # Enhanced
└── role_permission.schema.ts           # Enhanced
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Database Migration (Week 1-2)**

#### **Step 1.1: Create New Profile Tables**
```bash
# Create schema files
npm run migrate:schema -- freelancer_profiles
npm run migrate:schema -- videographer_profiles
npm run migrate:schema -- videoeditor_profiles
npm run migrate:schema -- client_profiles
npm run migrate:schema -- admin_profiles
```

#### **Step 1.2: Migrate Data**
```typescript
// Migration script: scripts/migrate-user-profiles.ts
// 1. Copy freelancer data from users → freelancer_profiles
// 2. Copy videographer data → videographer_profiles
// 3. Copy editor data → videoeditor_profiles
// 4. Copy client data → client_profiles
// 5. Verify data integrity
```

#### **Step 1.3: Clean Up Users Table**
```sql
-- Remove type-specific columns from users table (after data migration)
ALTER TABLE users 
  -- Freelancer-specific fields to remove
  DROP COLUMN IF EXISTS profile_title,
  DROP COLUMN IF EXISTS skills,
  DROP COLUMN IF EXISTS experience_level,
  DROP COLUMN IF EXISTS portfolio_links,
  DROP COLUMN IF EXISTS hourly_rate,
  DROP COLUMN IF EXISTS superpowers,
  DROP COLUMN IF EXISTS skill_tags,
  DROP COLUMN IF EXISTS short_description,
  DROP COLUMN IF EXISTS availability,
  DROP COLUMN IF EXISTS work_type,
  DROP COLUMN IF EXISTS hours_per_week,
  DROP COLUMN IF EXISTS languages,
  DROP COLUMN IF EXISTS id_type,
  DROP COLUMN IF EXISTS id_document_url,
  DROP COLUMN IF EXISTS certification,
  DROP COLUMN IF EXISTS education,
  DROP COLUMN IF EXISTS services,
  DROP COLUMN IF EXISTS previous_works,
  DROP COLUMN IF EXISTS projects_applied,
  DROP COLUMN IF EXISTS projects_completed,
  DROP COLUMN IF EXISTS hire_count,
  DROP COLUMN IF EXISTS review_id,
  DROP COLUMN IF EXISTS total_earnings,
  DROP COLUMN IF EXISTS time_spent,
  DROP COLUMN IF EXISTS payout_method,
  DROP COLUMN IF EXISTS bank_account_info,
  DROP COLUMN IF EXISTS kyc_verified,
  DROP COLUMN IF EXISTS aadhaar_verification,
  
  -- Client-specific fields to remove
  DROP COLUMN IF EXISTS company_name,
  DROP COLUMN IF EXISTS industry,
  DROP COLUMN IF EXISTS website,
  DROP COLUMN IF EXISTS social_links,
  DROP COLUMN IF EXISTS company_size,
  DROP COLUMN IF EXISTS required_services,
  DROP COLUMN IF EXISTS required_skills,
  DROP COLUMN IF EXISTS required_editor_proficiencies,
  DROP COLUMN IF EXISTS required_videographer_proficiencies,
  DROP COLUMN IF EXISTS budget_min,
  DROP COLUMN IF EXISTS budget_max,
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS tax_id,
  DROP COLUMN IF EXISTS business_documents,
  DROP COLUMN IF EXISTS work_arrangement,
  DROP COLUMN IF EXISTS project_frequency,
  DROP COLUMN IF EXISTS hiring_preferences,
  DROP COLUMN IF EXISTS expected_start_date,
  DROP COLUMN IF EXISTS project_duration,
  DROP COLUMN IF EXISTS projects_created,
  DROP COLUMN IF EXISTS total_spent,
  DROP COLUMN IF EXISTS payment_method,
  
  -- Legacy fields to remove
  DROP COLUMN IF EXISTS account_type,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS otp_code,
  DROP COLUMN IF EXISTS account_status,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS updated_by;
```

### **Phase 2: RBAC Setup (Week 2)**

#### **Step 2.1: Seed Roles**
```typescript
// scripts/seed-roles.ts
await DB('role').insert([
  { name: 'CLIENT', label: 'Client', description: 'Business or individual hiring freelancers', is_active: true },
  { name: 'VIDEOGRAPHER', label: 'Videographer', description: 'Video shooting professional', is_active: true },
  { name: 'VIDEO_EDITOR', label: 'Video Editor', description: 'Video editing professional', is_active: true },
  { name: 'ADMIN', label: 'Administrator', description: 'Platform administrator', is_active: true },
  { name: 'SUPER_ADMIN', label: 'Super Administrator', description: 'Full platform access', is_active: true },
]);
```

#### **Step 2.2: Seed Permissions**
```typescript
// scripts/seed-permissions.ts
// Create module-based permissions using the existing permission schema structure
await DB('permission').insert([
  // User Management
  { name: 'users.view', label: 'View Users', module: 'users', description: 'View user profiles', is_critical: false },
  { name: 'users.create', label: 'Create Users', module: 'users', description: 'Create new users', is_critical: true },
  { name: 'users.update', label: 'Update Users', module: 'users', description: 'Update user profiles', is_critical: false },
  { name: 'users.delete', label: 'Delete Users', module: 'users', description: 'Delete users', is_critical: true },
  { name: 'users.ban', label: 'Ban Users', module: 'users', description: 'Ban/unban users', is_critical: true },

  // Project Management
  { name: 'projects.view', label: 'View Projects', module: 'projects', description: 'View projects', is_critical: false },
  { name: 'projects.create', label: 'Create Projects', module: 'projects', description: 'Create new projects', is_critical: false },
  { name: 'projects.update', label: 'Update Projects', module: 'projects', description: 'Update project details', is_critical: false },
  { name: 'projects.delete', label: 'Delete Projects', module: 'projects', description: 'Delete projects', is_critical: true },
  { name: 'projects.apply', label: 'Apply to Projects', module: 'projects', description: 'Apply as freelancer', is_critical: false },
  { name: 'projects.hire', label: 'Hire Freelancers', module: 'projects', description: 'Hire freelancers for projects', is_critical: false },

  // Payment Management
  { name: 'payments.view', label: 'View Payments', module: 'payments', description: 'View payment records', is_critical: false },
  { name: 'payments.process', label: 'Process Payments', module: 'payments', description: 'Process payments', is_critical: true },
  { name: 'payments.refund', label: 'Refund Payments', module: 'payments', description: 'Issue refunds', is_critical: true },

  // Content Management
  { name: 'content.view', label: 'View Content', module: 'content', description: 'View CMS content', is_critical: false },
  { name: 'content.create', label: 'Create Content', module: 'content', description: 'Create CMS content', is_critical: false },
  { name: 'content.update', label: 'Update Content', module: 'content', description: 'Update CMS content', is_critical: false },
  { name: 'content.delete', label: 'Delete Content', module: 'content', description: 'Delete CMS content', is_critical: true },

  // Admin Functions
  { name: 'admin.dashboard', label: 'Admin Dashboard', module: 'admin', description: 'Access admin dashboard', is_critical: false },
  { name: 'admin.analytics', label: 'Admin Analytics', module: 'admin', description: 'View platform analytics', is_critical: false },
  { name: 'admin.settings', label: 'Admin Settings', module: 'admin', description: 'Manage platform settings', is_critical: true },
  { name: 'admin.users', label: 'Manage Users', module: 'admin', description: 'Full user management', is_critical: true },
]);
```

#### **Step 2.3: Migrate User Roles**
```typescript
// scripts/migrate-user-roles.ts
// Convert account_type string → user_roles table entries
// This ensures backward compatibility during transition

const users = await DB('users').select('user_id', 'account_type');
const roles = await DB('role').select('role_id', 'name');

// Create role lookup map
const roleMap = {
  'client': roles.find(r => r.name === 'CLIENT')?.role_id,
  'videographer': roles.find(r => r.name === 'VIDEOGRAPHER')?.role_id,
  'videoeditor': roles.find(r => r.name === 'VIDEO_EDITOR')?.role_id,
  'admin': roles.find(r => r.name === 'ADMIN')?.role_id,
};

// Insert user_roles entries
for (const user of users) {
  if (user.account_type && roleMap[user.account_type]) {
    await DB('user_roles').insert({
      user_id: user.user_id,
      role_id: roleMap[user.account_type]
    });
  }
}
```

### **Phase 3: Code Refactoring (Week 3-4)**

#### **Step 3.1: Create Base Services**
```typescript
// src/features/users/user.service.ts
export class UserService {
  // Common user operations
  async getById(userId: number) { }
  async updateProfile(userId: number, data: any) { }
  async deleteUser(userId: number) { }
}
```

#### **Step 3.2: Create Specialized Services**
```typescript
// src/features/freelancers/freelancer.service.ts
export class FreelancerService extends UserService {
  async getFreelancerProfile(userId: number) {
    // Join users + freelancer_profiles
  }
}

// src/features/videographers/videographer.service.ts
export class VideographerService extends FreelancerService {
  async getVideographerProfile(userId: number) {
    // Join users + freelancer_profiles + videographer_profiles
  }
}
```

#### **Step 3.3: Create Middleware**
```typescript
// src/middlewares/role.middleware.ts
export const requireRole = (...roles: string[]) => {
  return async (req, res, next) => {
    const userRoles = await getUserRoles(req.user.user_id);
    if (userRoles.some(r => roles.includes(r))) {
      next();
    } else {
      throw new HttpException(403, 'Insufficient permissions');
    }
  };
};

// Usage:
router.get('/clients', requireRole('ADMIN'), clientController.getAll);
router.post('/projects', requireRole('CLIENT'), projectController.create);
```

### **Phase 4: Update Registration (Week 4)**

#### **Step 4.1: Separate Registration Endpoints**
```typescript
// POST /auth/register/client
// POST /auth/register/videographer
// POST /auth/register/videoeditor
// POST /auth/register/admin
```

#### **Step 4.2: Update DTOs**
```typescript
// src/features/clients/client.registration.dto.ts
export class ClientRegistrationDto {
  // Only client-specific fields
  @IsString()
  company_name: string;
  
  @IsEnum(['film', 'ad_agency', ...])
  industry: string;
  // ...
}
```

### **Phase 5: Update Routes & Access Control (Week 5)**

#### **Step 5.1: Organize Routes by User Type**
```typescript
// /api/v1/clients/*       - Client operations
// /api/v1/videographers/* - Videographer operations
// /api/v1/videoeditors/*  - Video editor operations
// /api/v1/admin/*         - Admin operations
// /api/v1/users/*         - Common user operations
```

#### **Step 5.2: Apply Access Control**
```typescript
// Only clients can create projects
router.post('/projects', 
  authMiddleware, 
  requireRole('CLIENT'),
  projectController.create
);

// Only freelancers can apply to projects
router.post('/projects/:id/apply', 
  authMiddleware, 
  requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR'),
  projectController.apply
);

// Only admins can ban users
router.post('/users/:id/ban', 
  authMiddleware, 
  requireRole('ADMIN'),
  requirePermission('users.ban'),
  userController.ban
);
```

### **Phase 6: Testing & Deployment (Week 6)**

#### **Step 6.1: Unit Tests**
- Test each service independently
- Test middleware functions
- Test role/permission checks

#### **Step 6.2: Integration Tests**
- Test registration flows
- Test profile updates
- Test access control

#### **Step 6.3: Migration Testing**
- Test data migration script
- Verify data integrity
- Test rollback procedures

---

## 📈 Benefits

### **1. Performance**
- **50% reduction** in table width
- **Faster queries** due to smaller indexes
- **Better caching** with focused tables
- **Reduced NULL values** = better storage

### **2. Maintainability**
- **Clear separation** of concerns
- **Type-safe** operations
- **Easier to add** new user types
- **Modular** codebase

### **3. Scalability**
- Can add new profile types without touching existing code
- Easy to scale horizontally (shard by user_id)
- Better for analytics (join only needed tables)

### **4. Security**
- **Proper RBAC** implementation
- **Permission-based** access control
- **Audit trail** capabilities
- **Type-safe** operations

### **5. Developer Experience**
- **Clear APIs** for each user type
- **Better TypeScript** support
- **Easier onboarding** for new developers
- **Self-documenting** code structure

---

## 🔄 Migration Strategy

### **Zero-Downtime Migration**

#### **Phase A: Dual Write (Week 1-2)**
```typescript
// Write to both old and new tables
async function createUser(data) {
  // 1. Write to old users table
  const user = await DB('users').insert(data);
  
  // 2. Write to new profile table
  if (data.account_type === 'client') {
    await DB('client_profiles').insert(/* client data */);
  }
  // ...
  
  return user;
}
```

#### **Phase B: Dual Read (Week 3)**
```typescript
// Read from new tables, fallback to old
async function getUser(userId) {
  try {
    // Try new structure
    return await getUserWithProfile(userId);
  } catch (error) {
    // Fallback to old structure
    return await DB('users').where({ user_id: userId }).first();
  }
}
```

#### **Phase C: Cut Over (Week 4)**
```typescript
// Remove old table reads
// All reads from new structure
// Monitor and validate
```

#### **Phase D: Cleanup (Week 5)**
```typescript
// Remove old columns
// Remove fallback code
// Optimize indexes
```

---

## 📝 API Changes

### **Before:**
```typescript
POST /auth/register
{
  "account_type": "freelancer",  // Confusing
  "profile_title": "Videographer",
  // 50+ fields...
}

GET /users/:id  // Returns all fields (many NULL)
```

### **After:**
```typescript
POST /auth/register/videographer
{
  // Only relevant fields
  "profile_title": "Videographer",
  "camera_equipment": ["Canon EOS R5"],
  // ...
}

GET /videographers/:id  // Returns only relevant fields
{
  "user": { /* base user data */ },
  "freelancer_profile": { /* common freelancer data */ },
  "videographer_profile": { /* videographer-specific data */ }
}
```

---

## 🎯 Success Metrics

### **Performance Metrics:**
- [ ] Query time reduced by 40%+
- [ ] Database size reduced by 30%+
- [ ] API response time < 200ms

### **Code Quality Metrics:**
- [ ] Code duplication < 10%
- [ ] Test coverage > 80%
- [ ] TypeScript strict mode enabled

### **Business Metrics:**
- [ ] Zero data loss during migration
- [ ] Zero downtime deployment
- [ ] Developer onboarding time < 2 days

---

## 🚨 Risk Mitigation

### **Data Loss Prevention:**
1. ✅ Full database backup before migration
2. ✅ Dual-write during transition
3. ✅ Data validation scripts
4. ✅ Rollback procedures documented

### **Downtime Prevention:**
1. ✅ Gradual migration approach
2. ✅ Feature flags for rollback
3. ✅ Load testing before deployment
4. ✅ Staging environment testing

### **Code Quality:**
1. ✅ Comprehensive test coverage
2. ✅ Code review requirements
3. ✅ CI/CD pipeline checks
4. ✅ Documentation requirements

---

## 📚 Documentation Requirements

### **Developer Documentation:**
- [ ] Architecture decision records (ADRs)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Migration guide
- [ ] Rollback procedures

### **User Documentation:**
- [ ] API changelog
- [ ] Breaking changes guide
- [ ] Migration timeline
- [ ] Support resources

---

## 🔗 Related Resources

- Database design patterns: [Polymorphic Associations](https://en.wikipedia.org/wiki/Polymorphic_association)
- RBAC best practices: [NIST RBAC Standard](https://csrc.nist.gov/projects/role-based-access-control)
- Zero-downtime migrations: [GitHub Engineering Blog](https://github.blog/2020-02-14-automating-mysql-schema-migrations-with-github-actions-and-more/)

---

## 📞 Support & Questions

For questions about this implementation plan:
1. Review this document
2. Check related ADRs in `/docs/adr/`
3. Consult with tech lead
4. Create RFC for major changes

---

**Version:** 1.0.0  
**Last Updated:** October 1, 2025  
**Status:** Draft  
**Author:** System Architect  
**Reviewers:** Tech Lead, Backend Team
