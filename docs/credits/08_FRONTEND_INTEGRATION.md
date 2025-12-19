# Credit Management System - Frontend Integration Guide

> **Last Updated**: December 2024

---

## Overview

This guide helps frontend developers integrate the Credit Management System into their applications.

---

## Prerequisites

1. JWT authentication implemented
2. API client configured with base URL
3. Razorpay JS SDK loaded (for payments)

---

## Setup

### 1. API Client Configuration

```typescript
// api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or from context/cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 2. TypeScript Interfaces

```typescript
// types/credits.ts

export interface CreditBalance {
  credits_balance: number;
  total_credits_purchased: number;
  credits_used: number;
}

export interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  description?: string;
  savings_percent?: number;
  popular?: boolean;
}

export interface PackagesResponse {
  packages: CreditPackage[];
  pricePerCredit: number;
  currency: string;
  limits: {
    minPurchase: number;
    maxPurchase: number;
    maxBalance: number;
  };
}

export interface CreditTransaction {
  transaction_id: number;
  transaction_type: 'purchase' | 'deduction' | 'refund' | 'admin_add' | 'admin_deduct';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  payment_amount?: number;
  created_at: string;
}

export interface InitiatePurchaseResponse {
  order_id: string;
  amount: number;
  currency: string;
  credits: number;
  package_name?: string;
  key_id: string;
  user: {
    name: string;
    email: string;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 3. API Service

```typescript
// services/creditsService.ts
import apiClient from '../api/client';
import { 
  CreditBalance, 
  PackagesResponse, 
  InitiatePurchaseResponse,
  CreditTransaction,
  Pagination 
} from '../types/credits';

export const creditsService = {
  // Get current balance
  async getBalance(): Promise<CreditBalance> {
    const response = await apiClient.get('/credits/balance');
    return response.data.data;
  },

  // Get available packages
  async getPackages(): Promise<PackagesResponse> {
    const response = await apiClient.get('/credits/packages');
    return response.data.data;
  },

  // Initiate purchase by package
  async initiatePurchaseByPackage(packageId: number): Promise<InitiatePurchaseResponse> {
    const response = await apiClient.post('/credits/initiate-purchase', {
      package_id: packageId
    });
    return response.data.data;
  },

  // Initiate purchase by amount
  async initiatePurchaseByAmount(credits: number): Promise<InitiatePurchaseResponse> {
    const response = await apiClient.post('/credits/initiate-purchase', {
      credits_amount: credits
    });
    return response.data.data;
  },

  // Verify payment
  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ credits_added: number; credits_balance: number }> {
    const response = await apiClient.post('/credits/verify-payment', paymentData);
    return response.data.data;
  },

  // Get transaction history
  async getHistory(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ transactions: CreditTransaction[]; pagination: Pagination }> {
    const response = await apiClient.get('/credits/history', { params });
    return response.data.data;
  },

  // Check refund eligibility
  async checkRefundEligibility(applicationId: number): Promise<{
    eligible: boolean;
    reason?: string;
    credits_to_refund: number;
  }> {
    const response = await apiClient.get(`/credits/refund-eligibility/${applicationId}`);
    return response.data.data;
  }
};
```

---

## Components

### 1. Credit Balance Display

```tsx
// components/CreditBalance.tsx
import React, { useEffect, useState } from 'react';
import { creditsService } from '../services/creditsService';
import { CreditBalance } from '../types/credits';

export const CreditBalanceCard: React.FC = () => {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const data = await creditsService.getBalance();
      setBalance(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!balance) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900">Your Credits</h3>
      
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-bold text-indigo-600">
          {balance.credits_balance}
        </span>
        <span className="ml-2 text-gray-500">credits available</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Total Purchased</span>
          <p className="font-medium">{balance.total_credits_purchased}</p>
        </div>
        <div>
          <span className="text-gray-500">Total Used</span>
          <p className="font-medium">{balance.credits_used}</p>
        </div>
      </div>
    </div>
  );
};
```

### 2. Package Selector

```tsx
// components/PackageSelector.tsx
import React, { useEffect, useState } from 'react';
import { creditsService } from '../services/creditsService';
import { CreditPackage, PackagesResponse } from '../types/credits';

interface Props {
  onSelect: (pkg: CreditPackage) => void;
}

export const PackageSelector: React.FC<Props> = ({ onSelect }) => {
  const [data, setData] = useState<PackagesResponse | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    creditsService.getPackages().then(setData);
  }, []);

  if (!data) return <div>Loading packages...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.packages.map((pkg) => (
        <div
          key={pkg.id}
          onClick={() => {
            setSelected(pkg.id);
            onSelect(pkg);
          }}
          className={`
            relative p-6 rounded-lg border-2 cursor-pointer transition-all
            ${selected === pkg.id 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          {pkg.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
              Popular
            </span>
          )}
          
          <h3 className="text-lg font-semibold">{pkg.name}</h3>
          <p className="text-3xl font-bold mt-2">
            {pkg.credits} <span className="text-sm font-normal">credits</span>
          </p>
          <p className="text-xl text-gray-700 mt-1">₹{pkg.price}</p>
          
          {pkg.savings_percent && (
            <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Save {pkg.savings_percent}%
            </span>
          )}
          
          <p className="text-sm text-gray-500 mt-2">{pkg.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### 3. Purchase Flow with Razorpay

```tsx
// components/PurchaseCredits.tsx
import React, { useState } from 'react';
import { creditsService } from '../services/creditsService';
import { PackageSelector } from './PackageSelector';
import { CreditPackage } from '../types/credits';

// Load Razorpay script
const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
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

export const PurchaseCredits: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError('Please select a package');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order
      const orderData = await creditsService.initiatePurchaseByPackage(selectedPackage.id);

      // Configure Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MMV Freelance',
        description: `Purchase ${orderData.credits} Credits`,
        order_id: orderData.order_id,
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
        },
        theme: {
          color: '#4F46E5',
        },
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            await creditsService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            onSuccess();
          } catch (err: any) {
            setError(err.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Buy Credits</h2>
      
      <PackageSelector onSelect={setSelectedPackage} />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handlePurchase}
        disabled={!selectedPackage || loading}
        className={`
          w-full py-3 px-4 rounded-lg font-medium
          ${selectedPackage && !loading
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {loading ? 'Processing...' : `Buy ${selectedPackage?.credits || 0} Credits`}
      </button>
    </div>
  );
};

// Add Razorpay to window type
declare global {
  interface Window {
    Razorpay: any;
  }
}
```

### 4. Transaction History

```tsx
// components/TransactionHistory.tsx
import React, { useEffect, useState } from 'react';
import { creditsService } from '../services/creditsService';
import { CreditTransaction, Pagination } from '../types/credits';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  purchase: { label: 'Purchased', color: 'bg-green-100 text-green-800' },
  deduction: { label: 'Used', color: 'bg-red-100 text-red-800' },
  refund: { label: 'Refunded', color: 'bg-blue-100 text-blue-800' },
  admin_add: { label: 'Admin Added', color: 'bg-purple-100 text-purple-800' },
  admin_deduct: { label: 'Admin Deducted', color: 'bg-orange-100 text-orange-800' },
};

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [page, filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await creditsService.getHistory({
        page,
        limit: 10,
        type: filter || undefined,
      });
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="border rounded px-3 py-1"
        >
          <option value="">All Types</option>
          <option value="purchase">Purchases</option>
          <option value="deduction">Used</option>
          <option value="refund">Refunds</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No transactions found</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.transaction_id} className="border-b">
                <td className="py-3">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${TYPE_LABELS[tx.transaction_type]?.color}`}>
                    {TYPE_LABELS[tx.transaction_type]?.label || tx.transaction_type}
                  </span>
                </td>
                <td className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </td>
                <td>{tx.balance_after}</td>
                <td className="text-gray-600 text-sm">{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Error Handling

### Error Response Format

```typescript
interface APIError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

### Common Error Codes

| Code | Message | User Action |
|------|---------|-------------|
| `INSUFFICIENT_CREDITS` | Not enough credits | Show buy credits prompt |
| `MAX_BALANCE_EXCEEDED` | Would exceed max balance | Show current balance and max |
| `INVALID_SIGNATURE` | Payment verification failed | Retry or contact support |

### Error Handling Example

```typescript
const handleApply = async (projectId: number) => {
  try {
    await applicationService.apply(projectId);
  } catch (err: any) {
    const error = err.response?.data;
    
    if (error?.code === 'INSUFFICIENT_CREDITS') {
      showModal({
        title: 'Not Enough Credits',
        message: `You need 1 credit to apply. Current balance: ${error.details?.available || 0}`,
        action: {
          label: 'Buy Credits',
          onClick: () => router.push('/credits/purchase')
        }
      });
    } else {
      toast.error(error?.message || 'Failed to apply');
    }
  }
};
```

---

## Best Practices

### 1. Cache Balance

```typescript
// Use React Query or SWR for caching
import useSWR from 'swr';

const useBalance = () => {
  return useSWR('/credits/balance', () => creditsService.getBalance(), {
    refreshInterval: 30000, // Refresh every 30s
    revalidateOnFocus: true,
  });
};
```

### 2. Optimistic Updates

```typescript
// After successful purchase
const onPurchaseSuccess = (creditsAdded: number) => {
  // Immediately update UI
  setBalance(prev => ({
    ...prev!,
    credits_balance: prev!.credits_balance + creditsAdded,
    total_credits_purchased: prev!.total_credits_purchased + creditsAdded,
  }));
  
  // Then revalidate from server
  mutate('/credits/balance');
};
```

### 3. Loading States

Always show loading states during API calls to prevent double-clicks and provide feedback.

### 4. Confirmation Prompts

Always confirm before spending credits:

```tsx
const confirmApply = () => {
  if (confirm('This will use 1 credit. Continue?')) {
    handleApply();
  }
};
```
