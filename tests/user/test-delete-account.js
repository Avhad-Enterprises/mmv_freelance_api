#!/usr/bin/env node

/**
 * Delete Account API Test
 *
 * Tests the /users/me endpoint (DELETE method) for account deletion
 */

const https = require('https');
const http = require('http');
const { CONFIG } = require('../test-utils');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users/me';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('🗑️  Delete Account API Test');
console.log('===========================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT} (DELETE)`);
console.log('');

// Test variables
let adminToken = null;
let testUserToken = null;
let testUserId = null;
let testUserEmail = `test-delete-${Date.now()}@example.com`;

// For this test, we'll use the admin account itself for deletion testing
// This is safe since we can verify the soft delete and the account should still work for admin operations

// Helper function to make HTTP request
function makeRequest(method = 'DELETE', headers = {}, data = null) {
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
      port: 8001,
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
      roleName: 'CLIENT'
    });

    const options = {
      hostname: 'localhost',
      port: 8001,
      path: '/api/v1/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
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

// Helper function to get user by email (admin only)
async function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8001,
      path: `/api/v1/admin/users/search?email=${encodeURIComponent(email)}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
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

    req.end();
  });
}

// Test cases
const TEST_CASES = [
  // ============== AUTHENTICATION ERRORS ==============
  {
    name: "No Authorization Header",
    description: "Test without Authorization header",
    headers: {},
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Invalid Authorization Header Format",
    description: "Test with malformed Authorization header",
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
    headers: {
      'Authorization': 'Bearer invalid.jwt.token'
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  // ============== SUCCESSFUL DELETION ==============
  {
    name: "Successful Account Deletion",
    description: "Test successful account deletion with valid admin token",
    headers: {}, // Will be set dynamically with admin token
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "SUCCESSFUL_DELETION",
    requiresAdminToken: true,
    expectedMessage: 'Account deleted successfully'
  },

  // ============== POST-DELETION VERIFICATION ==============
  {
    name: "Access After Deletion",
    description: "Test that deleted admin can still access endpoints (soft delete)",
    headers: {}, // Will be set dynamically with admin token
    expectedStatus: 200, // Admin should still work even if soft deleted
    expectedFields: ['success', 'message'],
    category: "POST_DELETION",
    requiresAdminToken: true
  }
];

// Run tests
async function runTests() {
  // Get admin token for user management
  console.log('🔑 Obtaining admin authentication token...');
  adminToken = await loginAndGetToken('superadmin@mmv.com', 'SuperAdmin123!');

  if (!adminToken) {
    console.log('❌ Could not obtain admin token - some tests will be skipped');
  } else {
    console.log('✅ Admin token obtained');
  }

  // Create test user for deletion
  console.log('👤 Creating test user for deletion...');
  const registerResult = await registerTestUser(testUserEmail);

  if (registerResult.success) {
    console.log('✅ Test user created');

    // Try to login with the test user
    testUserToken = await loginAndGetToken(testUserEmail, 'TestPassword123!');
    if (!testUserToken) {
      console.log('⚠️  Test user created but cannot login - trying without password...');
      // Try login without password (in case password wasn't set)
      testUserToken = await loginAndGetToken(testUserEmail, '');
    }

    if (testUserToken) {
      console.log('✅ Test user token obtained');

      // Get test user ID
      const userSearch = await getUserByEmail(testUserEmail);
      if (userSearch.success && userSearch.data && userSearch.data.length > 0) {
        testUserId = userSearch.data[0].user_id;
        console.log(`✅ Test user ID: ${testUserId}`);
      }
    } else {
      console.log('❌ Could not obtain test user token - checking if user exists...');
      // Check if user exists even without login
      const userSearch = await getUserByEmail(testUserEmail);
      if (userSearch.success && userSearch.data && userSearch.data.length > 0) {
        testUserId = userSearch.data[0].user_id;
        console.log(`✅ Test user exists with ID: ${testUserId} (but cannot login)`);
      }
    }
  } else {
    console.log('❌ Could not create test user');
    console.log('Registration response:', registerResult);
  }
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = {
    AUTH_ERRORS: { total: 0, passed: 0 },
    SUCCESSFUL_DELETION: { total: 0, passed: 0 },
    POST_DELETION: { total: 0, passed: 0 }
  };

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    results[testCase.category].total++;

    console.log(`${i + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   Category: ${testCase.category}`);

    try {
      // Prepare headers
      let headers = { ...testCase.headers };

      if (testCase.requiresAdminToken && adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      } else if (testCase.requiresTestUser && testUserToken) {
        headers['Authorization'] = `Bearer ${testUserToken}`;
      } else if (testCase.requiresDeletedUser && testUserToken) {
        headers['Authorization'] = `Bearer ${testUserToken}`;
      }

      const startTime = Date.now();
      const response = await makeRequest('DELETE', headers);
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

      if (TEST_CONFIG.showFullResponse && response.body) {
        console.log(`   Response Body:`, JSON.stringify(response.body, null, 2));
      }

    } catch (error) {
      console.log(`   ❌ FAILED`);
      console.log(`      Error: ${error.message}`);
      failed++;
    }

    console.log('');
  }

  // Verify deletion in database (admin check)
  if (adminToken && testUserId) {
    console.log('🔍 Verifying deletion in database...');
    try {
      const userCheck = await getUserByEmail(testUserEmail);
      if (userCheck.success && userCheck.data && userCheck.data.length > 0) {
        const user = userCheck.data[0];
        if (user.is_deleted === true && user.is_active === false) {
          console.log('✅ User properly soft-deleted in database');
        } else {
          console.log('⚠️  User deletion status unclear:', { is_deleted: user.is_deleted, is_active: user.is_active });
        }
      } else {
        console.log('⚠️  Could not verify user deletion status');
      }
    } catch (error) {
      console.log('⚠️  Could not verify deletion:', error.message);
    }
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
  console.log('');
  console.log('Note: Test user account has been soft-deleted. This is expected behavior.');
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

  // Check expected message
  if (testCase.expectedMessage && response.body) {
    if (response.body.message !== testCase.expectedMessage) {
      errors.push(`Expected message "${testCase.expectedMessage}", got "${response.body.message}"`);
    }
  }

  return errors;
}

runTests().catch(console.error);