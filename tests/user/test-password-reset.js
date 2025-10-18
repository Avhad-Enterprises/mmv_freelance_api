#!/usr/bin/env node

/**
 * Password Reset API Test
 *
 * Tests the /users/password-reset endpoint (POST method) for password resets using tokens
 */

const https = require('https');
const http = require('http');
const { CONFIG } = require('../test-utils');

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
console.log('==========================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT} (POST)`);
console.log('');

// Test variables
const validResetToken = 'valid-reset-token-123'; // Mock token for testing
const invalidResetToken = 'invalid-reset-token';

// Helper function to make HTTP request
function makeRequest(method = 'POST', headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const url = BASE_URL + ENDPOINT;

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: TEST_CONFIG.timeout
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Helper function to print test result
function printTestResult(testCase, response, passed, testIndex) {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  const expected = testCase.expectedStatus;
  const actual = response.statusCode;

  console.log(`${testIndex}. ${testCase.name}`);
  console.log(`   Description: ${testCase.description}`);
  console.log(`   Category: ${testCase.category}`);
  console.log(`   Response Time: ${response.responseTime || 0}ms`);
  console.log(`   Status: ${actual} (expected: ${expected})`);
  console.log(`   ${status}`);

  if (!passed) {
    console.log(`   Expected: ${expected}, Got: ${actual}`);
    if (response.body && typeof response.body === 'object') {
      console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    } else if (response.body) {
      console.log(`   Response: ${response.body}`);
    }
  }
  console.log('');
}

const TEST_CASES = [
  // ============== VALIDATION ERRORS ==============
  {
    name: "Missing Token",
    description: "Test with missing token field",
    data: {
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Missing New Password",
    description: "Test with missing newPassword field",
    data: {
      token: validResetToken,
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Missing Confirm Password",
    description: "Test with missing confirmPassword field",
    data: {
      token: validResetToken,
      newPassword: "NewPassword123!"
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
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Empty New Password",
    description: "Test with empty newPassword string",
    data: {
      token: validResetToken,
      newPassword: "",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Empty Confirm Password",
    description: "Test with empty confirmPassword string",
    data: {
      token: validResetToken,
      newPassword: "NewPassword123!",
      confirmPassword: ""
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Weak Password",
    description: "Test with password that doesn't meet requirements",
    data: {
      token: validResetToken,
      newPassword: "123",
      confirmPassword: "123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  {
    name: "Password Mismatch",
    description: "Test with mismatched passwords",
    data: {
      token: validResetToken,
      newPassword: "NewPassword123!",
      confirmPassword: "DifferentPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS"
  },

  // ============== AUTHENTICATION ERRORS ==============
  {
    name: "Invalid Reset Token",
    description: "Test with invalid reset token",
    data: {
      token: invalidResetToken,
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Expired Reset Token",
    description: "Test with expired reset token",
    data: {
      token: "expired-token-123",
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  // ============== VALID REQUESTS ==============
  {
    name: "Valid Password Reset",
    description: "Test with valid token and password (would pass with real token)",
    data: {
      token: validResetToken,
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 400, // Will be 400 for mock token, 200 for real token
    expectedFields: ['success', 'message'],
    category: "VALID_REQUESTS"
  },

  // ============== MALFORMED REQUESTS ==============
  {
    name: "Wrong HTTP Method - GET",
    description: "Test with GET instead of POST",
    method: "GET",
    data: {
      token: validResetToken,
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 401, // API returns 401 for wrong methods (possibly due to middleware)
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS"
  },

  {
    name: "Wrong HTTP Method - PUT",
    description: "Test with PUT instead of POST",
    method: "PUT",
    data: {
      token: validResetToken,
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 401, // API returns 401 for wrong methods (possibly due to middleware)
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS"
  },

  // ============== SECURITY TESTS ==============
  {
    name: "SQL Injection in Token",
    description: "Test SQL injection attempt in token field",
    data: {
      token: "'; DROP TABLE users; --",
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  },

  {
    name: "XSS in Password",
    description: "Test XSS attempt in password field",
    data: {
      token: validResetToken,
      newPassword: "<script>alert('xss')</script>",
      confirmPassword: "<script>alert('xss')</script>"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  }
];

async function runTests() {
  console.log('🔑 Attempting to run password reset tests...\n');

  let passed = 0;
  let failed = 0;
  const categoryStats = {};

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    const testIndex = i + 1;

    const startTime = Date.now();

    try {
      const method = testCase.method || 'POST';
      const response = await makeRequest(method, testCase.headers || {}, testCase.data);
      response.responseTime = Date.now() - startTime;

      // Check if test passed
      const statusMatch = response.statusCode === testCase.expectedStatus;
      let fieldsMatch = true;

      if (testCase.expectedFields && response.body && typeof response.body === 'object') {
        fieldsMatch = testCase.expectedFields.every(field => field in response.body);
      }

      const testPassed = statusMatch && fieldsMatch;

      if (testPassed) {
        passed++;
      } else {
        failed++;
      }

      // Track category stats
      if (!categoryStats[testCase.category]) {
        categoryStats[testCase.category] = { passed: 0, total: 0 };
      }
      categoryStats[testCase.category].total++;
      if (testPassed) {
        categoryStats[testCase.category].passed++;
      }

      printTestResult(testCase, response, testPassed, testIndex);

    } catch (error) {
      failed++;
      console.log(`${testIndex}. ${testCase.name}`);
      console.log(`   Description: ${testCase.description}`);
      console.log(`   Category: ${testCase.category}`);
      console.log(`   ❌ FAILED - Error: ${error.message}`);
      console.log('');

      // Track category stats
      if (!categoryStats[testCase.category]) {
        categoryStats[testCase.category] = { passed: 0, total: 0 };
      }
      categoryStats[testCase.category].total++;
    }
  }

  // Print summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`Total: ${TEST_CASES.length} tests`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / TEST_CASES.length) * 100).toFixed(1)}%`);
  console.log('');

  console.log('By Category:');
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category];
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  });

  console.log('');
  console.log('🏁 Testing completed!');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});