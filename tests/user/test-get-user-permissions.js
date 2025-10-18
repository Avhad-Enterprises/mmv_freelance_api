#!/usr/bin/env node

/**
 * Get User Permissions API Test
 *
 * Tests the /users/:id/permissions endpoint (GET method) for admin user permissions retrieval
 */

const https = require('https');
const http = require('http');
const { CONFIG } = require('../test-utils');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('🔐 Get User Permissions API Test');
console.log('=================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT}/:id/permissions (GET)`);
console.log('');

// Test variables
let adminToken = null;
let superAdminToken = null;
let testUserId = 8; // vasudha@gmail.com - existing user
let regularUserToken = null;
let regularUserId = null;

// Helper function to make HTTP request
function makeRequest(method = 'GET', urlPath = '', headers = {}) {
  return new Promise((resolve, reject) => {
    const url = BASE_URL + urlPath;

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
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
    urlPath: `${ENDPOINT}/${testUserId}/permissions`,
    headers: {},
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Invalid Authorization Header Format",
    description: "Test with malformed Authorization header",
    urlPath: `${ENDPOINT}/${testUserId}/permissions`,
    headers: {
      'Authorization': 'InvalidFormat'
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Invalid JWT Token",
    description: "Test with invalid JWT token",
    urlPath: `${ENDPOINT}/${testUserId}/permissions`,
    headers: {
      'Authorization': 'Bearer invalid.jwt.token'
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Regular User Access",
    description: "Test with regular user token (should fail)",
    urlPath: `${ENDPOINT}/${testUserId}/permissions`,
    headers: {}, // Will be set dynamically with regular user token
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS",
    requiresRegularUserToken: true
  },

  // ============== VALIDATION ERRORS ==============
  {
    name: "Invalid User ID Format",
    description: "Test with non-numeric user ID",
    urlPath: `${ENDPOINT}/abc/permissions`,
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 500,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  {
    name: "Non-existent User ID",
    description: "Test with user ID that doesn't exist",
    urlPath: `${ENDPOINT}/99999/permissions`,
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  // ============== VALID REQUESTS ==============
  {
    name: "Valid User Permissions Retrieval - Super Admin",
    description: "Test retrieving user permissions with super admin token",
    urlPath: `${ENDPOINT}/${testUserId}/permissions`,
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "VALID_REQUESTS",
    requiresSuperAdminToken: true
  },

  {
    name: "Valid User Permissions Retrieval - Admin",
    description: "Test retrieving user permissions with admin token",
    urlPath: `${ENDPOINT}/${testUserId}/permissions`,
    headers: {}, // Will be set dynamically with admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "VALID_REQUESTS",
    requiresSuperAdminToken: true,
    skip: true // Skip for now since we don't have admin token setup
  },

  // ============== MALFORMED REQUESTS ==============
  {
    name: "Wrong HTTP Method - POST",
    description: "Test with POST instead of GET",
    method: "POST",
    urlPath: `${ENDPOINT}/${testUserId}/permissions`,
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    requiresSuperAdminToken: true
  },

  {
    name: "Wrong HTTP Method - PUT",
    description: "Test with PUT instead of GET",
    method: "PUT",
    urlPath: `${ENDPOINT}/${testUserId}/permissions`,
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    requiresSuperAdminToken: true
  }
];

async function runTests() {
  console.log('🔐 Attempting to set up authentication tokens...\n');

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
    const testUserEmail = `test-user-permissions-${Date.now()}@example.com`;
    console.log('Creating regular test user...');
    const registerResult = await registerTestUser(testUserEmail, 'TestPassword123!');
    if (registerResult.success) {
      console.log('✅ Regular test user registered successfully');
      regularUserToken = await loginAndGetToken(testUserEmail, 'TestPassword123!');
      if (regularUserToken) {
        console.log('✅ Regular user token obtained');
        // Extract user ID from token or use a known ID
        regularUserId = testUserId; // Use existing test user ID
      }
    } else {
      console.log('⚠️  Regular test user registration failed, continuing with tests...');
    }
  } catch (error) {
    console.log('❌ Error setting up regular test user:', error.message);
  }

  console.log(`👤 Using test user ID: ${testUserId}`);
  console.log('');

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
      if (testCase.requiresSuperAdminToken && superAdminToken) {
        headers['Authorization'] = `Bearer ${superAdminToken}`;
      }
      if (testCase.requiresAdminToken && adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      if (testCase.requiresRegularUserToken && regularUserToken) {
        headers['Authorization'] = `Bearer ${regularUserToken}`;
      }

      const method = testCase.method || 'GET';
      const response = await makeRequest(method, testCase.urlPath, headers);
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

      printTestResult(testCase, response, testPassed);

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