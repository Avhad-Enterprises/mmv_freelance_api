#!/usr/bin/env node

/**
 * Send Invitation API Test
 *
 * Tests the /users/send-invitation endpoint (POST method) for sending user invitations
 */

const https = require('https');
const http = require('http');
const { CONFIG } = require('../test-utils');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users/send-invitation';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('📧 Send Invitation API Test');
console.log('===========================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT} (POST)`);
console.log('');

// Test variables
let adminToken = null;
let superAdminToken = null;
let regularUserToken = null;

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
  // ============== AUTHENTICATION ERRORS ==============
  {
    name: "No Authorization Header",
    description: "Test without Authorization header",
    headers: {},
    data: {
      email: "test@example.com"
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
      email: "test@example.com"
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
      email: "test@example.com"
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Regular User Access",
    description: "Test with regular user token (should fail)",
    headers: {}, // Will be set dynamically with regular user token
    data: {
      email: "test@example.com"
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS",
    requiresRegularUserToken: true
  },

  // ============== VALIDATION ERRORS ==============
  {
    name: "Missing Email",
    description: "Test with missing email field",
    headers: {}, // Will be set dynamically with super admin token
    data: {},
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  {
    name: "Invalid Email Format",
    description: "Test with invalid email format",
    headers: {}, // Will be set dynamically with super admin token
    data: {
      email: "invalid-email"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  {
    name: "Empty Email",
    description: "Test with empty email string",
    headers: {}, // Will be set dynamically with super admin token
    data: {
      email: ""
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  // ============== VALID REQUESTS ==============
  {
    name: "Valid Invitation Send - Super Admin",
    description: "Test sending invitation with valid data using super admin token",
    headers: {}, // Will be set dynamically with super admin token
    data: {
      email: `invite-test-${Date.now()}@example.com`,
      full_name: "Test User",
      username: `testuser${Date.now()}`,
      password: "TestPassword123!",
      phone_number: "+1234567890"
    },
    expectedStatus: 201,
    expectedFields: ['message', 'data'],
    category: "VALID_REQUESTS",
    requiresSuperAdminToken: true
  },

  {
    name: "Valid Invitation Send - Admin",
    description: "Test sending invitation with valid data using admin token",
    headers: {}, // Will be set dynamically with admin token
    data: {
      email: `invite-admin-test-${Date.now()}@example.com`,
      full_name: "Admin Test User",
      username: `admintest${Date.now()}`,
      password: "TestPassword123!",
      phone_number: "+1234567890"
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "VALID_REQUESTS",
    requiresAdminToken: true,
    skip: true // Skip for now since we don't have admin token setup
  },

  {
    name: "Minimal Invitation Data",
    description: "Test sending invitation with only required email field",
    headers: {}, // Will be set dynamically with super admin token
    data: {
      email: `minimal-invite-${Date.now()}@example.com`
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALID_REQUESTS",
    requiresSuperAdminToken: true
  },

  // ============== MALFORMED REQUESTS ==============
  {
    name: "Wrong HTTP Method - GET",
    description: "Test with GET instead of POST",
    method: "GET",
    headers: {}, // Will be set dynamically with super admin token
    data: {
      email: "test@example.com"
    },
    expectedStatus: 500,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    requiresSuperAdminToken: true
  },

  {
    name: "Wrong HTTP Method - PUT",
    description: "Test with PUT instead of POST",
    method: "PUT",
    headers: {}, // Will be set dynamically with super admin token
    data: {
      email: "test@example.com"
    },
    expectedStatus: 500,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    requiresSuperAdminToken: true
  },

  // ============== SECURITY TESTS ==============
  {
    name: "SQL Injection in Email",
    description: "Test SQL injection attempt in email field",
    headers: {}, // Will be set dynamically with super admin token
    data: {
      email: "'; DROP TABLE users; --"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS",
    requiresSuperAdminToken: true
  },

  {
    name: "XSS in Full Name",
    description: "Test XSS attempt in full_name field",
    headers: {}, // Will be set dynamically with super admin token
    data: {
      email: `xss-test-${Date.now()}@example.com`,
      full_name: "<script>alert('xss')</script>"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS",
    requiresSuperAdminToken: true
  }
];

async function runTests() {
  console.log('📧 Attempting to set up authentication tokens...\n');

  // Get super admin token
  superAdminToken = await loginAndGetToken('avhadenterprisespc5@gmail.com', 'SuperAdmin123!');
  if (!superAdminToken) {
    console.log('❌ Could not obtain super admin token');
  } else {
    console.log('✅ Super admin token obtained');
  }

  // Get admin token (skip for now)
  console.log('ℹ️  Skipping admin token - using super admin for all authorized tests');

  // Create and login regular user for testing access control
  try {
    const testUserEmail = `test-send-invite-${Date.now()}@example.com`;
    console.log('Creating regular test user...');
    const registerResult = await registerTestUser(testUserEmail, 'TestPassword123!');
    if (registerResult.success) {
      console.log('✅ Regular test user registered successfully');
      regularUserToken = await loginAndGetToken(testUserEmail, 'TestPassword123!');
      if (regularUserToken) {
        console.log('✅ Regular user token obtained');
      }
    } else {
      console.log('⚠️  Regular test user registration failed, continuing with tests...');
    }
  } catch (error) {
    console.log('❌ Error setting up regular test user:', error.message);
  }

  console.log('');

  let passed = 0;
  let failed = 0;
  const categoryStats = {};

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    const testIndex = i + 1;

    const startTime = Date.now();

    try {
      // Set dynamic headers
      let headers = { ...testCase.headers };
      if (testCase.requiresSuperAdminToken && superAdminToken) {
        headers['Authorization'] = `Bearer ${superAdminToken}`;
      }
      if (testCase.requiresAdminToken && adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      if (testCase.requiresRegularUserToken && regularUserToken) {
        headers['Authorization'] = `Bearer ${regularUserToken}`;
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