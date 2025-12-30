# Credit Management System - Error Handling

> **Last Updated**: December 2024

---

## Overview

This document lists all error codes, their meanings, and recommended handling.

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

---

## HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Validation error, business rule violation |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Business Error Codes

### Credit Balance Errors

| Code | HTTP | Message | Cause | Frontend Action |
|------|------|---------|-------|-----------------|
| `INSUFFICIENT_CREDITS` | 400 | Not enough credits to complete this action | Balance < required | Show buy credits modal |
| `MAX_BALANCE_EXCEEDED` | 400 | Would exceed maximum balance of 1000 | Purchase would put balance over 1000 | Show current balance, suggest smaller purchase |
| `PROFILE_NOT_FOUND` | 404 | Freelancer profile not found | User doesn't have freelancer profile | Redirect to profile setup |

### Purchase Errors

| Code | HTTP | Message | Cause | Frontend Action |
|------|------|---------|-------|-----------------|
| `INVALID_PACKAGE` | 400 | Invalid package ID | Package ID not 1-4 | Refresh packages list |
| `INVALID_AMOUNT` | 400 | Credits amount must be between 1 and 200 | Out of range | Show valid range |
| `PURCHASE_RATE_LIMITED` | 429 | Too many purchase attempts | Exceeded rate limit | Show cooldown timer |

### Payment Errors

| Code | HTTP | Message | Cause | Frontend Action |
|------|------|---------|-------|-----------------|
| `INVALID_SIGNATURE` | 400 | Payment verification failed | Signature mismatch | Contact support |
| `PAYMENT_ALREADY_PROCESSED` | 400 | This payment was already processed | Duplicate request | Show existing balance |
| `ORDER_NOT_FOUND` | 400 | Order not found | Invalid order_id | Restart purchase flow |
| `PAYMENT_FAILED` | 400 | Payment was not successful | Razorpay payment failed | Retry payment |

### Refund Errors

| Code | HTTP | Message | Cause | Frontend Action |
|------|------|---------|-------|-----------------|
| `REFUND_NOT_ELIGIBLE` | 400 | Application is not eligible for refund | Doesn't meet criteria | Show reason |
| `ALREADY_REFUNDED` | 400 | This application was already refunded | Duplicate request | No action needed |
| `APPLICATION_TOO_OLD` | 400 | Application is older than 24 hours | Past refund window | Inform user of policy |

### Admin Errors

| Code | HTTP | Message | Cause | Frontend Action |
|------|------|---------|-------|-----------------|
| `NEGATIVE_BALANCE` | 400 | Adjustment would result in negative balance | Deduction > balance | Show current balance |
| `USER_NOT_FOUND` | 404 | User not found | Invalid user_id | Verify user ID |
| `INVALID_ADJUSTMENT` | 400 | Amount must be a non-zero integer | amount = 0 or non-integer | Fix input |

---

## Authentication Errors

| Code | HTTP | Message | Cause | Frontend Action |
|------|------|---------|-------|-----------------|
| - | 401 | Authentication token missing | No Authorization header | Redirect to login |
| - | 401 | Invalid authentication token | Expired or malformed JWT | Refresh token or login |
| - | 403 | Insufficient permissions | User lacks required permission | Show access denied |

---

## Validation Errors

Validation errors return details about which fields failed:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "credits_amount",
      "message": "must be a positive integer"
    },
    {
      "field": "package_id",
      "message": "must be between 1 and 4"
    }
  ]
}
```

---

## Error Handling Examples

### Frontend (React/TypeScript)

```typescript
import { toast } from 'react-toastify';

interface APIError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

const handleCreditError = (error: any, router: any) => {
  const apiError: APIError = error.response?.data;
  
  switch (apiError?.code) {
    case 'INSUFFICIENT_CREDITS':
      // Show purchase modal
      showModal({
        title: 'Not Enough Credits',
        message: `You need more credits. Current balance: ${apiError.details?.available || 0}`,
        actions: [
          { label: 'Buy Credits', onClick: () => router.push('/credits/buy') },
          { label: 'Cancel', onClick: () => {} }
        ]
      });
      break;
      
    case 'MAX_BALANCE_EXCEEDED':
      toast.warning(`Maximum balance is 1000. Current: ${apiError.details?.current || 0}`);
      break;
      
    case 'PAYMENT_ALREADY_PROCESSED':
      toast.info('Payment already processed. Refreshing balance...');
      refreshBalance();
      break;
      
    case 'INVALID_SIGNATURE':
      toast.error('Payment verification failed. Please contact support.');
      break;
      
    default:
      // Generic error handling
      toast.error(apiError?.message || 'Something went wrong');
  }
};

// Usage
try {
  await creditsService.initiatePurchase(packageId);
} catch (error) {
  handleCreditError(error, router);
}
```

### Error Boundary

```tsx
// components/CreditErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CreditErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Credit component error:', error, info);
    // Report to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800">Something went wrong</h3>
          <p className="text-red-600">Unable to load credit information.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-700 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Troubleshooting Guide

### "Insufficient Credits" but I just purchased

**Possible Causes:**
1. Payment verification failed silently
2. Browser cache showing old balance

**Solutions:**
1. Check transaction history for the purchase
2. Hard refresh the page (Ctrl+Shift+R)
3. Check payment status in Razorpay dashboard
4. Contact support with payment ID

---

### "Invalid Signature" on payment verification

**Possible Causes:**
1. Order expired (order_id older than 30 minutes)
2. Mismatch between test/live modes
3. Wrong API secret in environment

**Solutions:**
1. Start a new purchase (don't reuse old order_id)
2. Ensure frontend and backend use same mode (test/live)
3. Verify RAZORPAY_KEY_SECRET in environment

---

### "Too Many Requests" (429)

**Cause:** Rate limit exceeded

**Solutions:**
1. Wait for the cooldown period (shown in response)
2. Reduce request frequency
3. Cache balance instead of fetching repeatedly

---

### "Freelancer Profile Not Found"

**Cause:** User registered but profile not created

**Solutions:**
1. Complete freelancer profile registration
2. Check user role is VIDEOGRAPHER or VIDEO_EDITOR
3. Admin: Create profile for user

---

### Credits deducted but application failed

**Possible Causes:**
1. Network error after deduction
2. Application service error

**Solutions:**
1. Credits should be auto-refunded on failure (check history)
2. Contact support with timestamps
3. Admin can manually refund if needed

---

## Logging Errors

### What We Log

```typescript
{
  timestamp: '2024-12-19T10:30:00Z',
  level: 'error',
  message: 'Credit operation failed',
  userId: 42,
  operation: 'deductCredits',
  error: {
    code: 'INSUFFICIENT_CREDITS',
    requested: 1,
    available: 0
  },
  requestId: 'req-abc123',
  ip: '192.168.1.1'
}
```

### What We DON'T Log

- Full credit card numbers (never on our server)
- CVV codes
- User passwords
- Full API keys
- Stack traces in production responses

---

## Support Information

For issues not resolved by this guide:

1. **Frontend Issues**: Check browser console for errors
2. **API Issues**: Note the request ID from error response
3. **Payment Issues**: Note the Razorpay order_id and payment_id

Contact support with:
- User email
- Timestamp of issue
- Error message/code
- Steps to reproduce
