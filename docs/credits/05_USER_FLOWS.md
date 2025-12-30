# Credit Management System - User Flows

> **Last Updated**: December 2024

---

## Overview

This document describes step-by-step user journeys for all credit-related operations.

---

## 1. Purchase Credits Flow

### User Story
> As a freelancer, I want to purchase credits so that I can apply for projects.

### Prerequisites
- User is logged in as Videographer or Video Editor
- User has access to a payment method

### Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         CREDIT PURCHASE FLOW                               │
└───────────────────────────────────────────────────────────────────────────┘

    USER                           FRONTEND                         BACKEND
    ────                           ────────                         ───────
      │                               │                                │
      │  1. Click "Buy Credits"       │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  2. GET /credits/packages      │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │  3. Return package list        │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  4. Display packages          │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
      │  5. Select package (e.g. Pro) │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  6. POST /credits/initiate-    │
      │                               │     purchase { package_id: 3 } │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  7. Validate
      │                               │                                │  8. Check canPurchase
      │                               │                                │  9. Create Razorpay order
      │                               │                                │
      │                               │  10. Return order details      │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  11. Open Razorpay Checkout   │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
      │  12. Enter payment details    │                                │
      │  13. Complete payment         │                                │
      │                               │                                │
      │  14. Payment success callback │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  15. POST /credits/verify-     │
      │                               │      payment { payment_id,     │
      │                               │      order_id, signature }     │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  16. Verify signature
      │                               │                                │  17. Add credits
      │                               │                                │  18. Log transaction
      │                               │                                │
      │                               │  19. Return new balance        │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  20. Show success message     │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
```

### API Calls Sequence

| Step | Method | Endpoint | Payload |
|------|--------|----------|---------|
| 2 | GET | `/credits/packages` | - |
| 6 | POST | `/credits/initiate-purchase` | `{ package_id: 3 }` |
| 15 | POST | `/credits/verify-payment` | `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` |

---

## 2. Apply to Project Flow

### User Story
> As a freelancer, I want to apply to a project using my credits.

### Prerequisites
- User has at least 1 credit in balance
- Project is open for applications

### Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        PROJECT APPLICATION FLOW                            │
└───────────────────────────────────────────────────────────────────────────┘

    USER                           FRONTEND                         BACKEND
    ────                           ────────                         ───────
      │                               │                                │
      │  1. View project details      │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │  2. Click "Apply Now"         │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  3. GET /credits/balance       │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │  4. Return { balance: 5 }      │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  5. Show confirmation         │                                │
      │     "Apply for 1 credit?"     │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
      │  6. Confirm application       │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  7. POST /applied-projects     │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  8. Check balance >= 1
      │                               │                                │  9. Deduct 1 credit
      │                               │                                │ 10. Create application
      │                               │                                │ 11. Log transaction
      │                               │                                │
      │                               │  12. Return application        │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  13. Show success             │                                │
      │      "Applied! Balance: 4"    │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
```

### Error Flow (Insufficient Credits)

```
      │                               │                                │
      │                               │  7. POST /applied-projects     │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  8. Check balance >= 1
      │                               │                                │     FAIL: balance = 0
      │                               │                                │
      │                               │  9. Return 400 Error           │
      │                               │     { code: 'INSUFFICIENT_     │
      │                               │       CREDITS' }               │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  10. Show error message       │                                │
      │      "Not enough credits"     │                                │
      │  11. Show "Buy Credits" link  │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
```

---

## 3. View Balance Flow

### User Story
> As a freelancer, I want to see my credit balance.

### Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          VIEW BALANCE FLOW                                 │
└───────────────────────────────────────────────────────────────────────────┘

    USER                           FRONTEND                         BACKEND
    ────                           ────────                         ───────
      │                               │                                │
      │  1. Navigate to Credits page  │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  2. GET /credits/balance       │
      │                               │     Authorization: Bearer xxx  │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  3. Get user from JWT
      │                               │                                │  4. Query profile
      │                               │                                │
      │                               │  5. Return balance data        │
      │                               │     { credits_balance: 25,     │
      │                               │       total_purchased: 50,     │
      │                               │       credits_used: 25 }       │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  6. Display:                  │                                │
      │     Current: 25 credits       │                                │
      │     Used: 25 credits          │                                │
      │     Purchased: 50 credits     │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
```

---

## 4. View Transaction History Flow

### User Story
> As a freelancer, I want to see my credit transaction history.

### Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       VIEW HISTORY FLOW                                    │
└───────────────────────────────────────────────────────────────────────────┘

    USER                           FRONTEND                         BACKEND
    ────                           ────────                         ───────
      │                               │                                │
      │  1. Click "History" tab       │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  2. GET /credits/history       │
      │                               │     ?page=1&limit=10           │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │  3. Return transactions        │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  4. Display table:            │                                │
      │     | Date | Type | Amount |  │                                │
      │     |------|------|--------|  │                                │
      │     | Dec 19 | Purchase | +25│ │                               │
      │     | Dec 18 | Used | -1    | │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
      │  5. Click "Next Page"         │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  6. GET /credits/history       │
      │                               │     ?page=2&limit=10           │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
```

### Filter by Type

```
      │  7. Select filter: "Purchases"│                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  8. GET /credits/history       │
      │                               │     ?type=purchase             │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
```

---

## 5. Request Refund Flow

### User Story
> As a freelancer, I want to get a refund for my withdrawn application.

### Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          REFUND FLOW                                       │
└───────────────────────────────────────────────────────────────────────────┘

    USER                           FRONTEND                         BACKEND
    ────                           ────────                         ───────
      │                               │                                │
      │  1. View "My Applications"    │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │  2. Click "Withdraw" on app   │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  3. GET /credits/refund-       │
      │                               │     eligibility/:app_id        │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  4. Check:
      │                               │                                │     - App exists?
      │                               │                                │     - User owns it?
      │                               │                                │     - < 24 hours old?
      │                               │                                │     - Credit deducted?
      │                               │                                │     - Not refunded yet?
      │                               │                                │
      │                               │  5. Return eligibility         │
      │                               │     { eligible: true,          │
      │                               │       reason: null }           │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  6. Show confirmation         │                                │
      │     "Withdraw and get refund?"│                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
      │  7. Confirm withdrawal        │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  8. POST /applied-projects/    │
      │                               │     :app_id/withdraw           │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  9. Check eligibility
      │                               │                                │ 10. Refund credit
      │                               │                                │ 11. Update application
      │                               │                                │ 12. Log transaction
      │                               │                                │
      │                               │  13. Return success            │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  14. Show "Refunded!"         │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
```

### Ineligible for Refund

```
      │                               │  5. Return eligibility         │
      │                               │     { eligible: false,         │
      │                               │       reason: 'Application     │
      │                               │       older than 24 hours' }   │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  6. Show message              │                                │
      │     "Cannot refund"           │                                │
      │ ◀─────────────────────────────│                                │
```

---

## 6. Admin: Adjust Credits Flow

### User Story
> As an admin, I want to manually add or deduct credits from a user.

### Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       ADMIN ADJUST CREDITS FLOW                            │
└───────────────────────────────────────────────────────────────────────────┘

    ADMIN                          FRONTEND                         BACKEND
    ─────                          ────────                         ───────
      │                               │                                │
      │  1. Search for user           │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  2. GET /admin/credits/        │
      │                               │     user/:user_id              │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │  3. Return user credit info    │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  4. View user details         │                                │
      │     Balance: 25 credits       │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
      │  5. Enter adjustment          │                                │
      │     Amount: +10               │                                │
      │     Reason: "Compensation"    │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  6. POST /admin/credits/adjust │
      │                               │     { user_id, amount: 10,     │
      │                               │       reason: "Compensation" } │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  7. Validate
      │                               │                                │  8. Add credits
      │                               │                                │  9. Log with admin_id
      │                               │                                │
      │                               │  10. Return result             │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  11. Show "Added 10 credits"  │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
```

---

## 7. Admin: Update Pricing Flow

### User Story
> As an admin, I want to change the price per credit.

### Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       ADMIN UPDATE PRICING FLOW                            │
└───────────────────────────────────────────────────────────────────────────┘

    ADMIN                          FRONTEND                         BACKEND
    ─────                          ────────                         ───────
      │                               │                                │
      │  1. Go to Settings            │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  2. GET /admin/credits/settings│
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │  3. Return current settings    │
      │                               │     { price_per_credit: 50 }   │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  4. Display current price     │                                │
      │     Price: ₹50 per credit     │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │
      │  5. Change to ₹60             │                                │
      │ ─────────────────────────────▶│                                │
      │                               │                                │
      │                               │  6. PUT /admin/credits/settings│
      │                               │     { price_per_credit: 60 }   │
      │                               │ ──────────────────────────────▶│
      │                               │                                │
      │                               │                                │  7. Update DB
      │                               │                                │  8. Log change
      │                               │                                │
      │                               │  9. Return success             │
      │                               │ ◀──────────────────────────────│
      │                               │                                │
      │  10. Show "Price updated"     │                                │
      │ ◀─────────────────────────────│                                │
      │                               │                                │


Note: All package prices will automatically reflect the new pricing
when users call GET /credits/packages
```
