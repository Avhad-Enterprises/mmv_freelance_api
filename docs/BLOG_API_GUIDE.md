# Blog API Guide

## Overview
The Blog API provides CRUD operations for managing blog posts in the MMV Freelance platform. This API has been refactored to follow RESTful conventions and includes proper authentication, validation, and comprehensive testing.

## API Endpoints

### 1. Get All Blogs
**Endpoint:** `GET /api/v1/blog`  
**Authentication:** None (Public)  
**Description:** Retrieves all active and non-deleted blogs, ordered by creation date (newest first)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "blog_id": 1,
      "author_id": null,
      "author_name": "John Doe",
      "title": "Blog Title",
      "slug": "blog-title",
      "featured_image": "https://example.com/image.jpg",
      "content": "<p>Blog content...</p>",
      "short_description": "Short description",
      "category": "Technology",
      "status": "published",
      "format": null,
      "is_featured": false,
      "views": 100,
      "seo_title": "SEO Title",
      "seo_description": "SEO Description",
      "reading_time": 5,
      "comment_count": 10,
      "scheduled_at": null,
      "sub_section": {},
      "tags": ["tech", "ai"],
      "notes": {},
      "is_active": true,
      "created_by": 84,
      "created_at": "2025-10-28T10:00:00.000Z",
      "updated_at": "2025-10-28T10:00:00.000Z",
      "updated_by": null,
      "is_deleted": false,
      "deleted_by": null,
      "deleted_at": null
    }
  ],
  "message": "Blogs retrieved successfully"
}
```

### 2. Get Blog by ID
**Endpoint:** `GET /api/v1/blog/:id`  
**Authentication:** None (Public)  
**Description:** Retrieves a specific blog post by its ID

**Parameters:**
- `id` (number, required) - Blog ID

**Response:**
```json
{
  "success": true,
  "data": {
    "blog_id": 1,
    "author_id": null,
    "author_name": "John Doe",
    "title": "Blog Title",
    "slug": "blog-title",
    // ... (same fields as above)
  },
  "message": "Blog retrieved successfully"
}
```

**Error Responses:**
- `400` - Invalid blog ID format
- `404` - Blog not found

### 3. Create Blog
**Endpoint:** `POST /api/v1/blog`  
**Authentication:** Required (Admin/Super Admin only)  
**Description:** Creates a new blog post

**Request Body:**
```json
{
  "title": "Blog Title",
  "slug": "unique-blog-slug",
  "author_name": "Author Name",
  "content": "<p>Blog content...</p>",
  "short_description": "Short description",
  "category": "Technology",
  "status": "draft",
  "featured_image": "https://example.com/image.jpg",
  "is_featured": false,
  "seo_title": "SEO Title",
  "seo_description": "SEO Description",
  "reading_time": 5,
  "tags": ["tech", "ai"],
  "created_by": 84
}
```

**Required Fields:**
- `title` - Blog title
- `slug` - URL-friendly unique identifier
- `author_name` - Author's name

**Response:**
```json
{
  "success": true,
  "data": {
    "blog_id": 1,
    // ... (all blog fields)
  },
  "message": "Blog created successfully"
}
```

**Error Responses:**
- `400` - Validation error (missing required fields)
- `401` - Unauthorized (missing or invalid token)
- `500` - Server error (e.g., duplicate slug)

### 4. Update Blog
**Endpoint:** `PUT /api/v1/blog`  
**Authentication:** Required (Admin/Super Admin only)  
**Description:** Updates an existing blog post

**Request Body:**
```json
{
  "blog_id": 1,
  "title": "Updated Title",
  "content": "Updated content",
  "status": "published"
  // ... (any other fields to update)
}
```

**Required Fields:**
- `blog_id` - ID of the blog to update

**Response:**
```json
{
  "success": true,
  "data": {
    "blog_id": 1,
    // ... (updated blog fields)
  },
  "message": "Blog updated successfully"
}
```

**Error Responses:**
- `400` - Validation error (missing blog_id)
- `401` - Unauthorized
- `404` - Blog not found

### 5. Delete Blog
**Endpoint:** `DELETE /api/v1/blog`  
**Authentication:** Required (Admin/Super Admin only)  
**Description:** Soft deletes a blog post (marks as deleted without removing from database)

**Request Body:**
```json
{
  "blog_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "blog_id": 1,
    "is_deleted": true,
    "deleted_by": 84,
    "deleted_at": "2025-10-28T10:00:00.000Z"
    // ... (other blog fields)
  },
  "message": "Blog deleted successfully"
}
```

**Error Responses:**
- `400` - Validation error (missing blog_id)
- `401` - Unauthorized
- `404` - Blog not found

## Database Schema

The blog posts are stored in the `blogs` table with the following structure:

```sql
CREATE TABLE blogs (
  blog_id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  author_name VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  featured_image TEXT,
  content TEXT,
  short_description TEXT,
  category VARCHAR,
  status ENUM('draft', 'published') DEFAULT 'draft',
  format VARCHAR,
  is_featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  seo_title VARCHAR,
  seo_description TEXT,
  reading_time INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP,
  sub_section JSONB,
  tags JSONB,
  notes JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by INTEGER,
  deleted_at TIMESTAMP
);
```

## Testing

Comprehensive tests have been created for all blog operations:

### Running Tests

```bash
# Run all blog tests
node tests/blog/run-blog-tests.js

# Run individual tests
node tests/blog/test-get-all-blogs.js
node tests/blog/test-get-blog-by-id.js
node tests/blog/test-create-blog.js
node tests/blog/test-update-blog.js
node tests/blog/test-delete-blog.js
```

### Test Coverage

✅ **Get All Blogs**
- Retrieve blogs without authentication
- Verify response structure
- Ensure only active blogs are returned
- Verify correct ordering (newest first)

✅ **Get Blog by ID**
- Retrieve blog by valid ID
- Handle invalid ID (404)
- Handle non-numeric ID (400)
- Verify response structure

✅ **Create Blog**
- Reject creation without authentication (401)
- Create blog with valid admin credentials
- Reject creation with missing required fields (400)

✅ **Update Blog**
- Reject update without authentication (401)
- Update blog with valid admin credentials
- Handle invalid blog ID (404)
- Reject update without blog_id (400)

✅ **Delete Blog**
- Reject deletion without authentication (401)
- Soft delete blog with valid admin credentials
- Verify deleted blog not returned in get all
- Handle invalid blog ID (404)

## Code Structure

### Files
- **Routes:** `src/features/blog/blog.routes.ts` - API endpoint definitions
- **Controller:** `src/features/blog/blog.controller.ts` - Request handlers
- **Service:** `src/features/blog/blog.service.ts` - Business logic
- **DTO:** `src/features/blog/blog.dto.ts` - Data validation
- **Interface:** `src/features/blog/blog.interface.ts` - Type definitions
- **Schema:** `database/blog.schema.ts` - Database table definition

### Changes Made

1. **Simplified Routes** - Removed non-CRUD endpoints:
   - ❌ Removed: `/blog/insertblog`
   - ❌ Removed: `/blog/getblog/:id`
   - ❌ Removed: `/blog/updateblog`
   - ❌ Removed: `/blog/deleteblog`
   - ❌ Removed: `/blog/getallblogs`
   - ❌ Removed: `/blog/getDeletedblog`
   - ❌ Removed: `/blog/getblogby`
   - ❌ Removed: `/blog/getblogtypes`
   - ✅ Added: RESTful CRUD endpoints (`GET /blog`, `GET /blog/:id`, `POST /blog`, `PUT /blog`, `DELETE /blog`)

2. **Controller Refactoring**
   - Renamed methods to follow conventions
   - Standardized response format with `success`, `data`, and `message`
   - Improved error handling

3. **Service Improvements**
   - Added validation for required fields
   - Implemented proper soft delete logic
   - Added default value handling
   - Improved error messages

4. **DTO Updates**
   - Made `title`, `slug`, and `author_name` optional for updates
   - Fixed validation middleware configuration

5. **Authentication**
   - GET endpoints are now public
   - POST, PUT, DELETE require Admin/Super Admin roles
   - Added blog routes to public routes in auth middleware

## Best Practices

1. **Always use unique slugs** - Slugs must be unique across all blogs
2. **Validate data on client side** - Check required fields before sending requests
3. **Use proper authentication** - Include Bearer token for admin operations
4. **Handle errors gracefully** - Check response status and error messages
5. **Soft deletes** - Deleted blogs are marked as deleted but not removed from database

## Example Usage

### JavaScript/Node.js
```javascript
// Get all blogs
const response = await fetch('http://localhost:8000/api/v1/blog');
const data = await response.json();

// Create a blog (with authentication)
const newBlog = await fetch('http://localhost:8000/api/v1/blog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    title: 'My New Blog',
    slug: 'my-new-blog-' + Date.now(),
    author_name: 'John Doe',
    content: '<p>Blog content...</p>',
    created_by: userId
  })
});
```

### cURL
```bash
# Get all blogs
curl http://localhost:8000/api/v1/blog

# Create a blog
curl -X POST http://localhost:8000/api/v1/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My Blog",
    "slug": "my-blog-123",
    "author_name": "John Doe",
    "content": "Content here",
    "created_by": 84
  }'
```

## Migration Guide

If you were using the old blog API endpoints, here's how to migrate:

| Old Endpoint | New Endpoint | Notes |
|-------------|-------------|--------|
| `GET /blog/getallblogs` | `GET /blog` | Returns same data structure |
| `GET /blog/getblog/:id` | `GET /blog/:id` | Returns same data structure |
| `POST /blog/insertblog` | `POST /blog` | Request body unchanged |
| `PUT /blog/updateblog` | `PUT /blog` | Request body unchanged |
| `POST /blog/deleteblog` | `DELETE /blog` | Changed to DELETE method |
| `GET /blog/getDeletedblog` | ❌ Removed | Use admin panel to view deleted blogs |
| `GET /blog/getblogby?category=X` | ❌ Removed | Filter on client side or use search endpoint |
| `GET /blog/getblogtypes` | ❌ Removed | Use categories API |

## Support

For issues or questions about the Blog API, please:
1. Check this documentation first
2. Review the test files for usage examples
3. Contact the development team
