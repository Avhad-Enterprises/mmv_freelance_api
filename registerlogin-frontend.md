# Registration and Login API Specification

This document provides a comprehensive specification of all the fields and request bodies required for user registration and login functionality in the MMV Freelance Frontend application.

## Overview# Registration and Login API Specification

This document provides a comprehensive specification of all the fields and request bodies required for user registration and login functionality in the MMV Freelance Frontend application.

## Overview

The application supports two types of user accounts:
- **Freelancer** (also referred to as "candidate")
- **Client** (also referred to as "employer")

The application uses a **Multi-Step Registration Form** with 5 comprehensive steps for both account types.

## 1. LOGIN

### Endpoint
```
POST /users/loginf
```

### Request Body
```typescript
{
  email: string;      // Can be email OR username
  password: string;   // Minimum 6 characters
}
```

### Field Details
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | ✅ | Email format OR username | User's email address or username |
| `password` | string | ✅ | Min 6 characters | User's password |

### Response Expected
```typescript
{
  data: {
    token: string;           // JWT token for authentication
    user: {
      account_type: "freelancer" | "client";
      // ... other user details
    }
  }
}
```

---

## 2. MULTI-STEP REGISTRATION

### Endpoint
```
POST /api/auth/register
```

This is a comprehensive 5-step registration process with extensive data collection.

## 2.1 FREELANCER REGISTRATION

### Complete Request Body Structure
```typescript
{
  // Step 1: Basic Information
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  account_type: "freelancer";

  // Step 2: Professional Information
  profile_title: string;
  skills: string[];                    // Array of skill names
  experience_level: string;
  portfolio_links?: string;
  hourly_rate: number;

  // Step 3: Contact & Location
  phone_number: string;
  street_address: string;
  country: string;                     // ISO country code
  state: string;                       // ISO state code
  city: string;                        // City name
  zip_code: string;
  id_type: string;
  id_document: File;                   // File upload

  // Step 4: Work Preferences
  availability: string;
  hours_per_week: string;
  work_type: string;
  languages: string[];                 // Array of language names

  // Step 5: Final Review & Submit
  // (All above fields are reviewed and submitted)
}
```

### Field Details

#### Step 1: Basic Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | ✅ | Min 3 characters | Unique username |
| `first_name` | string | ✅ | Alphabets only | User's first name |
| `last_name` | string | ✅ | Alphabets only | User's last name |
| `email` | string | ✅ | Valid email format | User's email address |
| `password` | string | ✅ | Min 6 characters | User's password |
| `account_type` | string | ✅ | "freelancer" | Account type |

#### Step 2: Professional Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `profile_title` | string | ✅ | - | Professional title/headline |
| `skills` | string[] | ✅ | Min 1 skill | Array of technical skills |
| `experience_level` | string | ✅ | enum values | "entry", "intermediate", "expert", "master" |
| `portfolio_links` | string | ❌ | URL format | Portfolio website URL |
| `hourly_rate` | number | ✅ | Min 100, Max 10000 | Hourly rate in INR |

#### Step 3: Contact & Location
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phone_number` | string | ✅ | 10 digits | Contact phone number |
| `street_address` | string | ✅ | - | Street address |
| `country` | string | ✅ | ISO country code | Country selection |
| `state` | string | ✅ | ISO state code | State/Province selection |
| `city` | string | ✅ | - | City name |
| `zip_code` | string | ✅ | 6 digits | Postal/ZIP code |
| `id_type` | string | ✅ | enum values | "passport", "driving_license", "national_id" |
| `id_document` | File | ✅ | image/*, .pdf | ID document upload |

#### Step 4: Work Preferences
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `availability` | string | ✅ | enum values | "full_time", "part_time", "flexible", "on_demand" |
| `hours_per_week` | string | ✅ | enum values | "less_than_20", "20_30", "30_40", "more_than_40" |
| `work_type` | string | ✅ | enum values | "remote", "on_site", "hybrid" |
| `languages` | string[] | ✅ | Min 1 language | Array of known languages |
# Registration and Login API Specification

This document provides a comprehensive specification of all the fields and request bodies required for user registration and login functionality in the MMV Freelance Frontend application.

## Overview

The application supports two types of user accounts:
- **Freelancer** (also referred to as "candidate")
- **Client** (also referred to as "employer")

The application uses a **Multi-Step Registration Form** with 5 comprehensive steps for both account types.

## 1. LOGIN

### Endpoint
```
POST /users/loginf
```

### Request Body
```typescript
{
  email: string;      // Can be email OR username
  password: string;   // Minimum 6 characters
}
```

### Field Details
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | ✅ | Email format OR username | User's email address or username |
| `password` | string | ✅ | Min 6 characters | User's password |

### Response Expected
```typescript
{
  data: {
    token: string;           // JWT token for authentication
    user: {
      account_type: "freelancer" | "client";
      // ... other user details
    }
  }
}
```

---

## 2. MULTI-STEP REGISTRATION

### Endpoint
```
POST /api/auth/register
```

This is a comprehensive 5-step registration process with extensive data collection.

## 2.1 FREELANCER REGISTRATION

### Complete Request Body Structure
```typescript
{
  // Step 1: Basic Information
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  account_type: "freelancer";

  // Step 2: Professional Information
  profile_title: string;
  skills: string[];                    // Array of skill names
  experience_level: string;
  portfolio_links?: string;
  hourly_rate: number;

  // Step 3: Contact & Location
  phone_number: string;
  street_address: string;
  country: string;                     // ISO country code
  state: string;                       // ISO state code
  city: string;                        // City name
  zip_code: string;
  id_type: string;
  id_document: File;                   // File upload

  // Step 4: Work Preferences
  availability: string;
  hours_per_week: string;
  work_type: string;
  languages: string[];                 // Array of language names

  // Step 5: Final Review & Submit
  // (All above fields are reviewed and submitted)
}
```

### Field Details

#### Step 1: Basic Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | ✅ | Min 3 characters | Unique username |
| `first_name` | string | ✅ | Alphabets only | User's first name |
| `last_name` | string | ✅ | Alphabets only | User's last name |
| `email` | string | ✅ | Valid email format | User's email address |
| `password` | string | ✅ | Min 6 characters | User's password |
| `account_type` | string | ✅ | "freelancer" | Account type |

#### Step 2: Professional Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `profile_title` | string | ✅ | - | Professional title/headline |
| `skills` | string[] | ✅ | Min 1 skill | Array of technical skills |
| `experience_level` | string | ✅ | enum values | "entry", "intermediate", "expert", "master" |
| `portfolio_links` | string | ❌ | URL format | Portfolio website URL |
| `hourly_rate` | number | ✅ | Min 100, Max 10000 | Hourly rate in INR |

#### Step 3: Contact & Location
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phone_number` | string | ✅ | 10 digits | Contact phone number |
| `street_address` | string | ✅ | - | Street address |
| `country` | string | ✅ | ISO country code | Country selection |
| `state` | string | ✅ | ISO state code | State/Province selection |
| `city` | string | ✅ | - | City name |
| `zip_code` | string | ✅ | 6 digits | Postal/ZIP code |
| `id_type` | string | ✅ | enum values | "passport", "driving_license", "national_id" |
| `id_document` | File | ✅ | image/*, .pdf | ID document upload |

#### Step 4: Work Preferences
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `availability` | string | ✅ | enum values | "full_time", "part_time", "flexible", "on_demand" |
| `hours_per_week` | string | ✅ | enum values | "less_than_20", "20_30", "30_40", "more_than_40" |
| `work_type` | string | ✅ | enum values | "remote", "on_site", "hybrid" |
| `languages` | string[] | ✅ | Min 1 language | Array of known languages |

## 2.2 CLIENT REGISTRATION

### Complete Request Body Structure
```typescript
{
  // Step 1: Basic Information
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  account_type: "client";

  // Step 2: Company Information
  company_name: string;
  industry: string;
  website?: string;
  social_links?: string;
  company_size: string;
  required_services: string[];
  required_skills: string[];
  required_editor_proficiencies: string[];
  required_videographer_proficiencies: string[];
  budget_min: number;
  budget_max: number;

  // Step 3: Contact & Business Details
  phone_number: string;
  address: string;
  country: string;                     // ISO country code
  state: string;                       // ISO state code
  city: string;                        // City name
  pincode: string;
  business_documents?: File[];         // Optional file uploads
  tax_id?: string;

  // Step 4: Work Preferences
  work_arrangement: string;
  project_frequency: string;
  hiring_preferences: string;
  expected_start_date?: string;        // Date string
  project_duration?: string;

  // Step 5: Final Review & Submit
  // (All above fields are reviewed and submitted)
}
```

### Field Details

#### Step 1: Basic Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | ✅ | Min 3 characters | Unique username |
| `first_name` | string | ✅ | Alphabets only | User's first name |
| `last_name` | string | ✅ | Alphabets only | User's last name |
| `email` | string | ✅ | Valid email format | User's email address |
| `password` | string | ✅ | Min 6 characters | User's password |
| `account_type` | string | ✅ | "client" | Account type |

#### Step 2: Company Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `company_name` | string | ✅ | - | Company/Brand name |
| `industry` | string | ✅ | enum values | "film", "ad_agency", "events", "youtube", "corporate", "other" |
| `website` | string | ❌ | URL format | Company website |
| `social_links` | string | ❌ | - | Social media links |
| `company_size` | string | ✅ | enum values | "1-10", "11-50", "51-200", "200+" |
| `required_services` | string[] | ✅ | Min 1 service | Services needed from freelancers |
| `required_skills` | string[] | ✅ | Min 1 skill | Technical skills required |
| `required_editor_proficiencies` | string[] | ✅ | Min 1 proficiency | Video editing software proficiencies |
| `required_videographer_proficiencies` | string[] | ✅ | Min 1 proficiency | Videography equipment/techniques |
| `budget_min` | number | ✅ | Min 0 | Minimum project budget |
| `budget_max` | number | ✅ | > budget_min | Maximum project budget |

#### Step 3: Contact & Business Details
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phone_number` | string | ✅ | 10 digits | Contact phone number |
| `address` | string | ✅ | - | Complete business address |
| `country` | string | ✅ | ISO country code | Country selection |
| `state` | string | ✅ | ISO state code | State selection |
| `city` | string | ✅ | - | City name |
| `pincode` | string | ✅ | 5-6 digits | Postal/ZIP code |
| `business_documents` | File[] | ❌ | .pdf, .doc, .docx, image/* | Business registration documents |
| `tax_id` | string | ❌ | - | Tax ID or business number |

#### Step 4: Work Preferences
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `work_arrangement` | string | ✅ | enum values | "remote", "on_site", "hybrid" |
| `project_frequency` | string | ✅ | enum values | "one_time", "occasional", "ongoing" |
| `hiring_preferences` | string | ✅ | enum values | "individuals", "agencies", "both" |
| `expected_start_date` | string | ❌ | Date format | Expected project start date |
| `project_duration` | string | ❌ | enum values | "less_than_week", "1_2_weeks", "2_4_weeks", "1_3_months", "3_plus_months" |

---

## 3. IMPORTANT IMPLEMENTATION NOTES

### File Uploads
- **Freelancer ID Document**: Single file upload (required)
- **Client Business Documents**: Multiple file uploads (optional)
- Accepted formats: PDF, DOC, DOCX, Images
- Max file size: 5MB (mentioned in UI)

### Multi-Select Fields
Several fields accept arrays of strings:
- `skills` (freelancer)
- `languages` (freelancer)  
- `required_services` (client)
- `required_skills` (client)
- `required_editor_proficiencies` (client)
- `required_videographer_proficiencies` (client)

### Country/State/City Handling
- Uses `country-state-city` library
- Country: ISO country codes (e.g., "IN", "US")
- State: ISO state codes (e.g., "MH", "CA")
- City: City names (string)

### Password Requirements
- Minimum 6 characters
- At least 1 uppercase letter
- At least 1 number

### Phone Number Format
- Exactly 10 digits
- No country code prefix
- Numeric only

### Account Type Values
- Use `"freelancer"` (not "candidate")
- Use `"client"` (not "employer")

### Token Storage
- JWT token is stored in `localStorage` with key `"token"`
- Token contains `user_id` and `account_type` for user identification

### Redirection After Login
- Freelancers: `/dashboard/candidate-dashboard`
- Clients: `/dashboard/employ-dashboard`

---

## 4. BACKEND API REQUIREMENTS

### For Multi-Step Registration (`/api/auth/register`)
- Accept all fields mentioned in sections 2.1 and 2.2
- Handle file uploads for ID documents and business documents
- Support nested object structure or flatten as needed
- Validate all enum values against allowed options
- Store arrays as JSON or in separate tables as appropriate
- Return JWT token and user details on successful registration

### For Login (`/users/loginf`)
- Accept email OR username for authentication
- Return JWT token and user account type
- Handle password verification

### Common Requirements
- Validate email uniqueness
- Validate username uniqueness
- Implement proper error handling with descriptive messages
- Use appropriate HTTP status codes
- Sanitize and validate all input data

---

This specification should provide all the necessary information to implement the backend APIs that match the frontend registration and login functionality.
## 2.2 CLIENT REGISTRATION

### Complete Request Body Structure
```typescript
{
  // Step 1: Basic Information
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  account_type: "client";

  // Step 2: Company Information
  company_name: string;
  industry: string;
  website?: string;
  social_links?: string;
  company_size: string;
  required_services: string[];
  required_skills: string[];
  required_editor_proficiencies: string[];
  required_videographer_proficiencies: string[];
  budget_min: number;
  budget_max: number;

  // Step 3: Contact & Business Details
  phone_number: string;
  address: string;
  country: string;                     // ISO country code
  state: string;                       // ISO state code
  city: string;                        // City name
  pincode: string;
  business_documents?: File[];         // Optional file uploads
  tax_id?: string;

  // Step 4: Work Preferences
  work_arrangement: string;
  project_frequency: string;
  hiring_preferences: string;
  expected_start_date?: string;        // Date string
  project_duration?: string;

  // Step 5: Final Review & Submit
  // (All above fields are reviewed and submitted)
}
```

### Field Details

#### Step 1: Basic Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | ✅ | Min 3 characters | Unique username |
| `first_name` | string | ✅ | Alphabets only | User's first name |
| `last_name` | string | ✅ | Alphabets only | User's last name |
| `email` | string | ✅ | Valid email format | User's email address |
| `password` | string | ✅ | Min 6 characters | User's password |
| `account_type` | string | ✅ | "client" | Account type |

#### Step 2: Company Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `company_name` | string | ✅ | - | Company/Brand name |
| `industry` | string | ✅ | enum values | "film", "ad_agency", "events", "youtube", "corporate", "other" |
| `website` | string | ❌ | URL format | Company website |
| `social_links` | string | ❌ | - | Social media links |
| `company_size` | string | ✅ | enum values | "1-10", "11-50", "51-200", "200+" |
| `required_services` | string[] | ✅ | Min 1 service | Services needed from freelancers |
| `required_skills` | string[] | ✅ | Min 1 skill | Technical skills required |
| `required_editor_proficiencies` | string[] | ✅ | Min 1 proficiency | Video editing software proficiencies |
| `required_videographer_proficiencies` | string[] | ✅ | Min 1 proficiency | Videography equipment/techniques |
| `budget_min` | number | ✅ | Min 0 | Minimum project budget |
| `budget_max` | number | ✅ | > budget_min | Maximum project budget |

#### Step 3: Contact & Business Details
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phone_number` | string | ✅ | 10 digits | Contact phone number |
| `address` | string | ✅ | - | Complete business address |
| `country` | string | ✅ | ISO country code | Country selection |
| `state` | string | ✅ | ISO state code | State selection |
| `city` | string | ✅ | - | City name |
| `pincode` | string | ✅ | 5-6 digits | Postal/ZIP code |
| `business_documents` | File[] | ❌ | .pdf, .doc, .docx, image/* | Business registration documents |
| `tax_id` | string | ❌ | - | Tax ID or business number |

#### Step 4: Work Preferences
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `work_arrangement` | string | ✅ | enum values | "remote", "on_site", "hybrid" |
| `project_frequency` | string | ✅ | enum values | "one_time", "occasional", "ongoing" |
| `hiring_preferences` | string | ✅ | enum values | "individuals", "agencies", "both" |
| `expected_start_date` | string | ❌ | Date format | Expected project start date |
| `project_duration` | string | ❌ | enum values | "less_than_week", "1_2_weeks", "2_4_weeks", "1_3_months", "3_plus_months" |

---

## 3. IMPORTANT IMPLEMENTATION NOTES

### File Uploads
- **Freelancer ID Document**: Single file upload (required)
- **Client Business Documents**: Multiple file uploads (optional)
- Accepted formats: PDF, DOC, DOCX, Images
- Max file size: 5MB (mentioned in UI)

### Multi-Select Fields
Several fields accept arrays of strings:
- `skills` (freelancer)
- `languages` (freelancer)  
- `required_services` (client)
- `required_skills` (client)
- `required_editor_proficiencies` (client)
- `required_videographer_proficiencies` (client)

### Country/State/City Handling
- Uses `country-state-city` library
- Country: ISO country codes (e.g., "IN", "US")
- State: ISO state codes (e.g., "MH", "CA")
- City: City names (string)

### Password Requirements
- Minimum 6 characters
- At least 1 uppercase letter
- At least 1 number

### Phone Number Format
- Exactly 10 digits
- No country code prefix
- Numeric only

### Account Type Values
- Use `"freelancer"` (not "candidate")
- Use `"client"` (not "employer")

### Token Storage
- JWT token is stored in `localStorage` with key `"token"`
- Token contains `user_id` and `account_type` for user identification

### Redirection After Login
- Freelancers: `/dashboard/candidate-dashboard`
- Clients: `/dashboard/employ-dashboard`

---

## 4. BACKEND API REQUIREMENTS

### For Multi-Step Registration (`/api/auth/register`)
- Accept all fields mentioned in sections 2.1 and 2.2
- Handle file uploads for ID documents and business documents
- Support nested object structure or flatten as needed
- Validate all enum values against allowed options
- Store arrays as JSON or in separate tables as appropriate
- Return JWT token and user details on successful registration

### For Login (`/users/loginf`)
- Accept email OR username for authentication
- Return JWT token and user account type
- Handle password verification

### Common Requirements
- Validate email uniqueness
- Validate username uniqueness
- Implement proper error handling with descriptive messages
- Use appropriate HTTP status codes
- Sanitize and validate all input data

---

This specification should provide all the necessary information to implement the backend APIs that match the frontend registration and login functionality.

The application supports two types of user accounts:
- **Freelancer** (also referred to as "candidate")
- **Client** (also referred to as "employer")

The application uses a **Multi-Step Registration Form** with 5 comprehensive steps for both account types.

## 1. LOGIN

### Endpoint
```
POST /users/loginf
```

### Request Body
```typescript
{
  email: string;      // Can be email OR username
  password: string;   // Minimum 6 characters
}
```

### Field Details
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | ✅ | Email format OR username | User's email address or username |
| `password` | string | ✅ | Min 6 characters | User's password |

### Response Expected
```typescript
{
  data: {
    token: string;           // JWT token for authentication
    user: {
      account_type: "freelancer" | "client";
      // ... other user details
    }
  }
}
```

---

## 2. MULTI-STEP REGISTRATION

### Endpoint
```
POST /api/auth/register
```

This is a comprehensive 5-step registration process with extensive data collection.

## 2.1 FREELANCER REGISTRATION

### Complete Request Body Structure
```typescript
{
  // Step 1: Basic Information
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  account_type: "freelancer";

  // Step 2: Professional Information
  profile_title: string;
  skills: string[];                    // Array of skill names
  experience_level: string;
  portfolio_links?: string;
  hourly_rate: number;

  // Step 3: Contact & Location
  phone_number: string;
  street_address: string;
  country: string;                     // ISO country code
  state: string;                       // ISO state code
  city: string;                        // City name
  zip_code: string;
  id_type: string;
  id_document: File;                   // File upload

  // Step 4: Work Preferences
  availability: string;
  hours_per_week: string;
  work_type: string;
  languages: string[];                 // Array of language names

  // Step 5: Final Review & Submit
  // (All above fields are reviewed and submitted)
}
```

### Field Details

#### Step 1: Basic Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | ✅ | Min 3 characters | Unique username |
| `first_name` | string | ✅ | Alphabets only | User's first name |
| `last_name` | string | ✅ | Alphabets only | User's last name |
| `email` | string | ✅ | Valid email format | User's email address |
| `password` | string | ✅ | Min 6 characters | User's password |
| `account_type` | string | ✅ | "freelancer" | Account type |

#### Step 2: Professional Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `profile_title` | string | ✅ | - | Professional title/headline |
| `skills` | string[] | ✅ | Min 1 skill | Array of technical skills |
| `experience_level` | string | ✅ | enum values | "entry", "intermediate", "expert", "master" |
| `portfolio_links` | string | ❌ | URL format | Portfolio website URL |
| `hourly_rate` | number | ✅ | Min 100, Max 10000 | Hourly rate in INR |

#### Step 3: Contact & Location
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phone_number` | string | ✅ | 10 digits | Contact phone number |
| `street_address` | string | ✅ | - | Street address |
| `country` | string | ✅ | ISO country code | Country selection |
| `state` | string | ✅ | ISO state code | State/Province selection |
| `city` | string | ✅ | - | City name |
| `zip_code` | string | ✅ | 6 digits | Postal/ZIP code |
| `id_type` | string | ✅ | enum values | "passport", "driving_license", "national_id" |
| `id_document` | File | ✅ | image/*, .pdf | ID document upload |

#### Step 4: Work Preferences
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `availability` | string | ✅ | enum values | "full_time", "part_time", "flexible", "on_demand" |
| `hours_per_week` | string | ✅ | enum values | "less_than_20", "20_30", "30_40", "more_than_40" |
| `work_type` | string | ✅ | enum values | "remote", "on_site", "hybrid" |
| `languages` | string[] | ✅ | Min 1 language | Array of known languages |

## 2.2 CLIENT REGISTRATION

### Complete Request Body Structure
```typescript
{
  // Step 1: Basic Information
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  account_type: "client";

  // Step 2: Company Information
  company_name: string;
  industry: string;
  website?: string;
  social_links?: string;
  company_size: string;
  required_services: string[];
  required_skills: string[];
  required_editor_proficiencies: string[];
  required_videographer_proficiencies: string[];
  budget_min: number;
  budget_max: number;

  // Step 3: Contact & Business Details
  phone_number: string;
  address: string;
  country: string;                     // ISO country code
  state: string;                       // ISO state code
  city: string;                        // City name
  pincode: string;
  business_documents?: File[];         // Optional file uploads
  tax_id?: string;

  // Step 4: Work Preferences
  work_arrangement: string;
  project_frequency: string;
  hiring_preferences: string;
  expected_start_date?: string;        // Date string
  project_duration?: string;

  // Step 5: Final Review & Submit
  // (All above fields are reviewed and submitted)
}
```

### Field Details

#### Step 1: Basic Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | string | ✅ | Min 3 characters | Unique username |
| `first_name` | string | ✅ | Alphabets only | User's first name |
| `last_name` | string | ✅ | Alphabets only | User's last name |
| `email` | string | ✅ | Valid email format | User's email address |
| `password` | string | ✅ | Min 6 characters | User's password |
| `account_type` | string | ✅ | "client" | Account type |

#### Step 2: Company Information
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `company_name` | string | ✅ | - | Company/Brand name |
| `industry` | string | ✅ | enum values | "film", "ad_agency", "events", "youtube", "corporate", "other" |
| `website` | string | ❌ | URL format | Company website |
| `social_links` | string | ❌ | - | Social media links |
| `company_size` | string | ✅ | enum values | "1-10", "11-50", "51-200", "200+" |
| `required_services` | string[] | ✅ | Min 1 service | Services needed from freelancers |
| `required_skills` | string[] | ✅ | Min 1 skill | Technical skills required |
| `required_editor_proficiencies` | string[] | ✅ | Min 1 proficiency | Video editing software proficiencies |
| `required_videographer_proficiencies` | string[] | ✅ | Min 1 proficiency | Videography equipment/techniques |
| `budget_min` | number | ✅ | Min 0 | Minimum project budget |
| `budget_max` | number | ✅ | > budget_min | Maximum project budget |

#### Step 3: Contact & Business Details
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phone_number` | string | ✅ | 10 digits | Contact phone number |
| `address` | string | ✅ | - | Complete business address |
| `country` | string | ✅ | ISO country code | Country selection |
| `state` | string | ✅ | ISO state code | State selection |
| `city` | string | ✅ | - | City name |
| `pincode` | string | ✅ | 5-6 digits | Postal/ZIP code |
| `business_documents` | File[] | ❌ | .pdf, .doc, .docx, image/* | Business registration documents |
| `tax_id` | string | ❌ | - | Tax ID or business number |

#### Step 4: Work Preferences
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `work_arrangement` | string | ✅ | enum values | "remote", "on_site", "hybrid" |
| `project_frequency` | string | ✅ | enum values | "one_time", "occasional", "ongoing" |
| `hiring_preferences` | string | ✅ | enum values | "individuals", "agencies", "both" |
| `expected_start_date` | string | ❌ | Date format | Expected project start date |
| `project_duration` | string | ❌ | enum values | "less_than_week", "1_2_weeks", "2_4_weeks", "1_3_months", "3_plus_months" |

---

## 3. IMPORTANT IMPLEMENTATION NOTES

### File Uploads
- **Freelancer ID Document**: Single file upload (required)
- **Client Business Documents**: Multiple file uploads (optional)
- Accepted formats: PDF, DOC, DOCX, Images
- Max file size: 5MB (mentioned in UI)

### Multi-Select Fields
Several fields accept arrays of strings:
- `skills` (freelancer)
- `languages` (freelancer)  
- `required_services` (client)
- `required_skills` (client)
- `required_editor_proficiencies` (client)
- `required_videographer_proficiencies` (client)

### Country/State/City Handling
- Uses `country-state-city` library
- Country: ISO country codes (e.g., "IN", "US")
- State: ISO state codes (e.g., "MH", "CA")
- City: City names (string)

### Password Requirements
- Minimum 6 characters
- At least 1 uppercase letter
- At least 1 number

### Phone Number Format
- Exactly 10 digits
- No country code prefix
- Numeric only

### Account Type Values
- Use `"freelancer"` (not "candidate")
- Use `"client"` (not "employer")

### Token Storage
- JWT token is stored in `localStorage` with key `"token"`
- Token contains `user_id` and `account_type` for user identification

### Redirection After Login
- Freelancers: `/dashboard/candidate-dashboard`
- Clients: `/dashboard/employ-dashboard`

---

## 4. BACKEND API REQUIREMENTS

### For Multi-Step Registration (`/api/auth/register`)
- Accept all fields mentioned in sections 2.1 and 2.2
- Handle file uploads for ID documents and business documents
- Support nested object structure or flatten as needed
- Validate all enum values against allowed options
- Store arrays as JSON or in separate tables as appropriate
- Return JWT token and user details on successful registration

### For Login (`/users/loginf`)
- Accept email OR username for authentication
- Return JWT token and user account type
- Handle password verification

### Common Requirements
- Validate email uniqueness
- Validate username uniqueness
- Implement proper error handling with descriptive messages
- Use appropriate HTTP status codes
- Sanitize and validate all input data

---

This specification should provide all the necessary information to implement the backend APIs that match the frontend registration and login functionality.