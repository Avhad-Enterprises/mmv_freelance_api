# OAuth Frontend Integration Guide

## Overview

This guide shows how to integrate OAuth authentication in your frontend application using React/Next.js.

## Quick Setup

### 1. OAuth Button Component

```tsx
// components/OAuthButtons.tsx
'use client';

import { useState, useEffect } from 'react';

interface OAuthProvider {
  name: string;
  displayName: string;
  enabled: boolean;
  icon: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function OAuthButtons() {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/oauth/providers`)
      .then(res => res.json())
      .then(data => {
        setProviders(data.data.providers.filter((p: OAuthProvider) => p.enabled));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleOAuthLogin = (provider: string) => {
    // Redirect to OAuth endpoint
    window.location.href = `${API_BASE}/oauth/${provider}`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="oauth-buttons">
      {providers.map(provider => (
        <button
          key={provider.name}
          onClick={() => handleOAuthLogin(provider.name)}
          className={`oauth-btn oauth-btn-${provider.name}`}
        >
          <span className="oauth-icon">{getIcon(provider.icon)}</span>
          Continue with {provider.displayName}
        </button>
      ))}
    </div>
  );
}

function getIcon(icon: string) {
  const icons: Record<string, string> = {
    google: '🔵',
    facebook: '🔷',
    apple: '🍎',
  };
  return icons[icon] || '🔗';
}
```

### 2. Callback Page

```tsx
// app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const token = searchParams.get('token');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    if (error) {
      setStatus('error');
      setMessage(errorMessage || 'Authentication failed');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('No authentication token received');
      return;
    }

    // Store token securely
    Cookies.set('access_token', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    setStatus('success');

    if (isNewUser) {
      // New user - redirect to role selection
      router.push('/auth/select-role');
    } else {
      // Existing user - check role and redirect to dashboard
      checkRoleAndRedirect(token);
    }
  }, [searchParams, router]);

  async function checkRoleAndRedirect(token: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/oauth/role-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.data.needsRoleSelection) {
        router.push('/auth/select-role');
      } else if (data.data.roles.includes('CLIENT')) {
        router.push('/dashboard/client-dashboard');
      } else {
        router.push('/dashboard/freelancer-dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  }

  return (
    <div className="callback-container">
      {status === 'loading' && <p>🔄 {message}</p>}
      {status === 'success' && <p>✅ Authentication successful! Redirecting...</p>}
      {status === 'error' && (
        <div>
          <p>❌ {message}</p>
          <button onClick={() => router.push('/login')}>Back to Login</button>
        </div>
      )}
    </div>
  );
}
```

### 3. Role Selection Page

```tsx
// app/auth/select-role/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const roles = [
  { id: 'CLIENT', title: 'Client', description: 'Hire videographers and editors' },
  { id: 'VIDEOGRAPHER', title: 'Videographer', description: 'Offer video filming services' },
  { id: 'VIDEO_EDITOR', title: 'Video Editor', description: 'Offer video editing services' },
];

export default function SelectRole() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!selectedRole) return;

    setLoading(true);
    setError('');

    const token = Cookies.get('access_token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/oauth/set-role`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();

      if (data.success) {
        // Update token with new roles
        Cookies.set('access_token', data.data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        // Redirect to appropriate dashboard
        router.push(data.data.redirect);
      } else {
        setError(data.message || 'Failed to set role');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="role-selection">
      <h1>Choose Your Role</h1>
      <p>Select how you want to use the platform</p>

      <div className="roles-grid">
        {roles.map(role => (
          <div
            key={role.id}
            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => setSelectedRole(role.id)}
          >
            <h3>{role.title}</h3>
            <p>{role.description}</p>
          </div>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!selectedRole || loading}
      >
        {loading ? 'Setting up...' : 'Continue'}
      </button>
    </div>
  );
}
```

### 4. Error Page

```tsx
// app/auth/error/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  const errorMessages: Record<string, string> = {
    access_denied: 'You cancelled the login or denied permission.',
    invalid_state: 'Your session expired. Please try again.',
    server_error: 'An error occurred. Please try again later.',
  };

  return (
    <div className="error-page">
      <h1>Authentication Error</h1>
      <p>{message || errorMessages[error || ''] || 'An unknown error occurred.'}</p>
      <Link href="/login">
        <button>Back to Login</button>
      </Link>
    </div>
  );
}
```

---

## Account Linking

### Linked Accounts Component

```tsx
// components/LinkedAccounts.tsx
'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function LinkedAccounts() {
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    const token = Cookies.get('access_token');

    const [linkedRes, allRes] = await Promise.all([
      fetch(`${API_BASE}/oauth/linked`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/oauth/providers`),
    ]);

    const linked = await linkedRes.json();
    const all = await allRes.json();

    setLinkedProviders(linked.data.providers);
    setAllProviders(all.data.providers.filter((p: any) => p.enabled));
    setLoading(false);
  }

  async function handleLink(provider: string) {
    // Redirect to link provider
    window.location.href = `${API_BASE}/oauth/${provider}`;
  }

  async function handleUnlink(provider: string) {
    if (!confirm(`Unlink ${provider} account?`)) return;

    const token = Cookies.get('access_token');

    try {
      const res = await fetch(`${API_BASE}/oauth/unlink/${provider}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setLinkedProviders(prev => prev.filter(p => p !== provider));
      } else {
        alert(data.message);
      }
    } catch {
      alert('Failed to unlink account');
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="linked-accounts">
      <h3>Connected Accounts</h3>
      {allProviders.map(provider => {
        const isLinked = linkedProviders.includes(provider.name);
        return (
          <div key={provider.name} className="provider-row">
            <span>{provider.displayName}</span>
            {isLinked ? (
              <button onClick={() => handleUnlink(provider.name)}>
                Disconnect
              </button>
            ) : (
              <button onClick={() => handleLink(provider.name)}>
                Connect
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## Token Handling Best Practices

### Secure Token Storage

```typescript
// utils/auth.ts
import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
```

### API Client with Auth

```typescript
// utils/api.ts
import { getToken, removeToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response.json();
}
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
