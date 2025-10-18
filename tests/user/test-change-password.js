#!/usr/bin/env node

/**
 * Change Password API Test
 *
 * Tests the /users/change-password endpoint (POST method) for password changes
 */

const https = require('https');
const http = require('http');
const { CONFIG } = require('../test-utils');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users/change-password';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('🔐 Change Password API Test');
console.log('===========================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT} (POST)`);
console.log('');

// Test variables
let adminToken = null;
let originalPassword = 'SuperAdmin123!';

let testUserToken = null;
let testUserId = null;
let testUserEmail = `test-password-${Date.now()}@example.com`;
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
      user_type: 'client'
    });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/register/client',
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

// Test cases
const TEST_CASES = [
  // ============== AUTHENTICATION ERRORS ==============
  {
    name: "No Authorization Header",
    description: "Test without Authorization header",
    headers: {},
    data: {
      old_password: "currentpass",
      new_password: "newpass123"
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
      old_password: "currentpass",
      new_password: "newpass123"
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
      old_password: "currentpass",
      new_password: "newpass123"
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  // ============== VALIDATION ERRORS ==============
  {
    name: "Missing Old Password",
    description: "Test with missing old_password field",
    headers: {}, // Will be set dynamically with admin token
    data: {
      new_password: "newpass123"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresAdminToken: true
  },

  {
    name: "Missing New Password",
    description: "Test with missing new_password field",
    headers: {}, // Will be set dynamically with admin token
    data: {
      old_password: "SuperAdmin123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresAdminToken: true
  },

  {
    name: "Empty Request Body",
    description: "Test with empty request body",
    headers: {}, // Will be set dynamically with admin token
    data: {},
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresAdminToken: true
  },

  {
    name: "Password Too Short",
    description: "Test with password shorter than 6 characters",
    headers: {}, // Will be set dynamically with admin token
    data: {
      old_password: "SuperAdmin123!",
      new_password: "12345"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresAdminToken: true
  },

  // ============== BUSINESS LOGIC ERRORS ==============
  {
    name: "Incorrect Old Password",
    description: "Test with wrong old password",
    headers: {}, // Will be set dynamically with admin token
    data: {
      old_password: "WrongPassword123!",
      new_password: "NewPassword123!"
    },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "BUSINESS_ERRORS",
    requiresAdminToken: true,
    expectedMessage: "Current password is incorrect"
  },

  // ============== SUCCESSFUL PASSWORD CHANGE ==============
  {
    name: "Successful Password Change",
    description: "Test successful password change with correct old password",
    headers: {}, // Will be set dynamically with admin token
    data: {
      old_password: "SuperAdmin123!",
      new_password: "NewPassword123!"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "SUCCESSFUL_CHANGE",
    requiresAdminToken: true,
    expectedMessage: "Password changed successfully",
    changesPassword: true
  },

  // ============== POST-CHANGE VERIFICATION ==============
  {
    name: "Login with New Password",
    description: "Verify that login works with the new password",
    headers: {}, // Will be set dynamically with admin token
    data: {
      old_password: "NewPassword123!",
      new_password: "FinalPassword123!"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "VERIFICATION",
    requiresAdminToken: true,
    expectedMessage: "Password changed successfully",
    verifyLogin: true,
    newPassword: "FinalPassword123!"
  },

  // ============== EDGE CASES ==============
  {
    name: "Same Old and New Password",
    description: "Test changing to the same password",
    headers: {}, // Will be set dynamically with admin token
    data: {
      old_password: "FinalPassword123!",
      new_password: "FinalPassword123!"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "EDGE_CASES",
    requiresAdminToken: true,
    expectedMessage: "Password changed successfully"
  },

  {
    name: "Complex Password",
    description: "Test with complex password containing special characters",
    headers: {}, // Will be set dynamically with admin token
    data: {
      old_password: "FinalPassword123!",
      new_password: "C0mpl3x!P@ssw0rd#2025$"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "EDGE_CASES",
    requiresAdminToken: true,
    expectedMessage: "Password changed successfully"
  }
];

// Run tests
async function runTests() {
  // Get admin token for testing
  console.log('🔑 Obtaining admin authentication token...');
  adminToken = await loginAndGetToken('avhadenterprisespc5@gmail.com', 'SuperAdmin123!');

  if (!adminToken) {
    console.log('❌ Could not obtain admin token - authenticated tests will fail');
  } else {
    console.log('✅ Admin token obtained');
  }
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = {
    AUTH_ERRORS: { total: 0, passed: 0 },
    VALIDATION_ERRORS: { total: 0, passed: 0 },
    BUSINESS_ERRORS: { total: 0, passed: 0 },
    SUCCESSFUL_CHANGE: { total: 0, passed: 0 },
    VERIFICATION: { total: 0, passed: 0 },
    EDGE_CASES: { total: 0, passed: 0 }
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
      }

      const startTime = Date.now();
      const response = await makeRequest('POST', headers, testCase.data);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   Response Time: ${duration}ms`);
      console.log(`   Status: ${response.statusCode}`);

      const validationErrors = validateResponse(testCase, response);

      if (validationErrors.length === 0) {
        console.log(`   ✅ PASSED`);
        passed++;
        results[testCase.category].passed++;

        // Handle password changes for subsequent tests
        if (testCase.changesPassword) {
          console.log(`   🔄 Password changed - updating for next tests`);
        }

        // Verify login with new password if requested
        if (testCase.verifyLogin && testCase.newPassword) {
          console.log(`   🔍 Verifying login with new password...`);
          const newToken = await loginAndGetToken('superadmin@mmv.com', testCase.newPassword);
          if (newToken) {
            adminToken = newToken; // Update token for subsequent tests
            console.log(`   ✅ Login verification successful`);
          } else {
            console.log(`   ❌ Login verification failed`);
          }
        }

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

  // Restore original password at the end
  if (adminToken) {
    console.log('🔄 Restoring original admin password...');
    try {
      const restoreResponse = await makeRequest('POST',
        { 'Authorization': `Bearer ${adminToken}` },
        {
          old_password: "C0mpl3x!P@ssw0rd#2025$",
          new_password: originalPassword
        }
      );

      if (restoreResponse.statusCode === 200) {
        console.log('✅ Original password restored');
      } else {
        console.log('⚠️  Could not restore original password');
      }
    } catch (error) {
      console.log('⚠️  Error restoring password:', error.message);
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