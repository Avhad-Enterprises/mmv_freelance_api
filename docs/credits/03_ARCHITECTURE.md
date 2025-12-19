# Credit Management System - Architecture

> **Last Updated**: December 2024

---

## Folder Structure

```
src/features/credits/
│
├── index.ts                    # Feature barrel export
│
├── constants/
│   ├── index.ts               # Constants barrel export
│   └── credit.constants.ts    # CREDIT_CONFIG, CREDIT_PACKAGES
│
├── controllers/
│   ├── index.ts               # Controllers barrel export
│   ├── credits.controller.ts  # User-facing endpoints
│   └── admin-credits.controller.ts  # Admin endpoints
│
├── dto/
│   ├── index.ts               # DTO barrel export
│   └── credits.dto.ts         # Validation schemas
│
├── interfaces/
│   ├── index.ts               # Interface barrel export
│   └── credit.interface.ts    # TypeScript interfaces
│
├── middlewares/
│   ├── index.ts               # Middleware barrel export
│   └── rate-limiter.middleware.ts  # Rate limiting
│
├── routes/
│   ├── index.ts               # Routes barrel export
│   ├── credits.routes.ts      # User routes
│   └── admin-credits.routes.ts  # Admin routes
│
└── services/
    ├── index.ts               # Services barrel export
    ├── credits.service.ts     # Core credit operations
    ├── credit-logger.service.ts   # Transaction logging
    ├── credit-settings.service.ts # Dynamic settings
    ├── credit-package.service.ts  # Package management
    └── credit-refund.service.ts   # Refund operations
```

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           HTTP REQUEST                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │    Auth     │  │    RBAC     │  │  Validation  │  │ RateLimit │  │
│  │ Middleware  │  │ Permission  │  │  Middleware  │  │ Middleware│  │
│  └─────────────┘  └─────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          ROUTE LAYER                                 │
│                                                                      │
│   credits.routes.ts              admin-credits.routes.ts             │
│   ├── GET  /balance              ├── GET  /transactions             │
│   ├── GET  /packages             ├── POST /adjust                   │
│   ├── POST /initiate-purchase    ├── GET  /analytics                │
│   ├── POST /verify-payment       ├── GET  /user/:id                 │
│   ├── GET  /history              ├── POST /refund-project/:id       │
│   ├── GET  /refund-eligibility   ├── GET  /export                   │
│   └── GET  /refunds              ├── GET  /settings                 │
│                                  └── PUT  /settings                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTROLLER LAYER                              │
│                                                                      │
│   ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│   │     CreditsController       │  │   AdminCreditsController    │  │
│   │                             │  │                             │  │
│   │  • getCreditsBalance()      │  │  • getAllTransactions()     │  │
│   │  • getPackages()            │  │  • adjustCredits()          │  │
│   │  • initiatePurchase()       │  │  • getAnalytics()           │  │
│   │  • verifyPayment()          │  │  • getUserCredits()         │  │
│   │  • purchaseCredits()        │  │  • refundProject()          │  │
│   │  • getHistory()             │  │  • exportTransactions()     │  │
│   │  • checkRefundEligibility() │  │  • getSettings()            │  │
│   │  • getRefunds()             │  │  • updateSettings()         │  │
│   └─────────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                │
│                                                                      │
│  ┌────────────────────┐  ┌─────────────────────────────────────┐    │
│  │   CreditsService   │  │         CreditLoggerService         │    │
│  │                    │  │                                     │    │
│  │ • getCreditsBalance│  │ • log()           - Log transaction │    │
│  │ • addCredits       │  │ • getHistory()    - Get user history│    │
│  │ • deductCredits    │  │ • getHistoryCount - Count for paging│    │
│  │ • hasEnoughCredits │  │ • getAllTransactions() - Admin list │    │
│  │ • getPackages      │  │ • getStatistics() - Analytics       │    │
│  │ • calculatePrice   │  └─────────────────────────────────────┘    │
│  │ • canPurchase      │                                             │
│  │ • getHistory       │  ┌─────────────────────────────────────┐    │
│  │ • getHistoryCount  │  │       CreditSettingsService         │    │
│  └────────────────────┘  │                                     │    │
│                          │ • getPricePerCredit() - Get price   │    │
│  ┌────────────────────┐  │ • updatePricePerCredit() - Set price│    │
│  │ CreditPackageService│ └─────────────────────────────────────┘    │
│  │                    │                                             │
│  │ • getPackages      │  ┌─────────────────────────────────────┐    │
│  │ • getPackageById   │  │        CreditRefundService          │    │
│  │ • calculatePrice   │  │                                     │    │
│  └────────────────────┘  │ • checkEligibility() - Can refund?  │    │
│                          │ • processRefund()    - Execute      │    │
│                          │ • getUserRefunds()   - List refunds │    │
│                          │ • processProjectCancellationRefunds │    │
│                          └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                │
│                                                                      │
│   ┌─────────────────────────┐   ┌────────────────────────────────┐  │
│   │   freelancer_profiles   │   │      credit_transactions       │  │
│   │                         │   │                                │  │
│   │ • user_id (FK)          │   │ • transaction_id (PK)          │  │
│   │ • credits_balance       │   │ • user_id (FK)                 │  │
│   │ • total_credits_purchased│  │ • transaction_type             │  │
│   │ • credits_used          │   │ • amount                       │  │
│   └─────────────────────────┘   │ • balance_before / after       │  │
│                                 │ • payment details              │  │
│   ┌─────────────────────────┐   │ • created_at                   │  │
│   │    credit_settings      │   └────────────────────────────────┘  │
│   │                         │                                       │
│   │ • setting_key (PK)      │   ┌────────────────────────────────┐  │
│   │ • setting_value         │   │       applied_projects         │  │
│   │ • updated_by            │   │                                │  │
│   │ • updated_at            │   │ (For refund eligibility check) │  │
│   └─────────────────────────┘   └────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                              │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                         RAZORPAY                             │   │
│   │                                                              │   │
│   │   • orders.create()     - Create payment order               │   │
│   │   • payments.fetch()    - Verify payment details             │   │
│   │   • Signature validation - Verify webhook authenticity       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Service Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE DEPENDENCY GRAPH                        │
└─────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   CreditsService    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ CreditLogger    │ │ CreditSettings  │ │ CreditPackage   │
│ Service         │ │ Service         │ │ Service         │
└─────────────────┘ └────────┬────────┘ └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  credit_settings│
                    │  (database)     │
                    └─────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    CONTROLLER DEPENDENCY GRAPH                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐           ┌─────────────────────────┐
│  CreditsController  │           │  AdminCreditsController │
└──────────┬──────────┘           └───────────┬─────────────┘
           │                                  │
           ▼                                  ▼
    ┌──────────────┐                   ┌───────────────┐
    │ CreditsService│                  │ CreditLogger  │
    └──────────────┘                   │ Service       │
                                       ├───────────────┤
                                       │ CreditRefund  │
                                       │ Service       │
                                       ├───────────────┤
                                       │ CreditSettings│
                                       │ Service       │
                                       └───────────────┘
```

---

## Request-Response Flow Example

### Purchase Flow (Detailed)

```
FRONTEND                     BACKEND                          EXTERNAL
────────                     ───────                          ────────

    │                            │                                │
    │  POST /initiate-purchase   │                                │
    │  { package_id: 2 }         │                                │
    │ ──────────────────────────▶│                                │
    │                            │                                │
    │                            │ 1. Auth Middleware             │
    │                            │    - Extract JWT               │
    │                            │    - Validate token            │
    │                            │    - Attach user to request    │
    │                            │                                │
    │                            │ 2. Permission Middleware       │
    │                            │    - Check 'credits.purchase'  │
    │                            │                                │
    │                            │ 3. Validation Middleware       │
    │                            │    - Validate DTO              │
    │                            │                                │
    │                            │ 4. Controller                  │
    │                            │    - Get package details       │
    │                            │    - Calculate price           │
    │                            │    - Check canPurchase         │
    │                            │                                │
    │                            │ 5. Razorpay Integration        │
    │                            │ ──────────────────────────────▶│
    │                            │    razorpay.orders.create()    │
    │                            │ ◀──────────────────────────────│
    │                            │    { order_id, amount, ... }   │
    │                            │                                │
    │  { order_id, key_id,       │                                │
    │    amount, credits }       │                                │
    │ ◀──────────────────────────│                                │
    │                            │                                │
    │  (User completes payment   │                                │
    │   on Razorpay checkout)    │                                │
    │                            │                                │
    │  POST /verify-payment      │                                │
    │  { payment_id, order_id,   │                                │
    │    signature }             │                                │
    │ ──────────────────────────▶│                                │
    │                            │                                │
    │                            │ 6. Verify Signature            │
    │                            │    - HMAC SHA256 validation    │
    │                            │                                │
    │                            │ 7. Add Credits (Transaction)   │
    │                            │    - BEGIN TRANSACTION         │
    │                            │    - SELECT ... FOR UPDATE     │
    │                            │    - UPDATE balance            │
    │                            │    - INSERT transaction log    │
    │                            │    - COMMIT                    │
    │                            │                                │
    │  { credits_balance: 25,    │                                │
    │    credits_added: 10 }     │                                │
    │ ◀──────────────────────────│                                │
    │                            │                                │
```

---

## Database Connection

### Knex Configuration

```typescript
// Connection pooling
const DB = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false }
  }
});
```

### Transaction Pattern

```typescript
// Row-level locking for atomic operations
await DB.transaction(async (trx) => {
  const profile = await trx('freelancer_profiles')
    .where({ user_id })
    .select('credits_balance')
    .forUpdate()  // Lock row
    .first();

  // Update balance
  await trx('freelancer_profiles')
    .where({ user_id })
    .update({ credits_balance: newBalance });

  // Log transaction
  await trx('credit_transactions').insert({ ... });
});
```

---

## File Imports Pattern

```typescript
// Barrel exports for clean imports
// ❌ Avoid
import { CreditsService } from '../services/credits.service';
import { CreditLoggerService } from '../services/credit-logger.service';

// ✅ Preferred
import { CreditsService, CreditLoggerService } from '../services';
```

---

## Error Propagation

```
Service throws HttpException
         │
         ▼
Controller catches (optional transform)
         │
         ▼
Express error middleware
         │
         ▼
Formatted JSON response to client
```
