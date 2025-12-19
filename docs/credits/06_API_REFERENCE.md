# Credit Management System - API Reference

> **Last Updated**: December 2024  
> **Base URL**: `/api/v1`

---

## Authentication

All endpoints require JWT authentication unless otherwise specified.

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints Overview

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/credits/balance` | Get current balance | `credits.view_own` |
| GET | `/credits/packages` | List available packages | `credits.view_packages` |
| POST | `/credits/initiate-purchase` | Create Razorpay order | `credits.purchase` |
| POST | `/credits/verify-payment` | Verify and add credits | `credits.purchase` |
| GET | `/credits/history` | Transaction history | `credits.view_history` |
| GET | `/credits/refund-eligibility/:id` | Check refund eligibility | `credits.request_refund` |
| GET | `/credits/refunds` | List user's refunds | `credits.request_refund` |

---

## GET /credits/balance

Get the current credit balance for the authenticated user.

### Request

```http
GET /api/v1/credits/balance
Authorization: Bearer <token>
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "credits_balance": 25,
    "total_credits_purchased": 50,
    "credits_used": 25
  },
  "message": "Credits balance retrieved successfully"
}
```

### Error Responses

| Status | Code | Message |
|--------|------|---------|
| 401 | - | Unauthorized |
| 403 | - | Insufficient permissions |
| 404 | - | Freelancer profile not found |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/credits/balance" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## GET /credits/packages

Get list of available credit packages with current pricing.

### Request

```http
GET /api/v1/credits/packages
Authorization: Bearer <token>
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": 1,
        "name": "Starter",
        "credits": 10,
        "price": 500,
        "description": "Perfect for trying out the platform"
      },
      {
        "id": 2,
        "name": "Basic",
        "credits": 25,
        "price": 1125,
        "savings_percent": 10,
        "description": "Best for regular users"
      },
      {
        "id": 3,
        "name": "Pro",
        "credits": 50,
        "price": 2000,
        "savings_percent": 20,
        "description": "Recommended for active freelancers",
        "popular": true
      },
      {
        "id": 4,
        "name": "Enterprise",
        "credits": 100,
        "price": 3500,
        "savings_percent": 30,
        "description": "Best value for power users"
      }
    ],
    "pricePerCredit": 50,
    "currency": "INR",
    "limits": {
      "minPurchase": 1,
      "maxPurchase": 200,
      "maxBalance": 1000
    }
  },
  "message": "Credit packages retrieved successfully"
}
```

### Notes

- `price` is calculated dynamically based on `pricePerCredit` setting
- `savings_percent` shows discount compared to buying individual credits

---

## POST /credits/initiate-purchase

Create a Razorpay order to initiate credit purchase.

### Request

```http
POST /api/v1/credits/initiate-purchase
Authorization: Bearer <token>
Content-Type: application/json
```

#### Option 1: Purchase by Package

```json
{
  "package_id": 3
}
```

#### Option 2: Purchase Custom Amount

```json
{
  "credits_amount": 15
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `package_id` | Must be valid package ID (1-4) |
| `credits_amount` | Integer, min 1, max 200 |

*Note: If both provided, `package_id` takes precedence.*

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "order_id": "order_ABC123XYZ",
    "amount": 200000,
    "currency": "INR",
    "credits": 50,
    "package_name": "Pro",
    "key_id": "rzp_test_xxxxxx",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "Order created successfully. Complete payment to receive credits."
}
```

### Response Fields

| Field | Description |
|-------|-------------|
| `order_id` | Razorpay order ID (pass to checkout) |
| `amount` | Amount in **paise** (₹2000 = 200000 paise) |
| `key_id` | Razorpay publishable key |
| `credits` | Credits to be added after payment |

### Error Responses

| Status | Code | Message |
|--------|------|---------|
| 400 | - | Invalid package ID |
| 400 | - | Credits amount required |
| 400 | `MAX_BALANCE_EXCEEDED` | Would exceed maximum balance |
| 401 | - | Unauthorized |
| 429 | - | Too many purchase attempts |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/credits/initiate-purchase" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"package_id": 3}'
```

---

## POST /credits/verify-payment

Verify Razorpay payment and add credits to balance.

### Request

```http
POST /api/v1/credits/verify-payment
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "razorpay_order_id": "order_ABC123XYZ",
  "razorpay_payment_id": "pay_DEF456UVW",
  "razorpay_signature": "signature_hash..."
}
```

### Validation Rules

All fields are required and must match the payment completed on Razorpay.

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "credits_added": 50,
    "credits_balance": 75,
    "transaction_id": "pay_DEF456UVW"
  },
  "message": "Payment verified. 50 credits added to your account."
}
```

### Error Responses

| Status | Code | Message |
|--------|------|---------|
| 400 | - | Missing required fields |
| 400 | `INVALID_SIGNATURE` | Payment signature verification failed |
| 400 | `PAYMENT_ALREADY_PROCESSED` | This payment was already processed |
| 401 | - | Unauthorized |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/credits/verify-payment" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_ABC123XYZ",
    "razorpay_payment_id": "pay_DEF456UVW",
    "razorpay_signature": "abc123..."
  }'
```

---

## GET /credits/history

Get credit transaction history for authenticated user.

### Request

```http
GET /api/v1/credits/history?page=1&limit=10&type=purchase
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page (max 50) |
| `type` | string | - | Filter by type: `purchase`, `deduction`, `refund` |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": 1001,
        "transaction_type": "purchase",
        "amount": 25,
        "balance_before": 5,
        "balance_after": 30,
        "description": "Purchased 25 credits (Basic package)",
        "payment_amount": 1125.00,
        "created_at": "2024-12-19T10:30:00.000Z"
      },
      {
        "transaction_id": 1002,
        "transaction_type": "deduction",
        "amount": -1,
        "balance_before": 30,
        "balance_after": 29,
        "description": "Applied to project #567",
        "created_at": "2024-12-19T11:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  },
  "message": "Transaction history retrieved successfully"
}
```

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/credits/history?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## GET /credits/refund-eligibility/:application_id

Check if an application is eligible for credit refund.

### Request

```http
GET /api/v1/credits/refund-eligibility/123
Authorization: Bearer <token>
```

### Success Response (200)

#### Eligible

```json
{
  "success": true,
  "data": {
    "application_id": 123,
    "eligible": true,
    "reason": null,
    "credits_to_refund": 1
  },
  "message": "Application is eligible for refund"
}
```

#### Not Eligible

```json
{
  "success": true,
  "data": {
    "application_id": 123,
    "eligible": false,
    "reason": "Application is older than 24 hours",
    "credits_to_refund": 0
  },
  "message": "Application is not eligible for refund"
}
```

### Eligibility Conditions

| Condition | Must Be |
|-----------|---------|
| Application exists | Yes |
| User owns application | Yes |
| Application age | < 24 hours |
| Credit was deducted | Yes |
| Not already refunded | Yes |

### Error Responses

| Status | Code | Message |
|--------|------|---------|
| 401 | - | Unauthorized |
| 403 | - | Not your application |
| 404 | - | Application not found |

---

## GET /credits/refunds

Get list of refund transactions for authenticated user.

### Request

```http
GET /api/v1/credits/refunds?page=1&limit=10
Authorization: Bearer <token>
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "refunds": [
      {
        "transaction_id": 1003,
        "amount": 1,
        "reason": "WITHDRAWN",
        "application_id": 123,
        "project_title": "Video Editing Project",
        "created_at": "2024-12-19T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "message": "Refunds retrieved successfully"
}
```

---

## TypeScript Interfaces

```typescript
// Balance Response
interface CreditBalance {
  credits_balance: number;
  total_credits_purchased: number;
  credits_used: number;
}

// Package
interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  description?: string;
  savings_percent?: number;
  popular?: boolean;
}

// Transaction
interface CreditTransaction {
  transaction_id: number;
  transaction_type: 'purchase' | 'deduction' | 'refund' | 'admin_add' | 'admin_deduct';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  payment_amount?: number;
  created_at: string;
}

// Pagination
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Initiate Purchase Response
interface InitiatePurchaseResponse {
  order_id: string;
  amount: number; // in paise
  currency: string;
  credits: number;
  package_name?: string;
  key_id: string;
  user: {
    name: string;
    email: string;
  };
}
```
