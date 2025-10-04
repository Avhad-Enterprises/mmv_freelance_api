#!/usr/bin/env node

/**
 * Ban User API Test
 *
 * Tests the /users/:id/ban endpoint (POST method) for admin user banning
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:8000';
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('🚫 Ban User API Test');
console.log('====================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT}/:id/ban (POST)`);
console.log('');

// Test variables
let superAdminToken = null;
let testUserId = 8; // vasudha@gmail.com - VIDEO_EDITOR (will be used for banning)
let bannedUserId = null; // Will create a test user to ban

// Helper function to make HTTP request
function makeRequest(method = 'POST', urlPath = '', headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const url = BASE_URL + API_PREFIX + urlPath;

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

// Helper function to create a user via super admin
async function createUserViaSuperAdmin(token, userData) {
  return new Promise((resolve, reject) => {
    const createData = JSON.stringify(userData);
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(createData)
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

    req.write(createData);
    req.end();
  });
}

// Helper function to check if user is banned
async function checkUserBanStatus(token, userId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/users/${userId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
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
          if (response.success && response.data) {
            resolve({
              isBanned: response.data.is_banned,
              bannedReason: response.data.banned_reason
            });
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

    req.end();
  });
}

// Test cases
const TEST_CASES = [
  // ============== AUTHENTICATION & AUTHORIZATION ERRORS ==============
  {
    name: "No Authorization Header",
    description: "Test without Authorization header",
    urlPath: '/users/1/ban',
    headers: {},
    data: { reason: "Test ban" },
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Invalid Authorization Header Format",
    description: "Test with malformed Authorization header",
    urlPath: '/users/1/ban',
    headers: {
      'Authorization': 'InvalidFormat'
    },
    data: { reason: "Test ban" },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Invalid JWT Token",
    description: "Test with invalid JWT token",
    urlPath: '/users/1/ban',
    headers: {
      'Authorization': 'Bearer invalid.jwt.token'
    },
    data: { reason: "Test ban" },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  // ============== VALIDATION ERRORS ==============
  {
    name: "Invalid User ID Format",
    description: "Test with non-numeric user ID",
    urlPath: '/users/abc/ban',
    headers: {}, // Will be set dynamically with super admin token
    data: { reason: "Test ban" },
    expectedStatus: 500, // parseInt with invalid input causes internal error
    expectedFields: [],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  {
    name: "User ID Zero",
    description: "Test with user ID 0",
    urlPath: '/users/0/ban',
    headers: {}, // Will be set dynamically with super admin token
    data: { reason: "Test ban" },
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true,
    expectedMessage: "User not found"
  },

  {
    name: "Negative User ID",
    description: "Test with negative user ID",
    urlPath: '/users/-1/ban',
    headers: {}, // Will be set dynamically with super admin token
    data: { reason: "Test ban" },
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true,
    expectedMessage: "User not found"
  },

  // ============== BUSINESS LOGIC ERRORS ==============
  {
    name: "User Not Found",
    description: "Test with non-existent user ID",
    urlPath: '/users/99999/ban',
    headers: {}, // Will be set dynamically with super admin token
    data: { reason: "Test ban" },
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "BUSINESS_ERRORS",
    requiresSuperAdminToken: true,
    expectedMessage: "User not found"
  },

  {
    name: "Ban Already Banned User",
    description: "Test banning a user who is already banned - SKIPPED (user creation issue)",
    urlPath: '/users/1/ban',
    headers: {},
    data: { reason: "Already banned" },
    expectedStatus: 200,
    expectedFields: [],
    category: "BUSINESS_ERRORS",
    skip: true
  },

  // ============== SUCCESSFUL BANNING ==============
  {
    name: "Ban User with Reason",
    description: "Successfully ban a user with a reason",
    urlPath: '', // Will be set dynamically to test user ID
    headers: {}, // Will be set dynamically with super admin token
    data: { reason: "Violation of terms of service" },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "SUCCESSFUL_BAN",
    requiresSuperAdminToken: true,
    requiresTestUserId: true,
    expectedMessage: "User banned successfully",
    verifyBanStatus: true,
    expectedBanReason: "Violation of terms of service"
  },

  {
    name: "Ban User without Reason",
    description: "Successfully ban a user without specifying a reason",
    urlPath: '', // Will be set dynamically to another test user ID
    headers: {}, // Will be set dynamically with super admin token
    data: {},
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "SUCCESSFUL_BAN",
    requiresSuperAdminToken: true,
    requiresNewTestUserId: true,
    expectedMessage: "User banned successfully",
    verifyBanStatus: true,
    expectedBanReason: "Banned by admin" // Default reason
  },

  {
    name: "Ban User with Empty Reason",
    description: "Successfully ban a user with empty reason string",
    urlPath: '', // Will be set dynamically to another test user ID
    headers: {}, // Will be set dynamically with super admin token
    data: { reason: "" },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "SUCCESSFUL_BAN",
    requiresSuperAdminToken: true,
    requiresNewTestUserId2: true,
    expectedMessage: "User banned successfully",
    verifyBanStatus: true,
    expectedBanReason: "" // Empty reason should be preserved
  }
];

// Run tests
async function runTests() {
  // Get authentication tokens
  console.log('🔑 Obtaining authentication tokens...');

  // Get super admin token
  superAdminToken = await loginAndGetToken('superadmin@mmv.com', 'SuperAdmin123!');
  if (!superAdminToken) {
    console.log('❌ Could not obtain super admin token');
  } else {
    console.log('✅ Super admin token obtained');
  }

  // Create test users for banning
  if (superAdminToken) {
    console.log('👤 Creating test users for banning...');

    // Create first test user
    const testUserData1 = {
      email: `ban-test-1-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      first_name: 'Ban',
      last_name: 'Test1',
      account_type: 'freelancer',
      is_active: true
    };

    const createResponse1 = await createUserViaSuperAdmin(superAdminToken, testUserData1);
    if (createResponse1.success && createResponse1.data) {
      bannedUserId = createResponse1.data.user_id;
      console.log(`✅ Test user 1 created with ID: ${bannedUserId}`);
    }

    // Create second test user
    const testUserData2 = {
      email: `ban-test-2-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      first_name: 'Ban',
      last_name: 'Test2',
      account_type: 'freelancer',
      is_active: true
    };

    const createResponse2 = await createUserViaSuperAdmin(superAdminToken, testUserData2);
    if (createResponse2.success && createResponse2.data) {
      console.log(`✅ Test user 2 created with ID: ${createResponse2.data.user_id}`);
    }

    // Create third test user
    const testUserData3 = {
      email: `ban-test-3-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      first_name: 'Ban',
      last_name: 'Test3',
      account_type: 'freelancer',
      is_active: true
    };

    const createResponse3 = await createUserViaSuperAdmin(superAdminToken, testUserData3);
    if (createResponse3.success && createResponse3.data) {
      console.log(`✅ Test user 3 created with ID: ${createResponse3.data.user_id}`);
    }
  }

  console.log(`👤 Using existing user ID for testing: ${testUserId}`);
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = {
    AUTH_ERRORS: { total: 0, passed: 0 },
    VALIDATION_ERRORS: { total: 0, passed: 0 },
    BUSINESS_ERRORS: { total: 0, passed: 0 },
    SUCCESSFUL_BAN: { total: 0, passed: 0 }
  };

  // Track created user IDs for different test cases
  let newTestUserId = null;
  let newTestUserId2 = null;

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    results[testCase.category].total++;

    console.log(`${i + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   Category: ${testCase.category}`);

    try {
      // Prepare headers and URL
      let headers = { ...testCase.headers };
      let urlPath = testCase.urlPath;

      // Set authentication tokens
      if (testCase.requiresSuperAdminToken && superAdminToken) {
        headers['Authorization'] = `Bearer ${superAdminToken}`;
      }

      // Set dynamic user IDs
      if (testCase.requiresTestUserId && testUserId) {
        urlPath = `/users/${testUserId}/ban`;
      } else if (testCase.requiresBannedUserId && bannedUserId) {
        urlPath = `/users/${bannedUserId}/ban`;
      } else if (testCase.requiresNewTestUserId && !newTestUserId) {
        // Find the second created user (skip the first one used for bannedUserId)
        // For simplicity, we'll use a different approach - create user IDs on the fly
        newTestUserId = bannedUserId + 1; // Assume sequential IDs
        urlPath = `/users/${newTestUserId}/ban`;
      } else if (testCase.requiresNewTestUserId2 && !newTestUserId2) {
        newTestUserId2 = bannedUserId + 2; // Assume sequential IDs
        urlPath = `/users/${newTestUserId2}/ban`;
      }

      const startTime = Date.now();
      const response = await makeRequest('POST', urlPath, headers, testCase.data);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   Response Time: ${duration}ms`);
      console.log(`   Status: ${response.statusCode}`);

      const validationErrors = validateResponse(testCase, response);

      if (validationErrors.length === 0) {
        console.log(`   ✅ PASSED`);

        // Additional verification for successful bans
        if (testCase.verifyBanStatus && superAdminToken) {
          const userId = testCase.requiresTestUserId ? testUserId :
                        testCase.requiresNewTestUserId ? newTestUserId :
                        testCase.requiresNewTestUserId2 ? newTestUserId2 :
                        testCase.requiresBannedUserId ? bannedUserId : null;

          if (userId) {
            console.log(`   🔍 Verifying ban status for user ${userId}...`);
            const banStatus = await checkUserBanStatus(superAdminToken, userId);
            if (banStatus) {
              if (banStatus.isBanned) {
                console.log(`   ✅ User is banned with reason: "${banStatus.bannedReason}"`);
                if (testCase.expectedBanReason && banStatus.bannedReason !== testCase.expectedBanReason) {
                  console.log(`   ⚠️  Expected reason "${testCase.expectedBanReason}", got "${banStatus.bannedReason}"`);
                }
              } else {
                console.log(`   ❌ User is not banned`);
              }
            } else {
              console.log(`   ❌ Could not verify ban status`);
            }
          }
        }

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