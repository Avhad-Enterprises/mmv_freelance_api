# API Test Scripts

This directory contains comprehensive test scripts for the MMV Freelance API authentication endpoints.

## 📁 Files

- **`test-login.js`** - Login API test suite
- **`test-register.js`** - Registration API test suite  
- **`run-tests.js`** - Test runner for all suites
- **`README.md`** - This documentation

## 🚀 Quick Start

### Prerequisites
1. Ensure the server is running on `http://localhost:8000`
2. Install dependencies: `npm install`

### Running Tests

```bash
# Run all test suites
node scripts/run-tests.js

# Run only login tests
node scripts/run-tests.js login

# Run only registration tests
node scripts/run-tests.js register

# Individual test execution
node scripts/test-login.js
node scripts/test-register.js
```

## 🧪 Test Coverage

### Login Tests (`test-login.js`)
- **Valid Cases**: Successful logins for freelancers and clients
- **Validation Errors**: Missing fields, invalid formats, short passwords
- **Authentication Errors**: Invalid credentials, non-existent users
- **Malformed Requests**: Invalid JSON, wrong content types
- **Security Tests**: SQL injection, XSS attempts, long input attacks
- **Edge Cases**: Unicode characters, case sensitivity
- **Rate Limiting**: Multiple failed login attempts

**Total Test Cases**: ~25 tests across 6 categories

### Registration Tests (`test-register.js`)
- **Valid Cases**: Complete freelancer and client registrations
- **Basic Validation**: Missing required fields, invalid formats
- **Account Type Validation**: Invalid account types, missing types
- **Freelancer Specific**: Profile validation, skill requirements, hourly rates
- **Client Specific**: Company validation, budget ranges, service requirements
- **Phone Validation**: Format validation, length checks
- **File Upload**: File type validation, size limits, document requirements
- **Duplicate Prevention**: Email and username uniqueness
- **Security Tests**: SQL injection, XSS attempts
- **Edge Cases**: Unicode support, special characters, array formats
- **Rate Limiting**: Registration attempt limits

**Total Test Cases**: ~50+ tests across 12 categories

## 📊 Test Output

### Success Example
```
✅ PASSED - Valid Freelancer Login (Email)
   Description: Test login with valid freelancer email and password
   Category: VALID_CASES
   Response Time: 245ms
   Status: 200
```

### Failure Example
```
❌ FAILED - Missing Email
   Description: Test login with missing email field
   Category: VALIDATION_ERRORS
   Response Time: 123ms
   Status: 400
   Error: Expected status 400, got 500
```

### Summary Report
```
📊 Test Summary
===============
Total: 25 tests
Passed: 23 ✅
Failed: 2 ❌
Success Rate: 92.0%

By Category:
  VALID_CASES: 3/3 (100.0%)
  VALIDATION_ERRORS: 5/6 (83.3%)
  AUTH_ERRORS: 3/3 (100.0%)
  ...
```

## 🔧 Configuration

### Test Configuration (`TEST_CONFIG`)
```javascript
const TEST_CONFIG = {
  baseUrl: 'http://localhost:8000',
  endpoint: '/auth/login',         // or /auth/register
  timeout: 10000,                  // Request timeout in ms
  showFullResponse: false,         // Show full HTTP responses
  createTestFiles: true            // Create test files for uploads
};
```

### Customization
- **Base URL**: Change `baseUrl` to test different environments
- **Timeout**: Adjust `timeout` for slower/faster environments  
- **Debug Mode**: Set `showFullResponse: true` for detailed debugging
- **Test Files**: Set `createTestFiles: false` to skip file creation

## 📝 Test Categories

### Login Test Categories
1. **VALID_CASES** - Successful authentication scenarios
2. **VALIDATION_ERRORS** - Input validation failures
3. **AUTH_ERRORS** - Authentication/authorization failures
4. **MALFORMED_REQUESTS** - Invalid request formats
5. **SECURITY_TESTS** - Security vulnerability tests
6. **EDGE_CASES** - Boundary and edge condition tests
7. **RATE_LIMITING** - Rate limit enforcement tests

### Registration Test Categories
1. **VALID_CASES** - Successful registration scenarios
2. **VALIDATION_ERRORS** - Basic input validation
3. **BUSINESS_VALIDATION** - Business logic validation
4. **FILE_VALIDATION** - File upload validation
5. **DUPLICATE_VALIDATION** - Uniqueness constraint tests
6. **SECURITY_TESTS** - Security vulnerability tests
7. **EDGE_CASES** - Boundary condition tests
8. **ARRAY_FORMAT_TESTS** - Array field format validation
9. **RATE_LIMITING** - Registration rate limiting

## 🛠️ Adding New Tests

### Login Test Structure
```javascript
{
  name: "Test Name",
  description: "Test description",
  data: {
    email: "test@example.com",
    password: "password123"
  },
  expectedStatus: 200,
  expectedFields: ['success', 'message', 'data'],
  category: "VALID_CASES"
}
```

### Registration Test Structure
```javascript
{
  name: "Test Name",
  description: "Test description",
  data: () => ({
    ...FREELANCER_BASE_DATA,
    username: generateUniqueUsername('test'),
    email: generateUniqueEmail('test')
  }),
  files: {
    id_document: 'test-id-document.pdf'
  },
  expectedStatus: 201,
  category: "VALID_CASES"
}
```

## 🔍 Validation Logic

### Response Validation
- **Status Code**: Matches expected HTTP status
- **JSON Structure**: Required fields present
- **Data Integrity**: User data consistency
- **Security Headers**: CORS, security headers
- **Performance**: Response time tracking

### File Upload Testing
- **File Types**: PDF, images, invalid formats
- **File Sizes**: Within limits, oversized files
- **File Counts**: Single files, multiple files, limits
- **File Content**: Valid/invalid file content

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   ❌ Cannot connect to server. Please ensure the server is running on http://localhost:8000
   ```
   **Solution**: Start the server with `npm run dev`

2. **File Upload Errors**
   ```
   Error: ENOENT: no such file or directory
   ```
   **Solution**: Test files are auto-created. Check `TEST_CONFIG.createTestFiles = true`

3. **Rate Limiting False Positives**
   ```
   ⚠️ Rate limiting may not be working - no 429 responses received
   ```
   **Solution**: This is expected if rate limiting is disabled or limits are high

4. **High Failure Rates**
   - Check server logs for actual errors
   - Verify database is running and migrations applied
   - Ensure environment variables are set correctly

### Debug Mode
Enable detailed debugging:
```javascript
const TEST_CONFIG = {
  showFullResponse: true,  // Show full HTTP responses
  timeout: 30000,          // Increase timeout
};
```

## 📈 Performance Benchmarks

### Expected Response Times
- **Login**: 100-500ms (depends on bcrypt rounds)
- **Registration**: 200-1000ms (includes file uploads)
- **Rate Limited**: <50ms (quick rejection)

### Performance Monitoring
```
⏱️ Performance:
  Average Response Time: 245ms
  Max Response Time: 1250ms
```

## 🔒 Security Testing

### Covered Attack Vectors
- **SQL Injection**: Malicious SQL in input fields
- **XSS**: Script injection attempts
- **File Upload**: Malicious file types and sizes
- **Rate Limiting**: Brute force protection
- **Input Validation**: Buffer overflow attempts

### Security Test Examples
```javascript
// SQL Injection Test
{
  email: "user'; DROP TABLE users; --@example.com",
  password: "password123"
}

// XSS Test
{
  username: "<script>alert('xss')</script>",
  email: "test@example.com"
}
```

## 📋 Checklist for API Changes

When modifying the API, run these tests to ensure compatibility:

- [ ] All valid cases still pass
- [ ] New validation rules are tested
- [ ] Error messages are consistent
- [ ] Rate limiting works as expected
- [ ] File upload constraints are enforced
- [ ] Security measures are effective
- [ ] Performance is within acceptable limits

## 🤝 Contributing

To add new test cases:

1. Add test case to appropriate `TEST_CASES` array
2. Follow existing naming conventions
3. Include proper categorization
4. Add expected validation logic
5. Test both positive and negative scenarios
6. Update this README if adding new categories

## 📞 Support

For test-related issues:
- Check server logs for actual API errors
- Review test output for specific validation failures
- Verify test data matches current API requirements
- Ensure test environment matches development setup