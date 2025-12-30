# Credit Management System - Testing Guide

> **Last Updated**: December 2024

---

## Overview

This guide explains how to test the Credit Management System, including setup, running tests, and writing new tests.

---

## Test Structure

```
tests/credits/
│
├── test-utils.js              # Shared utilities and helpers
├── run-credits-tests.js       # Main test runner
├── TEST_PLAN.md               # Test plan documentation
│
├── api/                       # User API tests
│   ├── test-balance-api.js
│   ├── test-packages-api.js
│   ├── test-initiate-purchase-api.js
│   ├── test-history-api.js
│   ├── test-refund-eligibility-api.js
│   └── test-refunds-api.js
│
├── admin/                     # Admin API tests
│   ├── test-admin-transactions-api.js
│   ├── test-admin-analytics-api.js
│   ├── test-admin-adjust-api.js
│   ├── test-admin-user-credits-api.js
│   ├── test-admin-refund-project-api.js
│   └── test-admin-export-api.js
│
├── integration/               # Integration tests
│   └── test-apply-deduct-flow.js
│
└── security/                  # Security tests
    ├── test-auth-protection.js
    └── test-ownership-validation.js
```

---

## Prerequisites

### 1. Database Setup

Ensure test database is running and migrated:

```bash
# Run migrations
npm run migrate:schema -- credit_transactions
npm run migrate:schema -- credit_settings
```

### 2. Environment Variables

```env
# .env.test
DB_HOST=localhost
DB_DATABASE=mmv_test
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
```

### 3. Server Running

Tests run against a live server:

```bash
npm run dev
# Server should be on http://localhost:8000
```

### 4. Admin User

Ensure admin user exists:

```sql
-- Verify admin user
SELECT * FROM users WHERE email = 'admin@mmvfreelance.com';
```

---

## Running Tests

### Run All Tests

```bash
node tests/credits/run-credits-tests.js
```

### Run Specific Category

```bash
# API tests only
node tests/credits/run-credits-tests.js api

# Admin tests only
node tests/credits/run-credits-tests.js admin

# Integration tests
node tests/credits/run-credits-tests.js integration

# Security tests
node tests/credits/run-credits-tests.js security
```

### Run Single Test File

```bash
node tests/credits/api/test-balance-api.js
```

---

## Test Categories

### 1. API Tests (`/api`)

Tests for user-facing endpoints:

| File | Tests |
|------|-------|
| `test-balance-api.js` | GET /credits/balance |
| `test-packages-api.js` | GET /credits/packages |
| `test-initiate-purchase-api.js` | POST /credits/initiate-purchase |
| `test-history-api.js` | GET /credits/history |
| `test-refund-eligibility-api.js` | GET /credits/refund-eligibility/:id |
| `test-refunds-api.js` | GET /credits/refunds |

### 2. Admin Tests (`/admin`)

Tests for admin endpoints:

| File | Tests |
|------|-------|
| `test-admin-transactions-api.js` | GET /admin/credits/transactions |
| `test-admin-analytics-api.js` | GET /admin/credits/analytics |
| `test-admin-adjust-api.js` | POST /admin/credits/adjust |
| `test-admin-user-credits-api.js` | GET /admin/credits/user/:id |
| `test-admin-refund-project-api.js` | POST /admin/credits/refund-project/:id |
| `test-admin-export-api.js` | GET /admin/credits/export |

### 3. Integration Tests (`/integration`)

End-to-end workflow tests:

| File | Tests |
|------|-------|
| `test-apply-deduct-flow.js` | Full apply-to-project with credit deduction |

### 4. Security Tests (`/security`)

Security and access control tests:

| File | Tests |
|------|-------|
| `test-auth-protection.js` | Endpoints require authentication |
| `test-ownership-validation.js` | Users can only access their own data |

---

## Test Utilities

### test-utils.js

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:8000',
  apiVersion: '/api/v1',
};

// Make HTTP request
async function makeRequest(method, path, body, headers = {}) { ... }

// Generate random email
function randomEmail(prefix) { ... }

// Store and retrieve tokens
function storeToken(name, token) { ... }
function authHeader(name) { ... }

// Print test results
function printTestResult(name, passed, details) { ... }
function printSummary(passed, failed) { ... }
```

### Usage Example

```javascript
const { CONFIG, makeRequest, storeToken, authHeader, randomEmail } = require('../test-utils');

async function test_get_balance() {
  const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('videographer'));
  
  const passed = response.statusCode === 200 && 
    typeof response.body.data.credits_balance === 'number';
    
  printTestResult('GET /credits/balance returns balance', passed);
}
```

---

## Writing New Tests

### Test File Template

```javascript
#!/usr/bin/env node

/**
 * Test File Description
 * Tests POST /api/v1/credits/new-endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  authHeader,
  randomEmail
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Setup - Create test user
 */
async function setup() {
  // Create and login test user
  const email = randomEmail('test-user');
  // ... registration code
  
  const loginRes = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
    email,
    password: 'Test@123456'
  });
  
  storeToken('testuser', loginRes.body.data.token);
  return true;
}

/**
 * Test: Description of what we're testing
 */
async function test_example() {
  const testName = 'Description of expected behavior';
  
  const response = await makeRequest(
    'POST', 
    `${CONFIG.apiVersion}/credits/endpoint`,
    { field: 'value' },
    authHeader('testuser')
  );
  
  const passed = response.statusCode === 200 &&
    response.body.success === true;
  
  printTestResult(testName, passed, `Status: ${response.statusCode}`);
  passed ? passedTests++ : failedTests++;
}

/**
 * Test: Error case
 */
async function test_error_case() {
  const testName = 'Returns 400 when invalid input';
  
  const response = await makeRequest(
    'POST',
    `${CONFIG.apiVersion}/credits/endpoint`,
    { field: 'invalid' },
    authHeader('testuser')
  );
  
  const passed = response.statusCode === 400;
  
  printTestResult(testName, passed, `Status: ${response.statusCode}`);
  passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  printSection('NEW ENDPOINT TESTS');
  
  const ready = await setup();
  if (!ready) {
    console.log('❌ Setup failed');
    process.exit(1);
  }
  
  // Run tests in order
  await test_example();
  await test_error_case();
  
  printSummary(passedTests, failedTests);
  
  return { passed: passedTests, failed: failedTests };
}

// Run if executed directly
if (require.main === module) {
  runTests()
    .then(({ failed }) => process.exit(failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Test runner failed:', err);
      process.exit(1);
    });
}

module.exports = { runTests };
```

### Test Naming Convention

```javascript
// Good test names
async function test_returns_401_without_auth() { }
async function test_balance_includes_all_fields() { }
async function test_rejects_negative_amount() { }

// Bad test names (too vague)
async function test1() { }
async function testBalance() { }
```

---

## Test Coverage

### What to Test

| Category | Examples |
|----------|----------|
| **Happy Path** | Successful balance fetch, successful purchase |
| **Authentication** | Missing token → 401, invalid token → 401 |
| **Authorization** | Wrong role → 403, missing permission → 403 |
| **Validation** | Invalid input → 400, missing required → 400 |
| **Business Rules** | Insufficient credits → 400, max balance → 400 |
| **Edge Cases** | Zero amount, max values, empty results |
| **Error Handling** | Server errors handled gracefully |

### Coverage Goals

| Type | Target |
|------|--------|
| API Endpoints | 100% |
| Error Codes | 100% |
| Business Rules | 100% |
| Edge Cases | 80%+ |

---

## Debugging Tests

### Enable Verbose Output

```javascript
// Add logging to failing tests
if (!passed) {
  console.log('Response:', JSON.stringify(response.body, null, 2));
}
```

### Write to Log File

```javascript
const fs = require('fs');

if (!passed) {
  fs.writeFileSync('test-fail.log', JSON.stringify({
    test: testName,
    expected: expectedValue,
    actual: response.body,
    status: response.statusCode
  }, null, 2));
}
```

### Run with Node Inspector

```bash
node --inspect-brk tests/credits/api/test-balance-api.js
# Open chrome://inspect in Chrome
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/credits-tests.yml
name: Credits Tests

on:
  push:
    paths:
      - 'src/features/credits/**'
      - 'tests/credits/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: mmv_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run migrations
        run: npm run migrate:schema -- credit_transactions
        env:
          DB_HOST: localhost
          DB_DATABASE: mmv_test
          DB_USER: test
          DB_PASSWORD: test
          
      - name: Start server
        run: npm run dev &
        env:
          DB_HOST: localhost
          DB_DATABASE: mmv_test
          
      - name: Wait for server
        run: sleep 10
        
      - name: Run tests
        run: node tests/credits/run-credits-tests.js
```

---

## Test Data

### Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mmvfreelance.com | Admin@123456 |
| Videographer | (randomly generated) | Test@123456 |
| Video Editor | (randomly generated) | Test@123456 |
| Client | (randomly generated) | Test@123456 |

### Test Payment Data

| Card | Number | Result |
|------|--------|--------|
| Success | 4111 1111 1111 1111 | Payment succeeds |
| Failure | 4000 0000 0000 0002 | Payment fails |

### Cleanup

Tests create test users that accumulate. Periodically clean up:

```sql
-- Remove test users (be careful!)
DELETE FROM users WHERE email LIKE '%@test.com';
```
