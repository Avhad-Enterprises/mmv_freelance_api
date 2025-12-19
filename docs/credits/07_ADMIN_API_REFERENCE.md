# Credit Management System - Admin API Reference

> **Last Updated**: December 2024  
> **Base URL**: `/api/v1/admin/credits`

---

## Authentication & Authorization

All admin endpoints require:
1. JWT authentication
2. Admin role with appropriate permissions

```
Authorization: Bearer <admin_jwt_token>
```

---

## Endpoints Overview

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/transactions` | List all transactions | `credits.admin.view_all` |
| POST | `/adjust` | Add/deduct user credits | `credits.admin.adjust` |
| GET | `/analytics` | System statistics | `credits.admin.analytics` |
| GET | `/user/:user_id` | User credit details | `credits.admin.view_all` |
| POST | `/refund-project/:id` | Bulk refund for project | `credits.admin.refund` |
| GET | `/export` | Export transactions CSV | `credits.admin.export` |
| GET | `/settings` | Get pricing settings | `credits.admin.view_all` |
| PUT | `/settings` | Update pricing | `credits.admin.adjust` |

---

## GET /admin/credits/transactions

Get all credit transactions across all users with filtering.

### Request

```http
GET /api/v1/admin/credits/transactions?page=1&limit=50&type=purchase
Authorization: Bearer <admin_token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Items per page (max 100) |
| `user_id` | integer | - | Filter by user |
| `type` | string | - | Filter by transaction type |
| `from` | date | - | Start date (ISO format) |
| `to` | date | - | End date (ISO format) |
| `sort_by` | string | `created_at` | Sort field |
| `sort_order` | string | `desc` | Sort direction: `asc` or `desc` |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": 1001,
        "user_id": 42,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "transaction_type": "purchase",
        "amount": 25,
        "balance_before": 5,
        "balance_after": 30,
        "payment_gateway": "razorpay",
        "payment_order_id": "order_ABC123",
        "payment_transaction_id": "pay_XYZ789",
        "payment_amount": 1125.00,
        "package_name": "Basic",
        "description": "Purchased 25 credits",
        "created_at": "2024-12-19T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 50,
      "totalPages": 25
    }
  },
  "message": "Transactions retrieved successfully"
}
```

### cURL Example

```bash
# Get all purchase transactions from last week
curl -X GET "http://localhost:8000/api/v1/admin/credits/transactions?type=purchase&from=2024-12-12" \
  -H "Authorization: Bearer <admin_token>"
```

---

## POST /admin/credits/adjust

Manually add or deduct credits from a user's account.

### Request

```http
POST /api/v1/admin/credits/adjust
Authorization: Bearer <admin_token>
Content-Type: application/json
```

```json
{
  "user_id": 42,
  "amount": 10,
  "reason": "Compensation for technical issue"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `user_id` | Required, must be valid freelancer user |
| `amount` | Required, non-zero integer (positive to add, negative to deduct) |
| `reason` | Required, string explaining adjustment |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 42,
      "email": "john@example.com",
      "name": "John Doe"
    },
    "previousBalance": 25,
    "adjustment": 10,
    "newBalance": 35,
    "adjusted_by": 1
  },
  "message": "Successfully added 10 credits"
}
```

### Error Responses

| Status | Code | Message |
|--------|------|---------|
| 400 | - | user_id, amount, and reason are required |
| 400 | - | Amount must be a non-zero integer |
| 400 | - | Adjustment would result in negative balance |
| 400 | - | Would exceed maximum balance of 1000 |
| 404 | - | Freelancer profile not found |

### cURL Examples

```bash
# Add 10 credits
curl -X POST "http://localhost:8000/api/v1/admin/credits/adjust" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 42, "amount": 10, "reason": "Promotional bonus"}'

# Deduct 5 credits
curl -X POST "http://localhost:8000/api/v1/admin/credits/adjust" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 42, "amount": -5, "reason": "Policy violation adjustment"}'
```

---

## GET /admin/credits/analytics

Get system-wide credit statistics and analytics.

### Request

```http
GET /api/v1/admin/credits/analytics?from=2024-12-01&to=2024-12-19
Authorization: Bearer <admin_token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `from` | date | 30 days ago | Analysis start date |
| `to` | date | today | Analysis end date |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "overview": {
      "credits_in_circulation": 15420,
      "total_revenue_inr": 385000.00,
      "price_per_credit": 50
    },
    "transactions_by_type": [
      { "transaction_type": "purchase", "count": "1250", "total_amount": "18500" },
      { "transaction_type": "deduction", "count": "8900", "total_amount": "-8900" },
      { "transaction_type": "refund", "count": "120", "total_amount": "120" },
      { "transaction_type": "admin_add", "count": "15", "total_amount": "450" },
      { "transaction_type": "admin_deduct", "count": "3", "total_amount": "-75" }
    ],
    "daily_stats": [
      { "date": "2024-12-19", "transactions": "156" },
      { "date": "2024-12-18", "transactions": "142" },
      { "date": "2024-12-17", "transactions": "189" }
    ],
    "top_users": [
      { "user_id": 42, "email": "power@user.com", "total_credits_purchased": 500 },
      { "user_id": 88, "email": "active@freelancer.com", "total_credits_purchased": 350 }
    ],
    "period": {
      "from": "2024-12-01T00:00:00.000Z",
      "to": "2024-12-19T23:59:59.999Z"
    }
  },
  "message": "Analytics retrieved successfully"
}
```

### Analytics Fields

| Field | Description |
|-------|-------------|
| `credits_in_circulation` | Sum of all user balances |
| `total_revenue_inr` | Sum of all payment amounts |
| `price_per_credit` | Current price setting |
| `transactions_by_type` | Breakdown by transaction type |
| `daily_stats` | Transaction counts per day (last 7 days) |
| `top_users` | Top 10 users by total purchases |

---

## GET /admin/credits/user/:user_id

Get detailed credit information for a specific user.

### Request

```http
GET /api/v1/admin/credits/user/42
Authorization: Bearer <admin_token>
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 42,
      "email": "john@example.com",
      "name": "John Doe"
    },
    "credits": {
      "credits_balance": 25,
      "total_credits_purchased": 100,
      "credits_used": 75
    },
    "recent_transactions": [
      {
        "transaction_id": 1005,
        "transaction_type": "deduction",
        "amount": -1,
        "balance_after": 25,
        "description": "Applied to project #789",
        "created_at": "2024-12-19T14:20:00.000Z"
      }
    ]
  },
  "message": "User credit info retrieved successfully"
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | User not found |

---

## POST /admin/credits/refund-project/:project_id

Process bulk refunds for all applicants of a cancelled project.

### Request

```http
POST /api/v1/admin/credits/refund-project/567
Authorization: Bearer <admin_token>
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "project_id": 567,
    "project_title": "Video Editing for Marketing Campaign",
    "refunds_processed": 12,
    "total_applications": 15
  },
  "message": "Refunded 12 of 15 applications"
}
```

### Notes

- Only applications with `credit_deducted = true` and `credit_refunded = false` are processed
- Each refund is logged with `admin_user_id`
- Operation is idempotent (safe to call multiple times)

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Project not found |

---

## GET /admin/credits/export

Export transactions as CSV file.

### Request

```http
GET /api/v1/admin/credits/export?from=2024-12-01&type=purchase
Authorization: Bearer <admin_token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | date | Filter start date |
| `to` | date | Filter end date |
| `type` | string | Filter by transaction type |

### Success Response (200)

```csv
Transaction ID,User ID,Email,Name,Type,Amount,Balance After,Date
1001,42,john@example.com,John Doe,purchase,25,30,2024-12-19T10:30:00.000Z
1002,42,john@example.com,John Doe,deduction,-1,29,2024-12-19T11:00:00.000Z
```

### Response Headers

```
Content-Type: text/csv
Content-Disposition: attachment; filename=credit_transactions_1703001234567.csv
```

### cURL Example

```bash
# Download CSV
curl -X GET "http://localhost:8000/api/v1/admin/credits/export?from=2024-12-01" \
  -H "Authorization: Bearer <admin_token>" \
  -o transactions.csv
```

---

## GET /admin/credits/settings

Get current credit pricing settings.

### Request

```http
GET /api/v1/admin/credits/settings
Authorization: Bearer <admin_token>
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "price_per_credit": 50,
    "currency": "INR"
  },
  "message": "Settings retrieved successfully"
}
```

---

## PUT /admin/credits/settings

Update credit pricing settings.

### Request

```http
PUT /api/v1/admin/credits/settings
Authorization: Bearer <admin_token>
Content-Type: application/json
```

```json
{
  "price_per_credit": 60
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `price_per_credit` | Required, positive number |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "price_per_credit": 60
  },
  "message": "Credit settings updated successfully"
}
```

### Notes

- Changes take effect immediately
- All package prices will reflect new pricing on next fetch
- The admin who made the change is logged in `credit_settings.updated_by`

### Error Responses

| Status | Message |
|--------|---------|
| 400 | price_per_credit is required |
| 400 | Price must be a positive number |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/admin/credits/settings" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"price_per_credit": 60}'
```

---

## TypeScript Interfaces

```typescript
// Admin Transaction (includes user info)
interface AdminCreditTransaction {
  transaction_id: number;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  transaction_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  payment_gateway?: string;
  payment_order_id?: string;
  payment_transaction_id?: string;
  payment_amount?: number;
  package_name?: string;
  admin_user_id?: number;
  admin_reason?: string;
  description: string;
  created_at: string;
}

// Analytics Overview
interface CreditAnalytics {
  overview: {
    credits_in_circulation: number;
    total_revenue_inr: number;
    price_per_credit: number;
  };
  transactions_by_type: Array<{
    transaction_type: string;
    count: string;
    total_amount: string;
  }>;
  daily_stats: Array<{
    date: string;
    transactions: string;
  }>;
  top_users: Array<{
    user_id: number;
    email: string;
    total_credits_purchased: number;
  }>;
  period: {
    from: string;
    to: string;
  };
}

// Adjust Credits Request
interface AdjustCreditsRequest {
  user_id: number;
  amount: number; // positive to add, negative to deduct
  reason: string;
}

// Settings
interface CreditSettings {
  price_per_credit: number;
  currency?: string;
}
```
