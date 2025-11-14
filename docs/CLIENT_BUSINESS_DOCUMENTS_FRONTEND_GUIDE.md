# Client Business Documents Update - Frontend Guide

## Overview
The client profiles schema has been updated to support **multiple business documents** instead of a single document URL. This change enhances flexibility for clients who need to upload multiple business-related documents.

## ✅ Backend Implementation Status

### Verified Components
- ✅ **Database Schema**: `business_document_urls` JSONB field properly configured
- ✅ **Upload Middleware**: Supports up to 5 business documents via `business_document` field
- ✅ **Registration Flow**: Auth service handles multiple document uploads and stores as array
- ✅ **Profile Updates**: Client service properly serializes/deserializes JSONB arrays
- ✅ **API Responses**: Returns `business_document_urls` as proper arrays
- ✅ **DTOs**: Validation supports array transformation and storage

## What Changed

### Database Schema
- **Removed**: `id_document_url` field (no longer needed)
- **Changed**: `business_document_url` → `business_document_urls` (now an array of strings)
- **Migration**: Existing single document URLs are automatically converted to arrays

### API Impact

#### Affected Endpoints
- `POST /api/v1/auth/register` (client registration)
- `PATCH /api/v1/clients/profile` (client profile update)
- `GET /api/v1/clients/profile` (get client profile)
- `GET /api/v1/users/:id/profile` (admin get user profile)

#### Request Body Changes

**Before:**
```json
{
  "business_document_url": "https://example.com/business-doc.pdf"
}
```

**After:**
```json
{
  "business_document_urls": [
    "https://example.com/business-doc1.pdf",
    "https://example.com/business-doc2.pdf",
    "https://example.com/tax-certificate.pdf"
  ]
}
```

#### Response Body Changes

**Before:**
```json
{
  "profile": {
    "business_document_url": "https://example.com/business-doc.pdf"
  }
}
```

**After:**
```json
{
  "profile": {
    "business_document_urls": [
      "https://example.com/business-doc1.pdf",
      "https://example.com/business-doc2.pdf"
    ]
  }
}
```

## Frontend Implementation Notes

### 1. Registration Form (File Upload)

**Endpoint:** `POST /api/v1/auth/register/client`

**Content-Type:** `multipart/form-data`

**Field Name:** `business_document` (accepts multiple files)

```javascript
// React/JavaScript Example
const formData = new FormData();

// Basic fields
formData.append('first_name', 'John');
formData.append('last_name', 'Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'SecurePass123!');
formData.append('company_name', 'ABC Productions');
formData.append('industry', 'film');
formData.append('company_size', '11-50');
formData.append('country', 'USA');
formData.append('phone_number', '+1234567890');
formData.append('terms_accepted', 'true');
formData.append('privacy_policy_accepted', 'true');

// Profile picture (single file)
if (profilePicture) {
  formData.append('profile_picture', profilePicture);
}

// Business documents (multiple files - IMPORTANT!)
businessDocuments.forEach((file) => {
  formData.append('business_document', file); // Same field name for all
});

// Send request
const response = await fetch('/api/v1/auth/register/client', {
  method: 'POST',
  body: formData
  // Don't set Content-Type header - browser sets it with boundary
});
```

### 2. Profile Update Form (URL Array)

**Endpoint:** `PATCH /api/v1/clients/profile`

**Content-Type:** `application/json`

**Field Name:** `business_document_urls` (array of strings)

```javascript
// React/JavaScript Example - Update with URLs
const updatePayload = {
  company_name: 'Updated Company Name',
  business_document_urls: [
    'https://s3.amazonaws.com/bucket/doc1.pdf',
    'https://s3.amazonaws.com/bucket/doc2.pdf',
    'https://s3.amazonaws.com/bucket/tax-cert.pdf'
  ]
};

const response = await fetch('/api/v1/clients/profile', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updatePayload)
});
```

### 3. Display Business Documents

```javascript
// React Component Example
const ClientDocuments = ({ profile }) => {
  const documents = profile.business_document_urls || [];
  
  if (!documents.length) {
    return <p>No business documents uploaded</p>;
  }
  
  return (
    <div className="documents-list">
      <h3>Business Documents ({documents.length})</h3>
      {documents.map((url, index) => (
        <div key={index} className="document-item">
          <span>Document {index + 1}</span>
          <a href={url} target="_blank" rel="noopener noreferrer">
            View
          </a>
          <a href={url} download>Download</a>
        </div>
      ))}
    </div>
  );
};
```

### 4. Validation Rules

**Registration Upload:**
- **Field name**: `business_document` (same name for multiple files)
- **File types**: Images (image/*), PDF, DOC, DOCX, XLS, XLSX, TXT
- **Max files**: 5 documents
- **Max size per file**: 10MB
- **Total upload limit**: 10 files across all fields (profile + business docs)

**Update API:**
- **Field name**: `business_document_urls`
- **Type**: Array of strings (URLs)
- **Validation**: Each element must be a valid URL string

```javascript
// Frontend validation example
const validateBusinessDocuments = (files) => {
  const MAX_FILES = 5;
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'image/gif',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain' // .txt
  ];
  
  if (files.length > MAX_FILES) {
    throw new Error(`Maximum ${MAX_FILES} business documents allowed`);
  }
  
  files.forEach(file => {
    if (file.size > MAX_SIZE) {
      throw new Error(`File ${file.name} exceeds 10MB limit`);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File ${file.name} has invalid type. Only images, PDF, DOC, DOCX, XLS, XLSX, and TXT allowed`);
    }
  });
  
  return true;
};
```

## Migration Notes

### Existing Data
- Single document URLs are automatically converted to arrays
- No data loss - existing documents remain accessible
- Frontend should handle both single URL and array formats during transition

### Backward Compatibility
- API accepts both old and new formats temporarily
- Frontend should migrate to array format immediately

## Complete React Implementation Example

```jsx
import React, { useState } from 'react';

const ClientRegistrationForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    company_name: '',
    industry: 'film',
    company_size: '1-10',
    country: '',
    phone_number: '',
    terms_accepted: false,
    privacy_policy_accepted: false
  });
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [businessDocuments, setBusinessDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'profile_picture') {
      setProfilePicture(files[0]);
    } else if (name === 'business_document') {
      // Validate
      if (files.length > 5) {
        setError('Maximum 5 business documents allowed');
        return;
      }
      
      const filesArray = Array.from(files);
      const invalidFile = filesArray.find(f => f.size > 10 * 1024 * 1024);
      if (invalidFile) {
        setError(`File ${invalidFile.name} exceeds 10MB limit`);
        return;
      }
      
      setBusinessDocuments(filesArray);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // Append profile picture
    if (profilePicture) {
      data.append('profile_picture', profilePicture);
    }

    // Append business documents (SAME FIELD NAME for all)
    businessDocuments.forEach(file => {
      data.append('business_document', file);
    });

    try {
      const response = await fetch('/api/v1/auth/register/client', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (result.success) {
        // Store token and redirect
        localStorage.setItem('token', result.data.token);
        window.location.href = '/dashboard';
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic fields */}
      <input
        type="text"
        name="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
        required
      />
      
      {/* ... other fields ... */}

      {/* Profile Picture */}
      <div>
        <label>Profile Picture</label>
        <input
          type="file"
          name="profile_picture"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Business Documents (Multiple) */}
      <div>
        <label>Business Documents (Max 5)</label>
        <input
          type="file"
          name="business_document"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          multiple
          onChange={handleFileChange}
        />
        {businessDocuments.length > 0 && (
          <p>{businessDocuments.length} file(s) selected</p>
        )}
      </div>

      {/* Terms */}
      <label>
        <input
          type="checkbox"
          checked={formData.terms_accepted}
          onChange={(e) => setFormData({...formData, terms_accepted: e.target.checked})}
          required
        />
        I accept the terms and conditions
      </label>

      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default ClientRegistrationForm;
```

## Testing Checklist

### Registration Testing
- [ ] Upload 0 business documents (should work - field is optional)
- [ ] Upload 1 business document
- [ ] Upload 5 business documents (max allowed)
- [ ] Try uploading 6 documents (should fail validation)
- [ ] Upload file > 10MB (should fail)
- [ ] Upload non-PDF/image file (should fail)
- [ ] Verify documents appear in profile after registration

### Profile Update Testing  
- [ ] Update profile with new `business_document_urls` array
- [ ] Add documents to existing array
- [ ] Remove documents from array
- [ ] Empty array (should work)
- [ ] Verify changes persist after refresh

### Display Testing
- [ ] Profile with 0 documents displays correctly
- [ ] Profile with multiple documents shows all URLs
- [ ] Document links are clickable and downloadable
- [ ] Document count displays correctly

## Common Issues & Solutions

### Issue 1: Files not uploading
**Solution:** Ensure field name is `business_document` (singular) not `business_documents`

### Issue 2: Only one file uploads
**Solution:** Use same field name for all files: `formData.append('business_document', file)` in a loop

### Issue 3: Backend returns empty array
**Solution:** Check that files have content (size > 0) before upload

### Issue 4: File type rejected (DOC/DOCX/XLS)
**Solution:** Accepted types are: images, PDF, DOC, DOCX, XLS, XLSX, TXT

### Issue 5: CORS errors during upload
**Solution:** Don't set Content-Type header for FormData - let browser handle it

### Issue 6: Update API doesn't save documents
**Solution:** Use `business_document_urls` (plural) as field name in update API

## Key Differences: Registration vs Update

| Aspect | Registration | Profile Update |
|--------|-------------|----------------|
| **Endpoint** | `POST /auth/register/client` | `PATCH /clients/profile` |
| **Content-Type** | `multipart/form-data` | `application/json` |
| **Field Name** | `business_document` | `business_document_urls` |
| **Data Type** | Files (Buffer) | URLs (Array of strings) |
| **Multiple Files** | Same field name repeated | Array in JSON |

## Support
Contact backend team if you encounter issues with the new document handling system.

---

## Backend Implementation Details (For Reference)

### Upload Flow
1. Multer middleware accepts `business_document` field (max 5 files)
2. Auth service processes each file
3. Files uploaded to S3/storage
4. URLs collected in array
5. Array stored as JSONB in database

### Storage Format
```sql
-- Database column type
business_document_urls JSONB DEFAULT '[]'

-- Example stored value
["https://s3.../doc1.pdf", "https://s3.../doc2.pdf"]
```

### API Response Format
```json
{
  "success": true,
  "data": {
    "profile": {
      "business_document_urls": [
        "https://example.com/doc1.pdf",
        "https://example.com/doc2.pdf"
      ]
    }
  }
}
```