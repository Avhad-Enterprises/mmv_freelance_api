#!/usr/bin/env node

/**
 * Password Reset API Test
 *
 * Tests the /users/password-reset endpoint
 */

const https = require('https');
const http = require('http');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users/password-reset';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('🔑 Password Reset API Test');
console.log('===========================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT}`);
console.log('');

// Test cases
const TEST_CASES = [
  // ============== VALIDATION ERRORS ==============
  {
    name: "Missing Token",
    description: "Test with missing token field",
    data: {
      new_password: "newpassword123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Missing New Password",
    description: "Test with missing new_password field",
    data: {
      token: "some-token"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Empty Token",
    description: "Test with empty token string",
    data: {
      token: "",
      new_password: "newpassword123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Empty New Password",
    description: "Test with empty new_password string",
    data: {
      token: "some-token",
      new_password: ""
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Short New Password",
    description: "Test with password shorter than 6 characters",
    data: {
      token: "some-token",
      new_password: "12345"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  // ============== TOKEN ERRORS ==============
  {
    name: "Invalid Token",
    description: "Test with non-existent token",
    data: {
      token: "invalid-token-12345678901234567890123456789012",
      new_password: "newpassword123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "TOKEN_ERRORS"
  },

  {
    name: "Expired Token",
    description: "Test with expired token (simulate by using old token)",
    data: {
      token: "expired-token-12345678901234567890123456789012",
      new_password: "newpassword123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "TOKEN_ERRORS"
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
      token: "some-token",
      new_password: "newpassword123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    contentType: 'text/plain'
  },

  // ============== SECURITY TESTS ==============
  {
    name: "SQL Injection in Token",
    description: "Test SQL injection in token field",
    data: {
      token: "'; DROP TABLE users; --",
      new_password: "newpassword123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  },

  {
    name: "XSS in New Password",
    description: "Test XSS injection in new_password field",
    data: {
      token: "some-token",
      new_password: "<script>alert('xss')</script>"
    },
    expectedStatus: 400, // Correct - invalid token, but password validation passes
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  },

  // ============== EDGE CASES ==============
  {
    name: "Very Long Token",
    description: "Test with extremely long token",
    data: {
      token: "a".repeat(200),
      new_password: "newpassword123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "EDGE_CASES"
  },

  {
    name: "Very Long Password",
    description: "Test with extremely long password",
    data: {
      token: "some-token",
      new_password: "a".repeat(200)
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "EDGE_CASES"
  },

  {
    name: "Minimum Valid Password",
    description: "Test with minimum valid password length (6 chars)",
    data: {
      token: "some-token",
      new_password: "123456"
    },
    expectedStatus: 400, // Will fail due to invalid token, but validates password format
    expectedFields: ['success', 'message'],
    category: "EDGE_CASES"
  },

  {
    name: "Unicode Password",
    description: "Test with unicode characters in password",
    data: {
      token: "some-token",
      new_password: "pásswörd123"
    },
    expectedStatus: 400, // Will fail due to invalid token, but validates password format
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
    VALIDATION_ERRORS: { total: 0, passed: 0 },
    TOKEN_ERRORS: { total: 0, passed: 0 },
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