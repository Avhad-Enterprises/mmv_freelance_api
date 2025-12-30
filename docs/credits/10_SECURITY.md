# Credit Management System - Security

> **Last Updated**: December 2024

---

## Overview

This document covers security measures implemented in the Credit Management System.

---

## Authentication

### JWT Token Requirement

All credit endpoints require a valid JWT token:

```http
Authorization: Bearer <jwt_token>
```

### Token Validation

```typescript
// authMiddleware checks:
// 1. Token exists in Authorization header
// 2. Token is valid (not expired, correct signature)
// 3. User exists in database
// 4. User is not blocked/deactivated
```

### Token Contents

```json
{
  "user_id": 42,
  "email": "user@example.com",
  "role": "VIDEOGRAPHER",
  "permissions": ["credits.view_own", "credits.purchase", ...],
  "iat": 1703001234,
  "exp": 1703087634
}
```

---

## Authorization (RBAC)

### Permission-Based Access Control

Each endpoint requires specific permissions:

| Endpoint | Permission Required |
|----------|---------------------|
| GET `/credits/balance` | `credits.view_own` |
| GET `/credits/packages` | `credits.view_packages` |
| POST `/credits/initiate-purchase` | `credits.purchase` |
| POST `/credits/verify-payment` | `credits.purchase` |
| GET `/credits/history` | `credits.view_history` |
| GET `/credits/refund-eligibility/:id` | `credits.request_refund` |
| GET `/credits/refunds` | `credits.request_refund` |

### Admin Permissions

| Endpoint | Permission Required |
|----------|---------------------|
| GET `/admin/credits/transactions` | `credits.admin.view_all` |
| POST `/admin/credits/adjust` | `credits.admin.adjust` |
| GET `/admin/credits/analytics` | `credits.admin.analytics` |
| GET `/admin/credits/user/:id` | `credits.admin.view_all` |
| POST `/admin/credits/refund-project/:id` | `credits.admin.refund` |
| GET `/admin/credits/export` | `credits.admin.export` |
| GET/PUT `/admin/credits/settings` | `credits.admin.view_all` / `credits.admin.adjust` |

### Role-Permission Mapping

| Role | Permissions |
|------|-------------|
| VIDEOGRAPHER | `credits.view_own`, `credits.view_packages`, `credits.purchase`, `credits.view_history`, `credits.request_refund` |
| VIDEO_EDITOR | `credits.view_own`, `credits.view_packages`, `credits.purchase`, `credits.view_history`, `credits.request_refund` |
| CLIENT | None |
| ADMIN | All `credits.admin.*` permissions |

### Permission Middleware

```typescript
// requirePermission middleware
import { requirePermission } from '../middlewares/permission.middleware';

router.get('/balance', requirePermission('credits.view_own'), controller.getBalance);
```

---

## Rate Limiting

### Protection Against Abuse

Rate limits prevent brute force and abuse:

| Operation | Limit | Window |
|-----------|-------|--------|
| Credit operations (balance, history) | 100 | 1 minute |
| Purchase attempts | 100 | 1 hour |

### Implementation

```typescript
// Rate limiter configuration
export const creditOperationsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: 'Too many requests. Please wait.' },
  keyGenerator: (req) => req.ip || 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
});

export const purchaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { success: false, message: 'Too many purchase attempts.' },
});
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703001234
```

---

## Input Validation

### DTO Validation

All input is validated using class-validator:

```typescript
// credits.dto.ts
export class InitiatePurchaseDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(CREDIT_CONFIG.MAX_SINGLE_PURCHASE)
  credits_amount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  package_id?: number;
}
```

### Validation Middleware

```typescript
router.post(
  '/initiate-purchase',
  validationMiddleware(InitiatePurchaseDto, 'body'),
  controller.initiatePurchase
);
```

### Sanitization

- HTML entities are escaped
- Query parameters are type-coerced
- Numbers are validated as integers where required

---

## Database Security

### SQL Injection Prevention

Using Knex.js query builder prevents SQL injection:

```typescript
// ✅ Safe - parameterized query
await DB('freelancer_profiles').where({ user_id }).first();

// ❌ Unsafe - string interpolation (we don't do this)
await DB.raw(`SELECT * FROM users WHERE id = ${userId}`);
```

### Row-Level Locking

Prevent race conditions in concurrent operations:

```typescript
await DB.transaction(async (trx) => {
  const profile = await trx('freelancer_profiles')
    .where({ user_id })
    .forUpdate() // Lock this row
    .first();

  // Safe to update now
  await trx('freelancer_profiles')
    .where({ user_id })
    .update({ credits_balance: newBalance });
});
```

### Foreign Key Constraints

```sql
user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
```

---

## Payment Security

### Server-Side Verification

Never trust client-sent payment data:

```typescript
// Always verify from Razorpay
const order = await razorpay.orders.fetch(order_id);
const credits = parseInt(order.notes.credits); // Use server-set value
```

### Signature Validation

Verify payment authenticity:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  .update(order_id + "|" + payment_id)
  .digest('hex');

if (expectedSignature !== razorpay_signature) {
  throw new Error('Invalid signature');
}
```

### Idempotency

Prevent double-processing:

```typescript
const existing = await DB('credit_transactions')
  .where({ payment_transaction_id })
  .first();

if (existing) {
  throw new HttpException(400, 'Payment already processed');
}
```

---

## Audit Trail

### Transaction Logging

Every credit operation is logged:

```typescript
await this.logger.log({
  user_id,
  transaction_type: 'purchase',
  amount: credits,
  balance_before: previousBalance,
  balance_after: newBalance,
  payment_gateway: 'razorpay',
  payment_transaction_id,
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
});
```

### Admin Action Logging

Admin operations include admin identity:

```typescript
{
  admin_user_id: req.user.user_id,
  admin_reason: 'Compensation for issue #123',
  // ...
}
```

### Log Immutability

Transaction logs are INSERT-only:
- No UPDATE operations on `credit_transactions`
- No DELETE operations
- Historical data preserved forever

---

## Data Protection

### Sensitive Data Handling

| Data | Storage | Transmission |
|------|---------|--------------|
| Credit balance | Encrypted at rest (DB-level) | HTTPS only |
| Payment IDs | Stored in DB | Not exposed to client |
| Admin reasons | Stored for audit | Admin-only access |

### What's NOT Stored

- Full card numbers (handled by Razorpay)
- CVV (never touches our server)
- Razorpay key secret in logs

### Access Control

- Users can only see their own balance
- Users can only see their own history
- Admin endpoints require explicit permissions

---

## Error Handling Security

### Safe Error Messages

```typescript
// ✅ Safe - generic message
throw new HttpException(400, 'Invalid payment');

// ❌ Unsafe - exposes internals
throw new HttpException(400, `Database error: ${error.message}`);
```

### Error Response Format

```json
{
  "success": false,
  "message": "User-safe message",
  "code": "ERROR_CODE"
}
```

Stack traces are never exposed in production.

---

## HTTPS Requirement

### Production Configuration

```typescript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}
```

### Razorpay Requirement

Razorpay checkout requires HTTPS in production mode.

---

## Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());
// Sets:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 1; mode=block
// - Strict-Transport-Security (HSTS)
```

---

## Security Checklist

### Before Deployment

- [ ] `RAZORPAY_KEY_SECRET` is in environment, not code
- [ ] All endpoints have appropriate permission checks
- [ ] Rate limiting is enabled
- [ ] HTTPS is configured
- [ ] Database has strong password
- [ ] JWT secret is strong and in environment
- [ ] Error messages don't expose internals
- [ ] Logging doesn't include sensitive data

### Regular Audits

- [ ] Review admin access logs monthly
- [ ] Monitor for unusual transaction patterns
- [ ] Keep dependencies updated
- [ ] Rotate secrets periodically
