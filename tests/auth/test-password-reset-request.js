#!/usr/bin/env node

/**
 * Password Reset Request API Test
 *
 * Tests the /users/password-reset-request endpoint
 */

const https = require('https');
const http = require('http');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users/password-reset-request';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('🔐 Password Reset Request API Test');
console.log('=====================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT}`);
console.log('');

// Test cases
const TEST_CASES = [
  // ============== VALID REQUESTS ==============
  {
    name: "Valid Password Reset Request",
    description: "Test password reset request with valid email",
    data: {
      email: "test@example.com"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "VALID_REQUESTS"
  },

  // ============== VALIDATION ERRORS ==============
  {
    name: "Missing Email",
    description: "Test with missing email field",
    data: {},
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Empty Email",
    description: "Test with empty email string",
    data: {
      email: ""
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Invalid Email Format",
    description: "Test with invalid email format",
    data: {
      email: "invalid-email"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  // ============== USER NOT FOUND ==============
  {
    name: "Non-existent Email",
    description: "Test with email that doesn't exist (should still return success for security)",
    data: {
      email: "nonexistent@example.com"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "USER_ERRORS"
  },

  // ============== MALFORMED REQUESTS ==============
  {
    name: "Invalid JSON",
    description: "Test with malformed JSON",
    data: "{ invalid json }",
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    contentType: 'application/json'
  },

  {
    name: "Wrong Content Type",
    description: "Test with wrong content type",
    data: {
      email: "test@example.com"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    contentType: 'text/plain'
  },

  // ============== SECURITY TESTS ==============
  {
    name: "SQL Injection Attempt",
    description: "Test SQL injection in email field",
    data: {
      email: "'; DROP TABLE users; --"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  },

  {
    name: "XSS Attempt",
    description: "Test XSS injection in email field",
    data: {
      email: "<script>alert('xss')</script>@example.com"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  },

  // ============== EDGE CASES ==============
  {
    name: "Very Long Email",
    description: "Test with extremely long email",
    data: {
      email: "a".repeat(200) + "@example.com"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "EDGE_CASES"
  },

  {
    name: "Email with Special Characters",
    description: "Test email with special characters",
    data: {
      email: "test+tag@example.com"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "EDGE_CASES"
  }
];

// Helper function to make HTTP request
function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const url = BASE_URL + ENDPOINT;
    const data = typeof testCase.data === 'string' ? testCase.data : JSON.stringify(testCase.data);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': testCase.contentType || 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: TEST_CONFIG.timeout
    };

    const req = http.request(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

// Helper function to validate response
function validateResponse(testCase, response) {
  const errors = [];

  // Check status code
  if (response.statusCode !== testCase.expectedStatus) {
    errors.push(`Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
  }

  // Check for parse errors
  if (response.parseError) {
    errors.push(`JSON parse error: ${response.parseError}`);
    return errors;
  }

  // Check expected fields
  if (testCase.expectedFields && response.body) {
    for (const field of testCase.expectedFields) {
      if (!(field in response.body)) {
        errors.push(`Missing expected field: ${field}`);
      }
    }
  }

  return errors;
}

// Run tests
async function runTests() {
  let passed = 0;
  let failed = 0;
  const results = {
    VALID_REQUESTS: { total: 0, passed: 0 },
    VALIDATION_ERRORS: { total: 0, passed: 0 },
    USER_ERRORS: { total: 0, passed: 0 },
    MALFORMED_REQUESTS: { total: 0, passed: 0 },
    SECURITY_TESTS: { total: 0, passed: 0 },
    EDGE_CASES: { total: 0, passed: 0 }
  };

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    results[testCase.category].total++;

    console.log(`${i + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   Category: ${testCase.category}`);

    try {
      const startTime = Date.now();
      const response = await makeRequest(testCase);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   Response Time: ${duration}ms`);
      console.log(`   Status: ${response.statusCode}`);

      const validationErrors = validateResponse(testCase, response);

      if (validationErrors.length === 0) {
        console.log(`   ✅ PASSED`);
        passed++;
        results[testCase.category].passed++;
      } else {
        console.log(`   ❌ FAILED`);
        validationErrors.forEach(error => console.log(`      Error: ${error}`));
        failed++;
      }

      if (TEST_CONFIG.showFullResponse) {
        console.log(`   Response Body:`, JSON.stringify(response.body, null, 2));
      }

    } catch (error) {
      console.log(`   ❌ FAILED`);
      console.log(`      Error: ${error.message}`);
      failed++;
    }

    console.log('');
  }

  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`Total: ${TEST_CASES.length} tests`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / TEST_CASES.length) * 100).toFixed(1)}%`);
  console.log('');

  console.log('By Category:');
  Object.entries(results).forEach(([category, stats]) => {
    const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  });

  console.log('');
  console.log('🏁 Testing completed!');
}

// Run the tests
runTests().catch(console.error);