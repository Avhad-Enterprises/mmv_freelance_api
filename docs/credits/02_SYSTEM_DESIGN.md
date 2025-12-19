# Credit Management System - System Design

> **Last Updated**: December 2024

---

## Design Goals

| Goal | Description |
|------|-------------|
| **Atomic Operations** | All credit changes must be all-or-nothing |
| **Audit Trail** | Every transaction must be logged for accountability |
| **Scalability** | Handle concurrent purchases and applications |
| **Flexibility** | Allow admin to change pricing without code changes |
| **Security** | Prevent double-spending, unauthorized access |

---

## Key Design Decisions

### 1. Why Store Credits as Integers?

**Decision**: Credits are stored as integers, not decimals.

**Reasoning**:
- Prevents floating-point precision errors
- Simpler comparison logic (no need for epsilon comparisons)
- All credit operations are whole numbers (can't buy 0.5 credits)
- Database operations are faster with integers

```sql
-- ✅ Good: Integer storage
credits_balance INTEGER DEFAULT 0

-- ❌ Avoided: Decimal storage
credits_balance DECIMAL(10,2) DEFAULT 0.00
```

---

### 2. Why Razorpay?

**Decision**: Use Razorpay as the payment gateway.

**Reasoning**:
- Native INR support (no currency conversion)
- Popular in India (target market)
- Good developer experience (SDK, documentation)
- Supports test mode for development
- Affordable transaction fees

**Alternatives Considered**:
- Stripe: Limited INR support at the time
- PayU: Less developer-friendly
- Paytm: Complex integration

---

### 3. Why Separate Balance Storage?

**Decision**: Store `credits_balance`, `total_credits_purchased`, and `credits_used` separately.

**Reasoning**:
- Fast balance lookups (no aggregation needed)
- Business analytics (total revenue, usage patterns)
- Audit verification (`balance = purchased - used`)

```sql
-- Balance can be verified against transactions
SELECT 
  credits_balance,
  total_credits_purchased - credits_used AS calculated_balance
FROM freelancer_profiles
WHERE user_id = ?
```

---

### 4. Why Transaction Log Table?

**Decision**: Create dedicated `credit_transactions` table for audit trail.

**Reasoning**:
- Immutable history (balance columns can be updated, logs cannot)
- Debugging and support (trace any balance issue)
- Analytics (transaction patterns, revenue reports)
- Compliance (financial audit requirements)

---

### 5. Why Dynamic Pricing?

**Decision**: Store `price_per_credit` in database, not as constant.

**Reasoning**:
- Change pricing without code deployment
- A/B testing different price points
- Time-limited promotions
- Regional pricing (future)

---

## Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Credits Feature                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Routes     │  │  Controllers │  │      Services        │   │
│  │              │  │              │  │                      │   │
│  │ • credits    │──│ • Credits    │──│ • CreditsService     │   │
│  │ • admin      │  │ • Admin      │  │ • CreditLogger       │   │
│  │              │  │              │  │ • CreditSettings     │   │
│  │              │  │              │  │ • CreditPackage      │   │
│  │              │  │              │  │ • CreditRefund       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │     DTOs     │  │ Middlewares  │  │      Constants       │   │
│  │              │  │              │  │                      │   │
│  │ • Purchase   │  │ • RateLimit  │  │ • CREDIT_PACKAGES    │   │
│  │ • Verify     │  │              │  │ • CREDIT_CONFIG      │   │
│  │ • Adjust     │  │              │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Purchase Flow

```
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  Client  │───▶│ POST         │───▶│ Validate       │───▶│ Check        │
│  Request │    │ /initiate-   │    │ Request Body   │    │ canPurchase  │
└──────────┘    │ purchase     │    └────────────────┘    └──────┬───────┘
                └──────────────┘                                  │
                                                                  ▼
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  Return  │◀───│ Return Order │◀───│ Create         │◀───│ Calculate    │
│  to User │    │ Details      │    │ Razorpay Order │    │ Price        │
└──────────┘    └──────────────┘    └────────────────┘    └──────────────┘
```

### Verification Flow

```
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  Client  │───▶│ POST         │───▶│ Validate       │───▶│ Verify       │
│  Request │    │ /verify-     │    │ Razorpay       │    │ Payment      │
└──────────┘    │ payment      │    │ Signature      │    │ Signature    │
                └──────────────┘    └────────────────┘    └──────┬───────┘
                                                                  │
                                                                  ▼
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  Return  │◀───│ Return New   │◀───│ Log            │◀───│ Add Credits  │
│  Balance │    │ Balance      │    │ Transaction    │    │ (Atomic)     │
└──────────┘    └──────────────┘    └────────────────┘    └──────────────┘
```

---

## Constraints & Limits

### Hard Limits

| Constraint | Value | Reason |
|------------|-------|--------|
| MIN_PURCHASE | 1 | No fractional credits |
| MAX_SINGLE_PURCHASE | 200 | Prevent fraud/abuse |
| MAX_BALANCE | 1,000 | Encourage usage, limit exposure |
| CREDITS_PER_APPLICATION | 1 | Business model |

### Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Credit operations | 100/minute | Per user |
| Purchase attempts | 100/hour | Per user |

### Soft Limits

| Limit | Behavior |
|-------|----------|
| MAX_BALANCE exceeded via payment | Warning logged, allowed (user already paid) |
| MAX_BALANCE exceeded via admin add | Blocked with error |

---

## Error Handling Strategy

### Error Categories

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Handling                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Validation      │  │ Business Logic  │                   │
│  │ Errors (400)    │  │ Errors (400)    │                   │
│  │                 │  │                 │                   │
│  │ • Invalid input │  │ • Insufficient  │                   │
│  │ • Missing field │  │   credits       │                   │
│  │ • Type mismatch │  │ • Max balance   │                   │
│  └─────────────────┘  │   exceeded      │                   │
│                       └─────────────────┘                   │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Auth Errors     │  │ System Errors   │                   │
│  │ (401/403)       │  │ (500)           │                   │
│  │                 │  │                 │                   │
│  │ • Missing token │  │ • DB failure    │                   │
│  │ • Invalid token │  │ • Razorpay down │                   │
│  │ • No permission │  │ • Timeout       │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Error Response Format

```json
{
  "success": false,
  "message": "Human readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

---

## Scalability Considerations

### Current Implementation
- Single database with Knex.js
- Row-level locking for concurrency
- In-memory rate limiting

### Future Scaling Options
| Challenge | Solution |
|-----------|----------|
| High transaction volume | Read replicas for history queries |
| Global users | Regional databases with eventual consistency |
| Rate limit across instances | Redis-based rate limiting |
| Analytics load | Separate analytics database |

---

## Security Measures

| Layer | Protection |
|-------|------------|
| **Transport** | HTTPS only |
| **Authentication** | JWT tokens required |
| **Authorization** | RBAC with granular permissions |
| **Input** | DTO validation, sanitization |
| **Database** | Parameterized queries (Knex) |
| **Payment** | Server-side verification, signature validation |
| **Rate Limiting** | Per-user operation limits |
