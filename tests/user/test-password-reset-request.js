#!/usr/bin/env node

/**
 * Password Reset Request API Test
 *
 * Tests the /users/password-reset-request endpoint (POST method) for password reset requests
 */

const https = require('https');
const http = require('http');
const { CONFIG } = require('../test-utils');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users/password-reset-request';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('🔑 Password Reset Request API Test');
console.log('===================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT} (POST)`);
console.log('');

// Test variables
let testUserEmail = `test-reset-${Date.now()}@example.com`;

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
    name: "Missing Email",
    description: "Test with missing email field",
    data: {},
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

  // ============== VALID REQUESTS ==============
  {
    name: "Valid Password Reset Request",
    description: "Test with valid email for password reset request",
    data: {
      email: testUserEmail
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "VALID_REQUESTS"
  },

  {
    name: "Non-existent User Email",
    description: "Test with email that doesn't exist in system",
    data: {
      email: `nonexistent-${Date.now()}@example.com`
    },
    expectedStatus: 200, // Should still return 200 for security (don't reveal if email exists)
    expectedFields: ['success', 'message'],
    category: "VALID_REQUESTS"
  },

  // ============== MALFORMED REQUESTS ==============
  {
    name: "Wrong HTTP Method - GET",
    description: "Test with GET instead of POST",
    method: "GET",
    data: {
      email: testUserEmail
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
      email: testUserEmail
    },
    expectedStatus: 401, // API returns 401 for wrong methods (possibly due to middleware)
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS"
  },

  // ============== SECURITY TESTS ==============
  {
    name: "SQL Injection in Email",
    description: "Test SQL injection attempt in email field",
    data: {
      email: "'; DROP TABLE users; --"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  },

  {
    name: "XSS in Email",
    description: "Test XSS attempt in email field",
    data: {
      email: "<script>alert('xss')</script>"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  }
];

async function runTests() {
  console.log('🔑 Attempting to run password reset request tests...\n');

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