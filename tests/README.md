# MMV Freelance API - Test Suite

This directory contains comprehensive API tests for the MMV Freelance API platform. The tests cover all 52 endpoints across authentication, user management, and role-specific functionality.

## 📁 Test Structure

```
tests/
├── test-utils.js                    # Shared utilities and helpers
├── test-auth.js                     # Auth routes (4 endpoints)
├── test-user-routes.js              # User routes (15 endpoints)
├── test-client-routes.js            # Client routes (10 endpoints)
├── test-videographer-routes.js      # Videographer routes (13 endpoints)
├── test-videoeditor-routes.js       # Video editor routes (14 endpoints)
├── run-all-tests.js                 # Master test runner
└── README.md                        # This file
```

## 🧪 Test Coverage

### Auth Routes (test-auth.js)
- ✅ Client registration (valid, missing fields, invalid email, duplicate)
- ✅ Videographer registration (valid, missing fields)
- ✅ Video editor registration (valid)
- ✅ Login (valid, invalid password, non-existent user, missing credentials)

### User Routes (test-user-routes.js)
- ✅ Get own profile (with/without token, invalid token)
- ✅ Update profile (valid data, invalid email, no auth)
- ✅ Change password (valid, wrong old password, no auth)
- ✅ Password reset flow (valid email, non-existent, invalid format)
- ✅ Get user roles (with/without auth)

### Client Routes (test-client-routes.js)
- ✅ Get client profile (with/without auth)
- ✅ Update client profile (valid data, invalid URL)
- ✅ Search freelancers (videographers, video editors, no auth)
- ✅ Get freelancer details (valid, non-existent)
- ✅ Client statistics (with/without auth)

### Videographer Routes (test-videographer-routes.js)
- ✅ Get videographer profile (with/without auth)
- ✅ Update videographer profile (valid data, invalid rate)
- ✅ Videographer discovery and search
- ✅ Availability management (update, get)
- ✅ Portfolio management (add, get)
- ✅ Videographer statistics

### Video Editor Routes (test-videoeditor-routes.js)
- ✅ Get video editor profile (with/without auth)
- ✅ Update video editor profile (valid data, invalid rate)
- ✅ Video editor discovery and search (by skills, software)
- ✅ Availability management (update, get)
- ✅ Portfolio management (add, get)
- ✅ Task management (get tasks, check workload)
- ✅ Video editor statistics

## 🚀 Running Tests

### Prerequisites

Make sure your API server is running:
```bash
npm run dev
# Server should be running on http://localhost:8000
```

### Run All Tests

Execute all test suites:
```bash
node tests/run-all-tests.js
```

### Run Individual Test Suites

Run specific test files:
```bash
# Auth tests
node tests/test-auth.js

# User routes tests
node tests/test-user-routes.js

# Client routes tests
node tests/test-client-routes.js

# Videographer routes tests
node tests/test-videographer-routes.js

# Video editor routes tests
node tests/test-videoeditor-routes.js
```

### Run with Custom Configuration

Set environment variables to customize test execution:

```bash
# Use different base URL
TEST_BASE_URL=http://localhost:3000 node tests/run-all-tests.js

# Show full response on failures
SHOW_FULL_RESPONSE=true node tests/test-auth.js

# Verbose output
VERBOSE=true node tests/test-user-routes.js
```

## ⚙️ Configuration

### Environment Variables

- `TEST_BASE_URL` - Base URL for API (default: `http://localhost:8000`)
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

## 📊 Test Output

### Success Output
```
✓ PASS Valid client registration
  Client registered: client-1234567890@test.com
```

### Failure Output
```
✗ FAIL Login with invalid password
  Expected 401, got 200
```

### Summary
```
============================================================
TEST SUMMARY
============================================================
Total:  12
Passed: 10
Failed: 2
============================================================
```

## 🎯 Test Patterns

All test files follow consistent patterns:

1. **Setup Phase** - Create test users with proper credentials
2. **Test Execution** - Run individual test cases
3. **Validation** - Check status codes and response structure
4. **Cleanup** - Tests use unique emails/usernames to avoid conflicts
5. **Summary** - Print pass/fail statistics

### Example Test Case

```javascript
try {
  const response = await makeRequest(
    'POST',
    `${CONFIG.apiVersion}/auth/login`,
    { email: testEmail, password: testPassword },
    authHeader('client')
  );
  
  const passed = response.statusCode === 200 && response.body.success === true;
  printTestResult(
    'Valid login',
    passed,
    passed ? 'Login successful' : `Expected 200, got ${response.statusCode}`,
    response.body
  );
  
  passed ? passedTests++ : failedTests++;
} catch (error) {
  printTestResult('Valid login', false, error.message);
  failedTests++;
}
```

## 🔧 Extending Tests

### Adding New Test Cases

1. Add test function in appropriate test file:
```javascript
async function testNewFeature() {
  printSection('NEW FEATURE TESTS');
  
  // Your test logic here
}
```

2. Call it from `runTests()`:
```javascript
async function runTests() {
  // ... existing tests
  await testNewFeature();
  // ...
}
```

### Creating New Test Files

1. Create new test file: `test-<feature>.js`
2. Import utilities: `require('./test-utils')`
3. Implement test functions
4. Export `runTests()` function
5. Add to `TEST_FILES` array in `run-all-tests.js`

## 📝 Best Practices

1. **Use unique test data** - Generate random emails/usernames to avoid conflicts
2. **Clean test data** - Tests create fresh users for each run
3. **Test both success and failure** - Include validation error tests
4. **Test authentication** - Include tests with/without tokens
5. **Clear test names** - Describe what is being tested
6. **Helpful messages** - Provide context in test output

## 🐛 Troubleshooting

### Server Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution**: Start the API server with `npm run dev`

### Database Connection Issues
```
Error: Connection timeout
```
**Solution**: Check database configuration and ensure PostgreSQL is running

### Test Failures
- Check server logs for detailed error messages
- Use `VERBOSE=true` for detailed test output
- Use `SHOW_FULL_RESPONSE=true` to see full API responses

## 📈 Next Steps

### Phase 4.2: Integration Testing
- Create end-to-end workflow tests
- Test complete user journeys
- Test cross-role interactions

### Phase 4.3: Postman Collection
- Export test cases to Postman
- Create collection for manual testing
- Add environment variables

### Phase 4.4: Unit Testing
- Add Jest for unit tests
- Test services in isolation
- Test middleware functions
- Mock database calls

## 🎓 Test Execution Examples

### Quick Smoke Test
```bash
# Run just auth and user tests
node tests/test-auth.js && node tests/test-user-routes.js
```

### Comprehensive Test Run
```bash
# Run all tests with verbose output
VERBOSE=true node tests/run-all-tests.js
```

### CI/CD Integration
```bash
# Run tests with proper exit codes
node tests/run-all-tests.js
if [ $? -eq 0 ]; then
  echo "All tests passed!"
else
  echo "Tests failed!"
  exit 1
fi
```

## 📞 Support

For issues or questions about tests:
1. Check test output for specific error messages
2. Review server logs for API errors
3. Verify database connectivity
4. Check environment configuration

---

**Total Test Coverage**: 52 API endpoints across 5 test suites  
**Test Type**: Integration tests (API endpoints)  
**Framework**: Node.js native (no external test framework required)  
**Last Updated**: Phase 4 - Testing & Validation
