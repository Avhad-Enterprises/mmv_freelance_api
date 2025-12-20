# Credit Management System - Database Schema

> **Last Updated**: December 2024

---

## Tables Overview

| Table | Purpose |
|-------|---------|
| `freelancer_profiles` | Stores credit balance (existing table, modified) |
| `credit_transactions` | Audit log of all credit operations |
| `credit_settings` | Dynamic configuration (pricing) |
| `applied_projects` | Referenced for refund eligibility |

---

## 1. freelancer_profiles (Modified)

This is an existing table that was extended to support credits.

### Credit-Related Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `credits_balance` | INTEGER | 0 | Current available credits |
| `total_credits_purchased` | INTEGER | 0 | Lifetime credits purchased |
| `credits_used` | INTEGER | 0 | Lifetime credits spent |

### Constraints

```sql
-- Balance cannot be negative
CHECK (credits_balance >= 0)

-- Used cannot exceed purchased
CHECK (credits_used <= total_credits_purchased)
```

### Example Record

```json
{
  "user_id": 42,
  "credits_balance": 15,
  "total_credits_purchased": 50,
  "credits_used": 35
}
```

---

## 2. credit_transactions

Complete audit trail of all credit operations.

### Schema

```sql
CREATE TABLE credit_transactions (
  -- Primary Key
  transaction_id SERIAL PRIMARY KEY,
  
  -- User Reference
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Transaction Type
  transaction_type VARCHAR(20) NOT NULL CHECK (
    transaction_type IN (
      'purchase',      -- Credits bought
      'deduction',     -- Credits spent on application
      'refund',        -- Credits returned
      'admin_add',     -- Admin added credits
      'admin_deduct',  -- Admin removed credits
      'expiry'         -- Credits expired (future use)
    )
  ),
  
  -- Amount (positive for add, negative for deduct)
  amount INTEGER NOT NULL,
  
  -- Balance Tracking
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- Reference Tracking
  reference_type VARCHAR(50),    -- 'payment', 'application', 'admin', 'system'
  reference_id INTEGER,          -- ID of related entity
  
  -- Payment Details (for purchases)
  payment_gateway VARCHAR(50),           -- 'razorpay'
  payment_order_id VARCHAR(255),         -- Razorpay order ID
  payment_transaction_id VARCHAR(255),   -- Razorpay payment ID
  payment_amount DECIMAL(12,2),          -- Amount in INR
  payment_currency VARCHAR(3) DEFAULT 'INR',
  
  -- Package Details (for purchases)
  package_id INTEGER,
  package_name VARCHAR(100),
  
  -- Admin Adjustment Details
  admin_user_id INTEGER REFERENCES users(user_id),
  admin_reason TEXT,
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
-- User transactions ordered by date (history queries)
CREATE INDEX idx_credit_tx_user_date 
  ON credit_transactions(user_id, created_at DESC);

-- Transaction type filter
CREATE INDEX idx_credit_tx_type 
  ON credit_transactions(transaction_type);

-- Reference lookup (find transaction by application/payment)
CREATE INDEX idx_credit_tx_reference 
  ON credit_transactions(reference_type, reference_id);

-- Payment ID lookup (verify payment not already processed)
CREATE INDEX idx_credit_tx_payment_id 
  ON credit_transactions(payment_transaction_id);
```

### Transaction Types Explained

| Type | Amount Sign | When Created |
|------|-------------|--------------|
| `purchase` | + | After successful payment verification |
| `deduction` | - | When applying to a project |
| `refund` | + | When application is refunded |
| `admin_add` | + | Admin manually adds credits |
| `admin_deduct` | - | Admin manually removes credits |
| `expiry` | - | (Future) Automated expiration |

### Example Records

**Purchase Transaction:**
```json
{
  "transaction_id": 1001,
  "user_id": 42,
  "transaction_type": "purchase",
  "amount": 25,
  "balance_before": 5,
  "balance_after": 30,
  "reference_type": "payment",
  "payment_gateway": "razorpay",
  "payment_order_id": "order_ABC123",
  "payment_transaction_id": "pay_XYZ789",
  "payment_amount": 1125.00,
  "package_id": 2,
  "package_name": "Basic",
  "description": "Purchased 25 credits",
  "created_at": "2024-12-19T10:30:00Z"
}
```

**Deduction Transaction:**
```json
{
  "transaction_id": 1002,
  "user_id": 42,
  "transaction_type": "deduction",
  "amount": -1,
  "balance_before": 30,
  "balance_after": 29,
  "reference_type": "application",
  "reference_id": 567,
  "description": "Applied to project #567",
  "created_at": "2024-12-19T11:00:00Z"
}
```

**Refund Transaction:**
```json
{
  "transaction_id": 1003,
  "user_id": 42,
  "transaction_type": "refund",
  "amount": 1,
  "balance_before": 29,
  "balance_after": 30,
  "reference_type": "application",
  "reference_id": 567,
  "description": "Refund for project #567 - Project cancelled",
  "created_at": "2024-12-19T12:00:00Z"
}
```

---

## 3. credit_settings

Key-value store for dynamic configuration.

### Schema

```sql
CREATE TABLE credit_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  updated_by INTEGER REFERENCES users(user_id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Current Settings

| Key | Default Value | Description |
|-----|---------------|-------------|
| `price_per_credit` | `50` | Price in INR for a single credit |

### Example Record

```json
{
  "setting_key": "price_per_credit",
  "setting_value": "50",
  "description": "Price per single credit in INR",
  "updated_by": 1,
  "updated_at": "2024-12-19T10:00:00Z"
}
```

### Usage in Code

```typescript
// CreditSettingsService
async getPricePerCredit(): Promise<number> {
  const setting = await DB('credit_settings')
    .where({ setting_key: 'price_per_credit' })
    .first();
    
  return setting ? Number(setting.setting_value) : 50;
}
```

---

## 4. applied_projects (Reference)

Used for refund eligibility checks.

### Relevant Columns

| Column | Type | Used For |
|--------|------|----------|
| `application_id` | INTEGER | Primary key |
| `user_id` | INTEGER | Owner of application |
| `projects_task_id` | INTEGER | Project applied to |
| `created_at` | TIMESTAMP | 24-hour refund window check |
| `credit_deducted` | BOOLEAN | Was credit deducted? |
| `credit_refunded` | BOOLEAN | Was credit refunded? |

---

## Entity Relationship Diagram

```
┌─────────────────────────┐
│         users           │
│─────────────────────────│
│ user_id (PK)            │
│ email                   │
│ ...                     │
└───────────┬─────────────┘
            │
            │ 1:1
            ▼
┌─────────────────────────┐          ┌─────────────────────────┐
│   freelancer_profiles   │          │   credit_transactions   │
│─────────────────────────│          │─────────────────────────│
│ user_id (PK, FK)        │──────────│ transaction_id (PK)     │
│ credits_balance         │    1:N   │ user_id (FK)            │
│ total_credits_purchased │          │ transaction_type        │
│ credits_used            │          │ amount                  │
│ ...                     │          │ balance_before/after    │
└─────────────────────────┘          │ payment_*               │
                                     │ admin_user_id (FK)      │
                                     │ created_at              │
                                     └─────────────────────────┘
                                                │
                                                │ N:1 (optional)
                                                ▼
                                     ┌─────────────────────────┐
                                     │    applied_projects     │
                                     │─────────────────────────│
                                     │ application_id (PK)     │
                                     │ user_id (FK)            │
                                     │ projects_task_id (FK)   │
                                     │ credit_deducted         │
                                     │ credit_refunded         │
                                     └─────────────────────────┘

┌─────────────────────────┐
│    credit_settings      │
│─────────────────────────│
│ setting_key (PK)        │
│ setting_value           │
│ updated_by (FK)         │
│ updated_at              │
└─────────────────────────┘
```

---

## Migration Commands

### Create Tables

```bash
# Run all credit-related migrations
npm run migrate:schema -- credit_transactions
npm run migrate:schema -- credit_settings
```

### Rollback

```bash
# Drop and recreate (development only!)
npm run migrate:schema -- credit_transactions --drop
npm run migrate:schema -- credit_settings --drop
```

### Verify Tables

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('credit_transactions', 'credit_settings');

-- Check credit_settings values
SELECT * FROM credit_settings;

-- Sample transaction query
SELECT * FROM credit_transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Data Integrity Rules

### 1. Balance Consistency

```sql
-- Balance should equal purchased minus used
ALTER TABLE freelancer_profiles
ADD CONSTRAINT check_balance_consistency
CHECK (credits_balance = total_credits_purchased - credits_used);
```

*Note: Not enforced in code due to rounding during refunds.*

### 2. Transaction Immutability

- Transactions are INSERT-only (no UPDATE/DELETE)
- Historical data is preserved forever
- Balance columns on profiles are the "current truth"

### 3. Foreign Key Cascades

```sql
-- If user is deleted, their transactions are also deleted
user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
```
