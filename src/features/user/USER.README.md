# User Registration & Login Backend Implementation Plan

## Frontend Integration Analysis

Based on the frontend registration/login specification, this document outlines the exact backend changes needed for seamless API integration.

---

## 🎯 **Critical Frontend Requirements Analysis**

### **Current Backend vs Frontend Mismatch:**

| Aspect | Frontend Expects | Current Backend | Status |
|--------|------------------|----------------|---------|
| **Registration Endpoint** | `POST /api/auth/register` | `POST /users/insert_user` | ❌ MISMATCH |
| **Login Endpoint** | `POST /users/loginf` | `POST /users/loginf` | ✅ MATCH |
| **Field Names** | `first_name`, `last_name` | `full_name` | ❌ MISMATCH |
| **Multi-step Registration** | 5-step process | Single step | ❌ MISSING |
| **File Uploads** | ID documents, business docs | Not implemented | ❌ MISSING |
| **Account Types** | `"freelancer"`, `"client"` | Uses `"freelancer"`, `"client"` | ✅ MATCH |

---

## 📋 **Implementation Phases**

### **PHASE 1: Critical Schema & Interface Fixes** ⏱️ 2-3 hours

#### **1.1 Database Schema Updates**
- [ ] Add missing fields to users table
- [ ] Update field names to match frontend
- [ ] Add proper constraints and validations

#### **1.2 Interface & DTO Updates**
- [ ] Update `user.interface.ts` to match frontend fields
- [ ] Update `user.dto.ts` with complete field definitions
- [ ] Add separate DTOs for freelancer/client registration

#### **1.3 Authentication Bug Fixes**
- [ ] Fix banned user logic bug (`user.is_banned = false` → `user.is_banned === true`)
- [ ] Update JWT middleware to properly attach user data
- [ ] Fix token validation and user lookup

---

### **PHASE 2: Registration Endpoint Creation** ⏱️ 3-4 hours

#### **2.1 New Registration Route**
- [ ] Create `POST /api/auth/register` endpoint
- [ ] Implement multi-step registration logic
- [ ] Add comprehensive field validation
- [ ] Support both freelancer and client registration

#### **2.2 File Upload Support**
- [ ] Implement ID document upload for freelancers
- [ ] Implement business document upload for clients
- [ ] Add file validation (size, type, format)
- [ ] Store file URLs in database

#### **2.3 Data Processing**
- [ ] Handle arrays (skills, languages, services)
- [ ] Process nested data structures
- [ ] Implement proper data sanitization
- [ ] Add enum validation for all dropdown fields

---

### **PHASE 3: Response Format Standardization** ⏱️ 1-2 hours

#### **3.1 Login Response**
- [ ] Ensure login returns proper token structure
- [ ] Include `account_type` in user data
- [ ] Remove sensitive data from responses
- [ ] Add consistent error handling

#### **3.2 Registration Response**
- [ ] Return JWT token after successful registration
- [ ] Include complete user profile data
- [ ] Add success/error message formatting
- [ ] Implement proper HTTP status codes

---

### **PHASE 4: Field Validation & Security** ⏱️ 1-2 hours

#### **4.1 Frontend-Specific Validations**
- [ ] Password: Min 6 chars, 1 uppercase, 1 number
- [ ] Phone: Exactly 10 digits, numeric only
- [ ] Email/Username uniqueness validation
- [ ] Enum field validation against allowed values

#### **4.2 Security Enhancements**
- [ ] Add rate limiting for auth endpoints
- [ ] Implement proper CORS headers
- [ ] Add input sanitization
- [ ] Secure file upload handling

---

## 🔧 **Detailed Implementation Checklist**

### **A. Database Schema Changes**

#### **A.1 Add Missing Fields** ✅ REQUIRED
```sql
-- Add these fields to users table if missing:
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT; -- for clients
ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(10); -- for clients
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_documents JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS expected_start_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS project_duration VARCHAR(100);
```

#### **A.2 Update Existing Fields** ✅ REQUIRED
- [ ] Make `full_name` optional and add `first_name`/`last_name`
- [ ] Update `languages_spoken` to match frontend `languages`
- [ ] Ensure JSONB fields are properly configured

### **B. Interface Updates**

#### **B.1 User Interface (`user.interface.ts`)** ✅ CRITICAL
```typescript
export interface Users {
  user_id: number;
  username: string;
  first_name: string;          // ← ADD THIS
  last_name: string;           // ← ADD THIS
  full_name?: string;          // ← MAKE OPTIONAL
  email: string;
  phone_number: string;
  password?: string;
  profile_picture?: string;
  account_type: "freelancer" | "client";
  
  // Freelancer fields
  profile_title?: string;
  skill?: string[];
  experience_level?: "Beginner" | "Intermediate" | "Expert";
  portfolio_links?: string[];
  hourly_rate?: number;
  availability?: "Part-time" | "Full-time" | "Flexible" | "On-Demand";
  work_type?: "Remote Only" | "On-Site" | "Hybrid";
  languages?: string[];        // ← UPDATE FROM languages_spoken
  hours_per_week?: number;
  
  // Client fields
  company_name?: string;
  industry?: string;
  website?: string;
  social_links?: string;
  company_size?: "1-10" | "11-50" | "51-200" | "200+";
  budget_min?: number;         // ← ADD avg_budget_min
  budget_max?: number;         // ← ADD avg_budget_max
  work_arrangement?: string;   // ← ADD preferred_work_arrangement
  project_frequency?: "One-time" | "Occasional" | "Ongoing";
  hiring_preferences?: "Individuals" | "Agencies" | "Both";
  
  // Location fields
  street_address?: string;     // ← ADD THIS
  address?: string;            // ← ADD FOR CLIENTS
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;           // ← ADD THIS
  pincode?: string;            // ← ADD FOR CLIENTS
  
  // Document fields
  id_type?: string;
  id_document_url?: string;
  business_documents?: string[]; // ← ADD THIS
  tax_id?: string;             // ← ADD THIS
  
  // System fields
  is_active?: boolean;
  is_banned?: boolean;
  is_deleted?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
```

### **C. DTO Updates**

#### **C.1 Base Registration DTO** ✅ CRITICAL
```typescript
// Base fields for both account types
export class BaseRegistrationDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @Matches(/^[A-Za-z]+$/)
  first_name: string;

  @IsString()
  @Matches(/^[A-Za-z]+$/)
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*\d)/)
  password: string;

  @IsEnum(['freelancer', 'client'])
  account_type: 'freelancer' | 'client';

  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/)
  phone_number: string;
}
```

#### **C.2 Freelancer Registration DTO** ✅ REQUIRED
```typescript
export class FreelancerRegistrationDto extends BaseRegistrationDto {
  // Professional Information
  @IsString()
  profile_title: string;

  @IsArray()
  @ArrayMinSize(1)
  skills: string[];

  @IsEnum(['entry', 'intermediate', 'expert', 'master'])
  experience_level: string;

  @IsOptional()
  @IsUrl()
  portfolio_links?: string;

  @IsNumber()
  @Min(100)
  @Max(10000)
  hourly_rate: number;

  // Location
  @IsString()
  street_address: string;

  @IsString()
  country: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  zip_code: string;

  @IsEnum(['passport', 'driving_license', 'national_id'])
  id_type: string;

  // Work Preferences
  @IsEnum(['full_time', 'part_time', 'flexible', 'on_demand'])
  availability: string;

  @IsEnum(['less_than_20', '20_30', '30_40', 'more_than_40'])
  hours_per_week: string;

  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_type: string;

  @IsArray()
  @ArrayMinSize(1)
  languages: string[];
}
```

#### **C.3 Client Registration DTO** ✅ REQUIRED
```typescript
export class ClientRegistrationDto extends BaseRegistrationDto {
  // Company Information
  @IsString()
  company_name: string;

  @IsEnum(['film', 'ad_agency', 'events', 'youtube', 'corporate', 'other'])
  industry: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  social_links?: string;

  @IsEnum(['1-10', '11-50', '51-200', '200+'])
  company_size: string;

  @IsArray()
  @ArrayMinSize(1)
  required_services: string[];

  @IsArray()
  @ArrayMinSize(1)
  required_skills: string[];

  @IsArray()
  @ArrayMinSize(1)
  required_editor_proficiencies: string[];

  @IsArray()
  @ArrayMinSize(1)
  required_videographer_proficiencies: string[];

  @IsNumber()
  @Min(0)
  budget_min: number;

  @IsNumber()
  budget_max: number;

  // Location
  @IsString()
  address: string;

  @IsString()
  country: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  @Length(5, 6)
  @Matches(/^\d{5,6}$/)
  pincode: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  // Work Preferences
  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_arrangement: string;

  @IsEnum(['one_time', 'occasional', 'ongoing'])
  project_frequency: string;

  @IsEnum(['individuals', 'agencies', 'both'])
  hiring_preferences: string;

  @IsOptional()
  @IsDateString()
  expected_start_date?: string;

  @IsOptional()
  @IsEnum(['less_than_week', '1_2_weeks', '2_4_weeks', '1_3_months', '3_plus_months'])
  project_duration?: string;
}
```

### **D. Route Implementation**

#### **D.1 New Registration Route** ✅ CRITICAL
```typescript
// In user.routes.ts
this.router.post(
  '/api/auth/register',
  upload.fields([
    { name: 'id_document', maxCount: 1 },
    { name: 'business_documents', maxCount: 5 }
  ]),
  this.usersController.registerUser
);
```

#### **D.2 Update Login Response** ✅ REQUIRED
```typescript
// Ensure login returns this structure:
{
  data: {
    token: string,
    user: {
      user_id: number,
      account_type: "freelancer" | "client",
      username: string,
      email: string,
      first_name: string,
      last_name: string,
      // ... other non-sensitive fields
    }
  },
  message: string
}
```

### **E. Service Layer Updates**

#### **E.1 Registration Service** ✅ CRITICAL
```typescript
public async registerUser(data: FreelancerRegistrationDto | ClientRegistrationDto, files?: any): Promise<Users> {
  // 1. Validate unique email/username
  // 2. Hash password
  // 3. Handle file uploads
  // 4. Transform data to match schema
  // 5. Insert user with all fields
  // 6. Return user data (excluding password)
}
```

#### **E.2 Fix Authentication Bugs** ✅ CRITICAL
```typescript
// Fix in user.service.ts
if (user.is_banned === true) {  // ← FIX: was using assignment (=)
  throw new HttpException(403, "Your account has been banned.");
}
```

### **F. Middleware Updates**

#### **F.1 Auth Middleware Fix** ✅ CRITICAL
```typescript
// In auth.middleware.ts
const verificationResponse = (await jwt.verify(bearerToken, secret)) as DataStoredInToken;
if (verificationResponse) {
  // ADD: Fetch user data and attach to request
  const userData = await DB('users').where('user_id', verificationResponse.user_id).first();
  req.user = userData;
  await DB.raw("SET search_path TO public");
  next();
}
```

#### **F.2 File Upload Middleware** ✅ NEW
```typescript
// Add multer configuration for file uploads
import multer from 'multer';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    // validation logic
  }
});
```

---

## 🧪 **Testing Checklist**

### **Frontend Integration Tests**
- [ ] **Freelancer Registration**: Complete 5-step process
- [ ] **Client Registration**: Complete 5-step process  
- [ ] **Login**: Email/username + password
- [ ] **File Upload**: ID documents and business documents
- [ ] **Field Validation**: All frontend validations work
- [ ] **Response Format**: Matches frontend expectations
- [ ] **Token Generation**: JWT includes correct user data
- [ ] **Error Handling**: Proper error messages and codes

### **API Response Tests**
- [ ] Registration returns token + user data
- [ ] Login returns token + user data  
- [ ] Protected routes work with token
- [ ] File uploads return proper URLs
- [ ] Validation errors are descriptive
- [ ] Account type-specific fields are handled

---

## 📅 **Implementation Timeline**

### **Day 1: Schema & Interface Fixes** (4-5 hours)
- Morning: Database schema updates
- Afternoon: Interface and DTO updates
- Evening: Authentication bug fixes

### **Day 2: Registration Endpoint** (6-7 hours)
- Morning: New registration route setup
- Afternoon: File upload implementation
- Evening: Data processing and validation

### **Day 3: Testing & Polish** (3-4 hours)
- Morning: Frontend integration testing
- Afternoon: Error handling and edge cases
- Evening: Documentation and cleanup

---

## ⚠️ **Critical Dependencies**

### **Required NPM Packages**
```bash
npm install multer @types/multer
npm install class-validator class-transformer
npm install express-rate-limit
```

### **Environment Variables**
```env
# Add to .env
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
JWT_SECRET=your_jwt_secret
```

---

## 🎯 **Success Criteria**

### **Must Have**
- ✅ Frontend can register freelancers (5-step process)
- ✅ Frontend can register clients (5-step process)
- ✅ Frontend can login with email/username
- ✅ File uploads work for both account types
- ✅ JWT authentication is seamless
- ✅ All field validations match frontend

### **Should Have**
- ✅ Proper error messages for all validation failures
- ✅ Consistent API response format
- ✅ Secure file handling
- ✅ Rate limiting on auth endpoints

### **Nice to Have**
- ✅ Email verification flow
- ✅ Password reset functionality
- ✅ Comprehensive logging
- ✅ API documentation updates

---

*This implementation plan is based strictly on the frontend registration/login specification and current backend analysis. All changes are minimal and focused on compatibility.*
