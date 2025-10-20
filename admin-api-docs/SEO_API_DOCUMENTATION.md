# SEO API Documentation

## Overview
The SEO API provides endpoints for managing Search Engine Optimization (SEO) metadata entries. This API is restricted to ADMIN and SUPER_ADMIN roles only.

## Base URL
```
/api/v1/seos
```

## Authentication
All SEO endpoints require authentication with ADMIN or SUPER_ADMIN role.

## Endpoints

### 1. Create SEO Entry
**POST** `/api/v1/seos`

Creates a new SEO metadata entry.

**Request Body:**
```json
{
  "meta_title": "Page Title",
  "meta_description": "Page description for search engines",
  "canonical_url": "https://example.com/page",
  "og_title": "Open Graph Title",
  "og_description": "Open Graph Description",
  "og_image_url": "https://example.com/image.jpg",
  "og_site_name": "Site Name",
  "og_locale": "en_US",
  "twitter_card": "summary_large_image",
  "twitter_title": "Twitter Title",
  "twitter_description": "Twitter Description",
  "twitter_image_url": "https://example.com/twitter-image.jpg",
  "twitter_site": "@sitehandle",
  "twitter_creator": "@creatorhandle",
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "meta_title": "Page Title",
    "meta_description": "Page description for search engines",
    "canonical_url": "https://example.com/page",
    "og_title": "Open Graph Title",
    "og_description": "Open Graph Description",
    "og_image_url": "https://example.com/image.jpg",
    "og_site_name": "Site Name",
    "og_locale": "en_US",
    "twitter_card": "summary_large_image",
    "twitter_title": "Twitter Title",
    "twitter_description": "Twitter Description",
    "twitter_image_url": "https://example.com/twitter-image.jpg",
    "twitter_site": "@sitehandle",
    "twitter_creator": "@creatorhandle",
    "status": "active",
    "is_active": true,
    "is_deleted": false,
    "created_at": "2025-10-20T11:04:43.417Z",
    "updated_at": "2025-10-20T11:04:43.417Z"
  },
  "message": "SEO entry created successfully"
}
```

### 2. Get All SEO Entries
**GET** `/api/v1/seos`

Retrieves all active SEO entries (not soft deleted).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "meta_title": "Page Title",
      "meta_description": "Page description",
      "canonical_url": "https://example.com/page",
      "og_title": "Open Graph Title",
      "og_description": "Open Graph Description",
      "og_image_url": "https://example.com/image.jpg",
      "og_site_name": "Site Name",
      "og_locale": "en_US",
      "twitter_card": "summary_large_image",
      "twitter_title": "Twitter Title",
      "twitter_description": "Twitter Description",
      "twitter_image_url": "https://example.com/twitter-image.jpg",
      "twitter_site": "@sitehandle",
      "twitter_creator": "@creatorhandle",
      "status": "active",
      "is_active": true,
      "is_deleted": false,
      "created_at": "2025-10-20T11:04:43.417Z",
      "updated_at": "2025-10-20T11:04:43.417Z"
    }
  ],
  "message": "SEO entries fetched successfully"
}
```

### 3. Get SEO Entry by ID
**GET** `/api/v1/seos/:id`

Retrieves a specific SEO entry by ID.

**Parameters:**
- `id` (number): SEO entry ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "meta_title": "Page Title",
    "meta_description": "Page description",
    "canonical_url": "https://example.com/page",
    "og_title": "Open Graph Title",
    "og_description": "Open Graph Description",
    "og_image_url": "https://example.com/image.jpg",
    "og_site_name": "Site Name",
    "og_locale": "en_US",
    "twitter_card": "summary_large_image",
    "twitter_title": "Twitter Title",
    "twitter_description": "Twitter Description",
    "twitter_image_url": "https://example.com/twitter-image.jpg",
    "twitter_site": "@sitehandle",
    "twitter_creator": "@creatorhandle",
    "status": "active",
    "is_active": true,
    "is_deleted": false,
    "created_at": "2025-10-20T11:04:43.417Z",
    "updated_at": "2025-10-20T11:04:43.417Z"
  },
  "message": "SEO entry fetched successfully"
}
```

**Response (404):**
```json
{
  "success": false,
  "message": "SEO entry not found",
  "meta": {
    "timestamp": "2025-10-20T11:04:51.452Z",
    "version": "v1"
  }
}
```

### 4. Update SEO Entry
**PUT** `/api/v1/seos/:id`

Updates an existing SEO entry.

**Parameters:**
- `id` (number): SEO entry ID

**Request Body:**
```json
{
  "meta_title": "Updated Page Title",
  "meta_description": "Updated page description",
  "canonical_url": "https://example.com/updated-page"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "meta_title": "Updated Page Title",
    "meta_description": "Updated page description",
    "canonical_url": "https://example.com/updated-page",
    "og_title": "Open Graph Title",
    "og_description": "Open Graph Description",
    "og_image_url": "https://example.com/image.jpg",
    "og_site_name": "Site Name",
    "og_locale": "en_US",
    "twitter_card": "summary_large_image",
    "twitter_title": "Twitter Title",
    "twitter_description": "Twitter Description",
    "twitter_image_url": "https://example.com/twitter-image.jpg",
    "twitter_site": "@sitehandle",
    "twitter_creator": "@creatorhandle",
    "status": "active",
    "is_active": true,
    "is_deleted": false,
    "created_at": "2025-10-20T11:04:43.417Z",
    "updated_at": "2025-10-20T11:04:51.420Z"
  },
  "message": "SEO entry updated successfully"
}
```

### 5. Delete SEO Entry
**DELETE** `/api/v1/seos/:id`

Soft deletes an SEO entry (marks as deleted).

**Parameters:**
- `id` (number): SEO entry ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "meta_title": "Page Title",
    "meta_description": "Page description",
    "canonical_url": "https://example.com/page",
    "og_title": "Open Graph Title",
    "og_description": "Open Graph Description",
    "og_image_url": "https://example.com/image.jpg",
    "og_site_name": "Site Name",
    "og_locale": "en_US",
    "twitter_card": "summary_large_image",
    "twitter_title": "Twitter Title",
    "twitter_description": "Twitter Description",
    "twitter_image_url": "https://example.com/twitter-image.jpg",
    "twitter_site": "@sitehandle",
    "twitter_creator": "@creatorhandle",
    "status": "active",
    "is_active": true,
    "is_deleted": true,
    "created_at": "2025-10-20T11:04:43.417Z",
    "updated_at": "2025-10-20T11:04:51.440Z"
  },
  "message": "SEO entry deleted successfully"
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meta_title` | string | Yes | HTML meta title tag content |
| `meta_description` | string | Yes | HTML meta description tag content |
| `canonical_url` | string | No | Canonical URL for the page |
| `og_title` | string | No | Open Graph title |
| `og_description` | string | No | Open Graph description |
| `og_image_url` | string | No | Open Graph image URL |
| `og_site_name` | string | No | Open Graph site name |
| `og_locale` | string | No | Open Graph locale (e.g., "en_US") |
| `twitter_card` | string | No | Twitter card type |
| `twitter_title` | string | No | Twitter card title |
| `twitter_description` | string | No | Twitter card description |
| `twitter_image_url` | string | No | Twitter card image URL |
| `twitter_site` | string | No | Twitter site handle |
| `twitter_creator` | string | No | Twitter creator handle |
| `status` | string | No | SEO entry status |

## Error Responses

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication token missing",
  "meta": {
    "timestamp": "2025-10-20T11:04:43.375Z",
    "version": "v1"
  }
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "meta_title must be longer than or equal to 1 characters, meta_title should not be empty",
  "meta": {
    "timestamp": "2025-10-20T11:04:43.435Z",
    "version": "v1"
  }
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "SEO entry not found",
  "meta": {
    "timestamp": "2025-10-20T11:04:51.452Z",
    "version": "v1"
  }
}
```

## Notes

- All SEO entries support soft delete (marked as `is_deleted: true`)
- GET operations only return non-deleted entries
- All operations require ADMIN or SUPER_ADMIN authentication
- The API includes comprehensive validation for required fields
- Timestamps are automatically managed by the database