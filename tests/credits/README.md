# Credits Feature Tests

## Overview
Comprehensive test suite for the Credit Management System.

## Quick Start

```bash
# Run all credits tests
node tests/credits/run-credits-tests.js

# Run specific category
node tests/credits/run-credits-tests.js api
node tests/credits/run-credits-tests.js security
```

## Test Structure

```
tests/credits/
├── run-credits-tests.js           # Main test runner
├── TEST_PLAN.md                   # Comprehensive test plan
├── README.md                      # This file
│
├── api/                           # API endpoint tests
│   ├── test-balance-api.js        # GET /credits/balance
│   ├── test-packages-api.js       # GET /credits/packages
│   ├── test-initiate-purchase-api.js # POST /credits/initiate-purchase
│   └── test-history-api.js        # GET /credits/history
│
└── security/                      # Security tests
    └── test-auth-protection.js    # Auth & authorization tests
```

## Test Categories

### API Tests (`node tests/credits/run-credits-tests.js api`)
Tests all user-facing credit endpoints:
- **Balance API** - Get credit balance
- **Packages API** - Get available packages
- **Initiate Purchase API** - Create Razorpay orders
- **History API** - Transaction history

### Security Tests (`node tests/credits/run-credits-tests.js security`)
Tests authentication and authorization:
- All endpoints require authentication (401)
- Client role cannot access freelancer endpoints (403)
- Freelancer role can access endpoints (200)
- Invalid tokens rejected
- Admin endpoints protected

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Balance API | 6 | ✅ |
| Packages API | 6 | ✅ |
| Initiate Purchase API | 9 | ✅ |
| History API | 7 | ✅ |
| Auth Protection | 20+ | ✅ |

## Environment Variables

```bash
# Optional: Show full response on failures
SHOW_FULL_RESPONSE=true node tests/credits/run-credits-tests.js

# Optional: Verbose output
VERBOSE=true node tests/credits/run-credits-tests.js

# Optional: Custom base URL
TEST_BASE_URL=http://localhost:8000 node tests/credits/run-credits-tests.js
```

## Prerequisites

1. Server running on `localhost:8000` (or custom URL)
2. Database with migrations applied
3. `form-data` package installed

## Adding New Tests

1. Create test file in appropriate folder
2. Export `runTests` function that returns `{ passed, failed }`
3. Add to `TEST_SUITES` in `run-credits-tests.js`

Example:
```javascript
async function runTests() {
    let passedTests = 0;
    let failedTests = 0;
    
    // ... run tests ...
    
    return { passed: passedTests, failed: failedTests };
}

module.exports = { runTests };
```

## Test Utilities

Available from `../test-utils.js`:
- `makeRequest(method, path, data, headers)` - HTTP requests
- `printTestResult(name, passed, message)` - Print result
- `printSection(title)` - Print section header
- `printSummary(passed, failed)` - Print summary
- `storeToken(type, token)` - Store auth token
- `authHeader(type)` - Get auth header
- `randomEmail(prefix)` - Generate random email
