# Profile Picture Upload and Update API

This document provides comprehensive information about uploading and updating profile pictures for all user types in the MMV Freelance platform.

## Overview

The profile picture update process involves two main steps:
1. **Upload Image to S3**: Upload the image file to cloud storage
2. **Update Profile**: Save the image URL to the user's profile

## API Endpoints

### 1. Upload Image to S3

**Endpoint:** `POST /api/v1/files/uploadtoaws`

**Purpose:** Upload an image file to AWS S3/Supabase storage and get a public URL

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "filename": "string (required)",
  "base64String": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "message": "File uploaded successfully",
  "fileUrl": "https://supabase-endpoint/object/public/bucket/filename.jpg"
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "success": false,
  "message": "Filename and base64 string are required"
}

// 401 Unauthorized
{
  "success": false,
  "message": "Authentication token missing"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Failed to upload file"
}
```

### 2. Update Profile Picture

**Endpoint:** `PATCH /api/v1/users/me`

**Purpose:** Update the user's profile picture URL in the database

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "profile_picture": "https://supabase-endpoint/object/public/bucket/filename.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User info updated successfully",
  "data": {
    "user_id": 123,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "profile_picture": "https://supabase-endpoint/object/public/bucket/filename.jpg",
    "bio": "Professional videographer",
    "timezone": "America/New_York",
    "is_active": true,
    "is_banned": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "profile_picture",
      "message": "profile_picture must be a valid URL"
    }
  ]
}

// 401 Unauthorized
{
  "success": false,
  "message": "Authentication token missing"
}

// 404 Not Found
{
  "success": false,
  "message": "User not found"
}
```

## Frontend Implementation

### Complete Implementation Example

```javascript
// Profile Picture Update Component
class ProfilePictureUpdater {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.fileInput = document.getElementById('profile-picture-input');
    this.preview = document.getElementById('profile-picture-preview');
    this.uploadButton = document.getElementById('upload-button');

    this.init();
  }

  init() {
    this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    this.uploadButton.addEventListener('click', this.handleUpload.bind(this));
  }

  // Step 1: Handle file selection and show preview
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        alert('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Show preview
      this.showImagePreview(file);
      this.uploadButton.disabled = false;
    }
  }

  // Step 2: Upload image to S3 and update profile
  async handleUpload() {
    const file = this.fileInput.files[0];
    if (!file) return;

    try {
      this.uploadButton.disabled = true;
      this.uploadButton.textContent = 'Uploading...';

      // Step 2a: Upload to S3
      const imageUrl = await this.uploadImageToS3(file);

      // Step 2b: Update profile picture
      await this.updateProfilePicture(imageUrl);

      // Success
      alert('Profile picture updated successfully!');
      this.uploadButton.textContent = 'Upload';
      this.uploadButton.disabled = true;

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to update profile picture: ' + error.message);
      this.uploadButton.textContent = 'Upload';
      this.uploadButton.disabled = false;
    }
  }

  // Upload image to S3
  async uploadImageToS3(file) {
    // Convert file to base64
    const base64String = await this.fileToBase64(file);
    const filename = `profile_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    const response = await fetch('/api/v1/files/uploadtoaws', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: filename,
        base64String: base64String
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    return result.fileUrl;
  }

  // Update profile picture URL
  async updateProfilePicture(imageUrl) {
    const response = await fetch('/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_picture: imageUrl
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Profile update failed');
    }

    return result;
  }

  // Helper: Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Helper: Show image preview
  showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.preview.src = e.target.result;
      this.preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  // Helper: Validate image file
  isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProfilePictureUpdater();
});
```

### React Hook Implementation

```javascript
import React, { useState, useRef } from 'react';

const useProfilePictureUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const uploadImage = async (file) => {
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      // Convert file to base64
      const base64String = await fileToBase64(file);
      const filename = `profile_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      // Upload to S3
      const uploadResponse = await fetch('/api/v1/files/uploadtoaws', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: filename,
          base64String: base64String
        })
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message || 'Upload failed');
      }

      // Update profile picture
      const updateResponse = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile_picture: uploadResult.fileUrl
        })
      });

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateResult.message || 'Profile update failed');
      }

      setSuccess(true);
      return uploadResult.fileUrl;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error, success };
};

// Helper function
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export default useProfilePictureUpload;
```

### React Component Example

```jsx
import React, { useState, useRef } from 'react';
import useProfilePictureUpload from './useProfilePictureUpload';

const ProfilePictureUpload = ({ currentPicture, onPictureUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentPicture);
  const fileInputRef = useRef(null);

  const { uploadImage, uploading, error, success } = useProfilePictureUpload();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const imageUrl = await uploadImage(selectedFile);
      setPreview(imageUrl);
      onPictureUpdate(imageUrl);
      setSelectedFile(null);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="profile-picture-upload">
      <div className="picture-preview">
        <img
          src={preview || '/default-avatar.png'}
          alt="Profile"
          className="profile-image"
        />
      </div>

      <div className="upload-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          Choose Image
        </button>

        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Profile picture updated!</div>}
    </div>
  );
};

export default ProfilePictureUpload;
```

### Vue.js Implementation

```javascript
<template>
  <div class="profile-picture-upload">
    <div class="picture-preview">
      <img :src="preview || defaultAvatar" alt="Profile" class="profile-image" />
    </div>

    <div class="upload-controls">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        style="display: none"
      />

      <button @click="chooseFile" :disabled="uploading">
        Choose Image
      </button>

      <button
        v-if="selectedFile"
        @click="uploadImage"
        :disabled="uploading"
      >
        {{ uploading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">Profile picture updated!</div>
  </div>
</template>

<script>
export default {
  name: 'ProfilePictureUpload',
  props: {
    currentPicture: String
  },
  emits: ['picture-updated'],
  data() {
    return {
      selectedFile: null,
      preview: this.currentPicture,
      uploading: false,
      error: '',
      success: false,
      defaultAvatar: '/default-avatar.png'
    };
  },
  methods: {
    chooseFile() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.error = 'Please select an image file';
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          this.error = 'File size must be less than 5MB';
          return;
        }

        this.selectedFile = file;
        this.error = '';

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.preview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    async uploadImage() {
      if (!this.selectedFile) return;

      this.uploading = true;
      this.error = '';
      this.success = false;

      try {
        // Convert to base64
        const base64String = await this.fileToBase64(this.selectedFile);
        const filename = `profile_${Date.now()}_${this.selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

        // Upload to S3
        const uploadResponse = await fetch('/api/v1/files/uploadtoaws', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename: filename,
            base64String: base64String
          })
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.message || 'Upload failed');
        }

        // Update profile
        const updateResponse = await fetch('/api/v1/users/me', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            profile_picture: uploadResult.fileUrl
          })
        });

        const updateResult = await updateResponse.json();

        if (!updateResponse.ok) {
          throw new Error(updateResult.message || 'Profile update failed');
        }

        this.success = true;
        this.preview = uploadResult.fileUrl;
        this.selectedFile = null;
        this.$emit('picture-updated', uploadResult.fileUrl);

      } catch (err) {
        this.error = err.message;
      } finally {
        this.uploading = true;
      }
    },

    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = error => reject(error);
      });
    }
  }
};
</script>
```

## File Requirements

### Supported Formats
- JPEG/JPG
- PNG
- GIF
- WebP

### Size Limits
- Maximum file size: 5MB
- Recommended dimensions: 400x400px or larger (square aspect ratio preferred)

### Naming Convention
- Files are automatically renamed to: `profile_{timestamp}_{original_filename}`
- Special characters in filenames are replaced with underscores

## Security Considerations

1. **Authentication Required**: Both endpoints require valid JWT tokens
2. **File Validation**: Server validates file type and size
3. **Base64 Encoding**: Files are transmitted as base64 strings
4. **Public URLs**: Uploaded images are publicly accessible via S3

## Error Handling

### Common Error Scenarios

1. **Invalid File Type**
   ```
   Error: Please select a valid image file (JPG, PNG, GIF)
   ```

2. **File Too Large**
   ```
   Error: File size must be less than 5MB
   ```

3. **Upload Failed**
   ```
   Error: Failed to upload file
   ```

4. **Authentication Error**
   ```
   Error: Authentication token missing
   ```

5. **Invalid URL**
   ```
   Error: profile_picture must be a valid URL
   ```

## Testing

### Test Cases
1. ✅ Upload valid image file
2. ✅ Upload file exceeding size limit
3. ✅ Upload non-image file
4. ✅ Upload without authentication
5. ✅ Update profile with invalid URL
6. ✅ Update profile without authentication

### Sample Test Data
```javascript
// Valid test file (small PNG)
const testFile = new File(['test image data'], 'test.png', { type: 'image/png' });

// Invalid test file (too large)
const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
```

## Related Documentation

- [User Profile Update APIs](./USER_PROFILE_UPDATE_APIS.md)
- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [File Upload API](./FILE_UPLOAD_API.md)

## Support

For issues with profile picture uploads, check:
1. Network connectivity
2. Authentication token validity
3. File format and size compliance
4. S3 bucket permissions
5. CORS configuration</content>
<parameter name="filePath">/Users/harshalpatil/Documents/Projects/mmv_freelance_api/docs/PROFILE_PICTURE_UPLOAD_API.md