# Credit Management System - Overview

> **Last Updated**: December 2024  
> **Version**: 1.0

---

## What is the Credit System?

The Credit Management System is a monetization feature that allows freelancers (Videographers and Video Editors) to purchase credits and use them to apply for projects on the MMV Freelance platform.

**One Credit = One Application**

When a freelancer wants to apply for a project posted by a client, they must spend 1 credit from their balance. This creates a sustainable business model while ensuring quality applications.

---

## Who Uses It?

| User Type    | Can Purchase | Can Spend | Can View Balance | Admin Access |
| ------------ | ------------ | --------- | ---------------- | ------------ |
| Videographer | ✅           | ✅        | ✅               | ❌           |
| Video Editor | ✅           | ✅        | ✅               | ❌           |
| Client       | ❌           | ❌        | ❌               | ❌           |
| Admin        | ❌           | ❌        | ✅ (All Users)   | ✅           |

---

## Core Concepts

### 1. Credits

A virtual currency unit used within the platform. Credits are:

- Purchased with real money (INR via Razorpay)
- Non-transferable between users
- Used to apply for projects (1 credit per application)
- Refundable under certain conditions

### 2. Credit Balance

Every freelancer has a credit balance consisting of:

- **credits_balance**: Current available credits
- **total_credits_purchased**: Lifetime credits bought
- **credits_used**: Total credits spent on applications

### 3. Credit Packages

Pre-defined bundles offering discounts on bulk purchases:

| Package    | Credits | Price (INR) | Savings |
| ---------- | ------- | ----------- | ------- |
| Starter    | 10      | ₹500        | -       |
| Basic      | 25      | ₹1,125      | 10%     |
| Pro        | 50      | ₹2,000      | 20%     |
| Enterprise | 100     | ₹3,500      | 30%     |

_Note: Prices are calculated dynamically based on admin-configured price per credit._

### 4. Transactions

Every credit operation is logged as a transaction for audit purposes:

- **purchase**: Credits bought
- **deduction**: Credits spent on application
- **refund**: Credits returned
- **admin_add**: Admin added credits
- **admin_deduct**: Admin removed credits

### 5. Price Per Credit

The base price for a single credit (default: ₹50). This value is:

- Stored in the database
- Configurable by admins
- Used to calculate all package prices dynamically

---

## Business Rules

### Purchase Limits

| Rule                    | Value         |
| ----------------------- | ------------- |
| Minimum purchase        | 1 credit      |
| Maximum single purchase | 200 credits   |
| Maximum balance         | 1,000 credits |

### Application Cost

- Each project application costs **1 credit**
- Credits are deducted **before** the application is created
- If application fails to create, credits are refunded

### Refund Policy

Credits may be refunded when:

- Project is cancelled by the client
- Application is withdrawn within 24 hours
- Admin grants manual refund

Credits are **NOT** refunded when:

- Freelancer is rejected by client
- Project is completed
- Application older than 24 hours is withdrawn

---

## Feature List

### For Freelancers

| Feature                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| View Balance             | See current credits, total purchased, and used |
| Purchase Credits         | Buy individual credits or packages             |
| View History             | See all credit transactions with filters       |
| Check Refund Eligibility | Verify if an application qualifies for refund  |
| View Refunds             | List of all received refunds                   |

### For Admins

| Feature               | Description                                 |
| --------------------- | ------------------------------------------- |
| View All Transactions | Browse all user transactions                |
| Adjust Credits        | Add or deduct credits from any user         |
| View Analytics        | System-wide credit statistics               |
| View User Credits     | Detailed credit info for specific user      |
| Bulk Refund           | Refund all applicants for cancelled project |
| Export Transactions   | Download CSV of transactions                |
| Manage Settings       | Update price per credit                     |

---

## System Highlights

### ✅ Atomic Transactions

All credit operations use database transactions with row-level locking to prevent race conditions and double-spending.

### ✅ Complete Audit Trail

Every credit movement is logged with:

- Timestamp
- User ID
- Amount & balance changes
- Reference to trigger (payment, application, admin action)
- IP address and user agent

### ✅ Dynamic Pricing

Price per credit is stored in database and can be updated by admin without code deployment.

### ✅ Razorpay Integration

Secure payment processing with:

- Order creation on backend
- Checkout on frontend
- Payment verification with signature validation

### ✅ RBAC Security

Role-based access control with granular permissions:

- `credits.view_own` - View own balance
- `credits.purchase` - Purchase credits
- `credits.view_history` - View transaction history
- `credits.admin.*` - Admin operations

---

## Quick Links

| Document                                       | Description                         |
| ---------------------------------------------- | ----------------------------------- |
| [System Design](./02_SYSTEM_DESIGN.md)         | Design decisions and constraints    |
| [Architecture](./03_ARCHITECTURE.md)           | Technical architecture and diagrams |
| [Database Schema](./04_DATABASE_SCHEMA.md)     | Tables and relationships            |
| [User Flows](./05_USER_FLOWS.md)               | Step-by-step user journeys          |
| [API Reference](./06_API_REFERENCE.md)         | User endpoint documentation         |
| [Admin API](./07_ADMIN_API_REFERENCE.md)       | Admin endpoint documentation        |
| [Frontend Guide](./08_FRONTEND_INTEGRATION.md) | Frontend integration guide          |
| [Payment Guide](./09_PAYMENT_INTEGRATION.md)   | Razorpay integration                |
| [Security](./10_SECURITY.md)                   | Security and access control         |
| [Error Handling](./11_ERROR_HANDLING.md)       | Errors and troubleshooting          |
| [Testing](./12_TESTING_GUIDE.md)               | Testing instructions                |
