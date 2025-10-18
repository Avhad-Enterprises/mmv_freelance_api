#!/usr/bin/env node

/**
 * Verify Phone API Test
 *
 * Tests the /users/verify-phone endpoint (POST method) for phone verification
 */

const https = require('https');
const http = require('http');
const { CONFIG } = require('../test-utils');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users/verify-phone';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('📱 Verify Phone API Test');
console.log('========================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT} (POST)`);
console.log('');

// Test variables
let testUserToken = null;
let testUserId = null;
let testUserEmail = `test-verify-phone-${Date.now()}@example.com`;
let testUserPassword = 'TestPassword123!';

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

// Helper function to login and get token
async function loginAndGetToken(email, password) {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({ email, password });
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.success && response.data && response.data.token) {
            resolve(response.data.token);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      resolve(null);
    });

    req.write(loginData);
    req.end();
  });
}

// Helper function to register a test user
async function registerTestUser(email, password = 'TestPassword123!') {
  return new Promise((resolve, reject) => {
    const registerData = JSON.stringify({
      email,
      password,
      first_name: 'Test',
      last_name: 'User',
      last_name: 'Phone',
      user_type: 'client'
    });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.write(registerData);
    req.end();
  });
}

// Helper function to print test result
function printTestResult(testCase, response, passed) {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  const expected = testCase.expectedStatus;
  const actual = response.statusCode;

  console.log(`${testCase.index}. ${testCase.name}`);
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
  // ============== AUTHENTICATION ERRORS ==============
  {
    name: "No Authorization Header",
    description: "Test without Authorization header",
    headers: {},
    data: {
      verification_code: "123456"
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Invalid Authorization Header Format",
    description: "Test with malformed Authorization header",
    headers: {
      'Authorization': 'InvalidFormat'
    },
    data: {
      verification_code: "123456"
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Invalid JWT Token",
    description: "Test with invalid JWT token",
    headers: {
      'Authorization': 'Bearer invalid.jwt.token'
    },
    data: {
      verification_code: "123456"
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  // ============== VALIDATION ERRORS ==============
  {
    name: "Missing Verification Code",
    description: "Test with missing verification_code field",
    headers: {}, // Will be set dynamically with test user token
    data: {},
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresTestUserToken: true
  },

  {
    name: "Empty Verification Code",
    description: "Test with empty verification_code string",
    headers: {}, // Will be set dynamically with test user token
    data: {
      verification_code: ""
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresTestUserToken: true
  },

  {
    name: "Invalid Verification Code Format",
    description: "Test with non-numeric verification code",
    headers: {}, // Will be set dynamically with test user token
    data: {
      verification_code: "abc123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresTestUserToken: true
  },

  // ============== VALID REQUESTS ==============
  {
    name: "Valid Phone Verification",
    description: "Test with valid verification code",
    headers: {}, // Will be set dynamically with test user token
    data: {
      verification_code: "123456"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "VALID_REQUESTS",
    requiresTestUserToken: true
  },

  {
    name: "Invalid Verification Code",
    description: "Test with wrong verification code",
    headers: {}, // Will be set dynamically with test user token
    data: {
      verification_code: "000000"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALID_REQUESTS",
    requiresTestUserToken: true
  },

  // ============== MALFORMED REQUESTS ==============
  {
    name: "Wrong HTTP Method - GET",
    description: "Test with GET instead of POST",
    method: "GET",
    headers: {}, // Will be set dynamically with test user token
    data: {
      verification_code: "123456"
    },
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    requiresTestUserToken: true
  },

  {
    name: "Wrong HTTP Method - PUT",
    description: "Test with PUT instead of POST",
    method: "PUT",
    headers: {}, // Will be set dynamically with test user token
    data: {
      verification_code: "123456"
    },
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    requiresTestUserToken: true
  },

  // ============== SECURITY TESTS ==============
  {
    name: "SQL Injection in Code",
    description: "Test SQL injection attempt in verification_code field",
    headers: {}, // Will be set dynamically with test user token
    data: {
      verification_code: "'; DROP TABLE users; --"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS",
    requiresTestUserToken: true
  },

  {
    name: "XSS in Code",
    description: "Test XSS attempt in verification_code field",
    headers: {}, // Will be set dynamically with test user token
    data: {
      verification_code: "<script>alert('xss')</script>"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS",
    requiresTestUserToken: true
  }
];

async function runTests() {
  console.log('📱 Attempting to set up test user for phone verification tests...\n');

  // Register and login test user
  try {
    console.log('Creating test user...');
    const registerResult = await registerTestUser(testUserEmail, testUserPassword);
    if (registerResult.success) {
      console.log('✅ Test user registered successfully');
    } else {
      console.log('⚠️  Test user registration failed, continuing with tests...');
    }

    console.log('Logging in test user...');
    testUserToken = await loginAndGetToken(testUserEmail, testUserPassword);
    if (testUserToken) {
      console.log('✅ Test user token obtained');
    } else {
      console.log('❌ Failed to obtain test user token');
    }
  } catch (error) {
    console.log('❌ Error setting up test user:', error.message);
  }

  console.log('\n📱 Running phone verification tests...\n');

  let passed = 0;
  let failed = 0;
  const categoryStats = {};

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    testCase.index = i + 1;

    const startTime = Date.now();

    try {
      // Set dynamic headers
      let headers = { ...testCase.headers };
      if (testCase.requiresTestUserToken && testUserToken) {
        headers['Authorization'] = `Bearer ${testUserToken}`;
      }

      const method = testCase.method || 'POST';
      const response = await makeRequest(method, headers, testCase.data);
      response.responseTime = Date.now() - startTime;

      // Check if test passed
      const statusMatch = response.statusCode === testCase.expectedStatus;
      let fieldsMatch = true;

      if (testCase.expectedFields && response.body && typeof response.body === 'object') {
        fieldsMatch = testCase.expectedFields.every(field => field in response.body);
      }

      const passed = statusMatch && fieldsMatch;

      if (passed) {
        passed++;
      } else {
        failed++;
      }

      // Track category stats
      if (!categoryStats[testCase.category]) {
        categoryStats[testCase.category] = { passed: 0, total: 0 };
      }
      categoryStats[testCase.category].total++;
      if (passed) {
        categoryStats[testCase.category].passed++;
      }

      printTestResult(testCase, response, passed);

    } catch (error) {
      failed++;
      console.log(`${testCase.index}. ${testCase.name}`);
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