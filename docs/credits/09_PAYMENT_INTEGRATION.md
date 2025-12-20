# Credit Management System - Payment Integration (Razorpay)

> **Last Updated**: December 2024

---

## Overview

The Credit system uses Razorpay for payment processing. This guide covers the integration from both backend and frontend perspectives.

---

## Prerequisites

1. Razorpay account (test or live)
2. API Key ID and Secret from Razorpay Dashboard
3. SSL certificate for production (Razorpay requires HTTPS)

---

## Environment Setup

### Environment Variables

```env
# .env file

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# For production
# RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
# RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

### Backend Configuration

```typescript
// src/utils/payment/razor.util.ts
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

---

## Payment Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                         RAZORPAY PAYMENT FLOW                           │
└────────────────────────────────────────────────────────────────────────┘

    FRONTEND                    BACKEND                     RAZORPAY
    ────────                    ───────                     ────────
        │                          │                           │
        │ 1. User clicks "Buy"     │                           │
        │                          │                           │
        │ 2. POST /initiate-       │                           │
        │    purchase              │                           │
        │ ─────────────────────────▶                           │
        │                          │                           │
        │                          │ 3. Calculate amount       │
        │                          │                           │
        │                          │ 4. orders.create()        │
        │                          │ ──────────────────────────▶
        │                          │                           │
        │                          │ 5. Return order_id        │
        │                          │ ◀──────────────────────────
        │                          │                           │
        │ 6. Return order details  │                           │
        │ ◀─────────────────────────                           │
        │                          │                           │
        │ 7. Open Razorpay         │                           │
        │    Checkout              │                           │
        │ ─────────────────────────────────────────────────────▶
        │                          │                           │
        │ 8. User enters card      │                           │
        │    and pays              │                           │
        │                          │                           │
        │ 9. Payment success       │                           │
        │    callback              │                           │
        │ ◀─────────────────────────────────────────────────────
        │                          │                           │
        │ 10. POST /verify-payment │                           │
        │     (with signature)     │                           │
        │ ─────────────────────────▶                           │
        │                          │                           │
        │                          │ 11. Verify signature      │
        │                          │     (HMAC SHA256)         │
        │                          │                           │
        │                          │ 12. Add credits to user   │
        │                          │                           │
        │ 13. Return success       │                           │
        │ ◀─────────────────────────                           │
        │                          │                           │
        │ 14. Show confirmation    │                           │
        │                          │                           │
```

---

## Backend Implementation

### 1. Create Order

```typescript
// CreditsController.initiatePurchase

public initiatePurchase = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.user_id;
    const { credits_amount, package_id } = req.body;

    // Determine credits and calculate price
    let credits: number;
    let amount: number;
    let packageName: string | undefined;

    if (package_id) {
      const pkg = CREDIT_PACKAGES.find(p => p.id === package_id);
      if (!pkg) throw new HttpException(400, "Invalid package ID");
      credits = pkg.credits;
      const priceInfo = await this.creditsService.calculatePrice(credits);
      amount = Math.round(priceInfo.price * 100); // Convert to paise
      packageName = pkg.name;
    } else {
      credits = credits_amount;
      const priceInfo = await this.creditsService.calculatePrice(credits);
      amount = Math.round(priceInfo.price * 100);
    }

    // Validate purchase limits
    const canPurchaseResult = await this.creditsService.canPurchase(user_id, credits);
    if (!canPurchaseResult.canPurchase) {
      throw new HttpException(400, canPurchaseResult.reason!);
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `credits_${user_id}_${Date.now()}`,
      notes: {
        user_id: user_id.toString(),
        credits: credits.toString(),
        package_id: package_id?.toString() || '',
        package_name: packageName || '',
      },
    });

    // Get user info for prefill
    const user = await DB('users').where({ user_id }).first();

    res.status(200).json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        credits: credits,
        package_name: packageName,
        key_id: process.env.RAZORPAY_KEY_ID,
        user: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        },
      },
      message: "Order created successfully. Complete payment to receive credits.",
    });
  } catch (error) {
    next(error);
  }
};
```

### 2. Verify Payment

```typescript
// CreditsController.verifyPayment

import crypto from 'crypto';

public verifyPayment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.user_id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    // Verify signature
    if (expectedSignature !== razorpay_signature) {
      throw new HttpException(400, "Payment verification failed: Invalid signature");
    }

    // Check if payment already processed (idempotency)
    const existingTx = await DB('credit_transactions')
      .where({ payment_transaction_id: razorpay_payment_id })
      .first();

    if (existingTx) {
      throw new HttpException(400, "This payment has already been processed");
    }

    // Get order details from Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const credits = parseInt(order.notes.credits);
    const packageId = order.notes.package_id ? parseInt(order.notes.package_id) : undefined;
    const packageName = order.notes.package_name || undefined;

    // Add credits to user (with logging)
    const result = await this.creditsService.addCredits(user_id, credits, razorpay_payment_id);

    // Log the purchase transaction with payment details
    await this.logPurchaseTransaction(user_id, credits, {
      payment_gateway: 'razorpay',
      payment_order_id: razorpay_order_id,
      payment_transaction_id: razorpay_payment_id,
      payment_amount: order.amount / 100, // Convert paise to INR
      package_id: packageId,
      package_name: packageName,
    });

    res.status(200).json({
      success: true,
      data: {
        credits_added: credits,
        credits_balance: result.credits_balance,
        transaction_id: razorpay_payment_id,
      },
      message: `Payment verified. ${credits} credits added to your account.`,
    });
  } catch (error) {
    next(error);
  }
};
```

---

## Frontend Implementation

### 1. Load Razorpay SDK

```html
<!-- In your HTML head -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

Or load dynamically:

```typescript
const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

### 2. Open Checkout

```typescript
const handlePurchase = async (packageId: number) => {
  // 1. Create order on backend
  const response = await fetch('/api/v1/credits/initiate-purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ package_id: packageId }),
  });
  
  const { data } = await response.json();

  // 2. Configure Razorpay options
  const options = {
    key: data.key_id,
    amount: data.amount, // in paise
    currency: data.currency,
    name: 'MMV Freelance',
    description: `Purchase ${data.credits} Credits`,
    image: '/logo.png', // optional
    order_id: data.order_id,
    prefill: {
      name: data.user.name,
      email: data.user.email,
    },
    notes: {
      credits: data.credits,
    },
    theme: {
      color: '#4F46E5', // Brand color
    },
    handler: async (response: RazorpayResponse) => {
      // 3. Payment successful - verify on backend
      await verifyPayment(response);
    },
    modal: {
      ondismiss: () => {
        console.log('Payment cancelled');
      },
    },
  };

  // 4. Open checkout
  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const verifyPayment = async (paymentData: RazorpayResponse) => {
  const response = await fetch('/api/v1/credits/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`Success! ${result.data.credits_added} credits added.`);
    // Refresh balance
  } else {
    alert('Payment verification failed: ' + result.message);
  }
};
```

---

## Test Mode

### Test Card Numbers

| Card Number | Description |
|-------------|-------------|
| 4111 1111 1111 1111 | Successful payment |
| 5267 3181 8797 5449 | Mastercard success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |

### Test UPI IDs

| UPI ID | Result |
|--------|--------|
| success@razorpay | Success |
| failure@razorpay | Failure |

### Test Credentials

```
Any future expiry date: 12/25
Any CVV: 123
OTP: 1234 (for 3D Secure)
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `BAD_REQUEST_ERROR` | Invalid parameters | Check request body |
| `GATEWAY_ERROR` | Razorpay issue | Retry later |
| `PAYMENT_CANCELLED` | User closed checkout | No action needed |
| `NETWORK_ERROR` | Connection issue | Show retry option |

### Frontend Error Handling

```typescript
const options = {
  // ... other options
  handler: async (response) => {
    try {
      await verifyPayment(response);
    } catch (error) {
      showError('Payment verification failed. Please contact support.');
      // Log error for debugging
      console.error('Verification error:', error);
    }
  },
  modal: {
    ondismiss: () => {
      showMessage('Payment cancelled. You can try again anytime.');
    },
  },
};

// Handle Razorpay errors
razorpay.on('payment.failed', (response: any) => {
  const error = response.error;
  showError(`Payment failed: ${error.description}`);
  console.error('Payment failed:', error);
});
```

---

## Security Best Practices

### 1. Never Trust Client Data

Always fetch order details from Razorpay:

```typescript
// ❌ Don't trust client-sent credits amount
const credits = req.body.credits; 

// ✅ Get from order notes (set by you when creating order)
const order = await razorpay.orders.fetch(razorpay_order_id);
const credits = parseInt(order.notes.credits);
```

### 2. Verify Signature

Always verify the payment signature before crediting:

```typescript
const isValid = verifySignature(order_id, payment_id, signature);
if (!isValid) {
  throw new Error('Invalid signature');
}
```

### 3. Idempotent Processing

Prevent double-crediting:

```typescript
const existing = await DB('credit_transactions')
  .where({ payment_transaction_id })
  .first();

if (existing) {
  throw new Error('Already processed');
}
```

### 4. HTTPS Only

Razorpay requires HTTPS in production. Ensure your server has a valid SSL certificate.

---

## Webhooks (Optional)

For async payment confirmation, set up webhooks:

### Webhook Endpoint

```typescript
// POST /api/v1/webhooks/razorpay
app.post('/webhooks/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
    
  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  const event = req.body.event;
  const payload = req.body.payload;
  
  switch (event) {
    case 'payment.captured':
      // Handle successful payment
      await processPayment(payload.payment.entity);
      break;
    case 'payment.failed':
      // Log failed payment
      console.log('Payment failed:', payload.payment.entity);
      break;
  }
  
  res.json({ status: 'ok' });
});
```

### Configure in Razorpay Dashboard

1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/v1/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret to `.env`
