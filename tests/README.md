# MMV Freelance API - Test Suite

This directory contains API tests organized by feature. Tests validate all endpoints across authentication, user management, and role-specific functionality.

## 📁 Test Structure

```
tests/
├── auth/                           # Authentication tests
├── applied_projects/               # Applied projects tests
├── clients/                        # Client-related tests
├── user/                           # User management tests
├── upload/                         # File upload tests
├── projectstask/                   # Project task tests
├── public/                         # Public API tests
├── rbac/                           # Role-based access control tests
├── videoeditors/                   # Video editor tests
├── videographers/                  # Videographer tests
├── test-utils.js                   # Shared utilities and helpers
├── run-all-tests.js                # Master test runner
└── README.md                       # This file
```

## 🔄 Testing Flow

For each feature (e.g., `auth`, `user`, `clients`):

1. **Check Feature Routes** - Review the actual API routes/endpoints in the codebase
2. **Verify Test Folder** - Ensure corresponding test folder exists (e.g., `tests/auth/`)
3. **Validate API Coverage** - Confirm all routes have corresponding test cases
4. **Run & Verify Tests** - Execute tests and ensure all cases pass

### Example: Testing Auth Feature

```bash
# 1. Check auth routes in codebase
grep -r "auth/" src/routes/

# 2. Verify test folder exists
ls tests/auth/

# 3. Check test coverage
cat tests/auth/test-login.js

# 4. Run auth tests
node tests/auth/test-login.js
```

## ⚙️ Configuration

### Environment Variables

- `TEST_BASE_URL` - Base URL for API (default: `http://localhost:8001`)
- `SHOW_FULL_RESPONSE` - Show full response body on failures (default: `false`)
- `VERBOSE` - Show detailed output for all tests (default: `false`)

### test-utils.js

Shared utilities include:
- `makeRequest()` - HTTP request helper
- `printTestResult()` - Formatted test result output
- `printSection()` - Section headers
- `printSummary()` - Test summary with pass/fail counts
- `storeToken()` / `getToken()` - Token management
- `authHeader()` - Authorization header helper
- `randomEmail()` / `randomUsername()` - Test data generators

Base configuration:
```javascript
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8001',
  apiVersion: '/api/v1',
  timeout: 10000,
  showFullResponse: process.env.SHOW_FULL_RESPONSE === 'true',
  verbose: process.env.VERBOSE === 'true',
};
```

## 📝 Basic Test Template

```javascript
const { makeRequest, printTestResult, printSection, printSummary, authHeader } = require('../test-utils');

async function testFeatureEndpoint() {
  printSection('FEATURE ENDPOINT TESTS');

  let passedTests = 0;
  let failedTests = 0;

  try {
    // Test case example
    const response = await makeRequest(
      'POST',
      '/api/v1/feature/endpoint',
      { key: 'value' },
      authHeader('client')
    );

    const passed = response.statusCode === 200;
    printTestResult(
      'Valid request',
      passed,
      passed ? 'Success' : `Expected 200, got ${response.statusCode}`
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Valid request', false, error.message);
    failedTests++;
  }

  printSummary(passedTests, failedTests);
}

module.exports = { testFeatureEndpoint };
```

## 🚀 Running Tests

### Prerequisites

Start the API server:
```bash
npm run dev
```

### Run All Tests
```bash
node tests/run-all-tests.js
```

### Run Feature Tests
```bash
# Auth tests
node tests/auth/test-login.js

# User tests
node tests/user/test-user-routes.js

# Client tests
node tests/clients/test-client-routes.js
```

### Run with Custom Configuration
```bash
# Different base URL
TEST_BASE_URL=http://localhost:3000 node tests/run-all-tests.js

# Verbose output
VERBOSE=true node tests/test-auth.js

# Show full responses on failures
SHOW_FULL_RESPONSE=true node tests/test-user-routes.js
```

## 📊 Test Output

### Success
```
✓ PASS Valid login
  Login successful
```

### Failure
```
✗ FAIL Invalid login
  Expected 401, got 200
```

### Summary
```
============================================================
TEST SUMMARY
============================================================
Total:  5
Passed: 4
Failed: 1
============================================================
```
