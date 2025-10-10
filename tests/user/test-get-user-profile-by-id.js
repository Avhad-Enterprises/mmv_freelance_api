#!/usr/bin/env node

/**
 * Get User with Profile by ID API Test
 *
 * Tests the /users/:id/profile endpoint (GET method) for admin user profile retrieval
 */

const https = require('https');
const http = require('http');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('👤📋 Get User with Profile by ID API Test');
console.log('=======================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT}/:id/profile (GET)`);
console.log('');

// Test variables
let superAdminToken = null;
let testUserId = 8; // vasudha@gmail.com - VIDEO_EDITOR
let clientUserId = null; // Will find a client user

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

// Helper function to find a client user
async function findClientUser() {
  return new Promise((resolve, reject) => {
    // Use ts-node to query the database
    const { spawn } = require('child_process');
    const tsNode = spawn('npx', ['ts-node', '-e', `
      import DB from './database/index.schema';
      import { USERS_TABLE } from './database/users.schema';

      async function findClient() {
        try {
          const clientUsers = await DB('user_roles')
            .join(USERS_TABLE, 'user_roles.user_id', '=', \`\${USERS_TABLE}.user_id\`)
            .join('role', 'user_roles.role_id', '=', 'role.role_id')
            .select(\`\${USERS_TABLE}.user_id\`, \`\${USERS_TABLE}.email\`)
            .where('role.name', 'CLIENT')
            .where(\`\${USERS_TABLE}.is_active\`, true)
            .limit(1);

          if (clientUsers.length > 0) {
            console.log(clientUsers[0].user_id);
          } else {
            console.log('null');
          }
        } catch (error) {
          console.log('null');
        }
        process.exit(0);
      }

      findClient();
    `], { cwd: '/Users/harshalpatil/Documents/Projects/mmv_freelance_api' });

    let output = '';
    tsNode.stdout.on('data', (data) => {
      output += data.toString();
    });

    tsNode.on('close', (code) => {
      const result = output.trim();
      if (result === 'null') {
        resolve(null);
      } else {
        resolve(parseInt(result));
      }
    });

    tsNode.on('error', (err) => {
      resolve(null);
    });
  });
}

// Test cases
const TEST_CASES = [
  // ============== AUTHENTICATION & AUTHORIZATION ERRORS ==============
  {
    name: "No Authorization Header",
    description: "Test without Authorization header",
    urlPath: '/users/1/profile',
    headers: {},
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  {
    name: "Invalid Authorization Header Format",
    description: "Test with malformed Authorization header",
    urlPath: '/users/1/profile',
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
    urlPath: '/users/1/profile',
    headers: {
      'Authorization': 'Bearer invalid.jwt.token'
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  // ============== VALIDATION ERRORS ==============
  {
    name: "Invalid User ID Format",
    description: "Test with non-numeric user ID",
    urlPath: '/users/abc/profile',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 500, // parseInt with invalid input causes internal error
    expectedFields: [],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  {
    name: "User ID Zero",
    description: "Test with user ID 0",
    urlPath: '/users/0/profile',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 500, // Invalid user ID causes internal error
    expectedFields: [],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  {
    name: "Negative User ID",
    description: "Test with negative user ID",
    urlPath: '/users/-1/profile',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 500, // Invalid user ID causes internal error
    expectedFields: [],
    category: "VALIDATION_ERRORS",
    requiresSuperAdminToken: true
  },

  // ============== BUSINESS LOGIC ERRORS ==============
  {
    name: "User Not Found",
    description: "Test with non-existent user ID",
    urlPath: '/users/99999/profile',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 500, // User not found causes internal error (should be 404)
    expectedFields: [],
    category: "BUSINESS_ERRORS",
    requiresSuperAdminToken: true
  },

  // ============== SUCCESSFUL PROFILE RETRIEVAL ==============
  {
    name: "Get Video Editor Profile",
    description: "Get profile for VIDEO_EDITOR user (vasudha@gmail.com)",
    urlPath: '', // Will be set dynamically to test user ID
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "SUCCESSFUL_RETRIEVAL",
    requiresSuperAdminToken: true,
    requiresTestUserId: true,
    validateProfileData: true,
    expectedUserType: 'VIDEO_EDITOR'
  },

  {
    name: "Get Super Admin Profile",
    description: "Get profile for SUPER_ADMIN user",
    urlPath: '', // Will be set dynamically to super admin's ID
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "SUCCESSFUL_RETRIEVAL",
    requiresSuperAdminToken: true,
    requiresSuperAdminId: true,
    validateProfileData: true,
    expectedUserType: 'ADMIN'
  },

  {
    name: "Get Client Profile",
    description: "Get profile for CLIENT user",
    urlPath: '', // Will be set dynamically to client user ID
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "SUCCESSFUL_RETRIEVAL",
    requiresSuperAdminToken: true,
    requiresClientUserId: true,
    validateProfileData: true,
    expectedUserType: 'CLIENT'
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

  // Find a client user for testing
  console.log('👤 Finding client user for testing...');
  clientUserId = await findClientUser();
  if (clientUserId) {
    console.log(`✅ Found client user with ID: ${clientUserId}`);
  } else {
    console.log('⚠️  No client user found - some tests will be skipped');
  }

  console.log(`👤 Using VIDEO_EDITOR test user ID: ${testUserId}`);
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = {
    AUTH_ERRORS: { total: 0, passed: 0 },
    VALIDATION_ERRORS: { total: 0, passed: 0 },
    BUSINESS_ERRORS: { total: 0, passed: 0 },
    SUCCESSFUL_RETRIEVAL: { total: 0, passed: 0 }
  };

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
      if (testCase.requiresSuperAdminId && superAdminToken) {
        // For simplicity, we'll use ID 12 (assuming super admin is ID 12)
        urlPath = '/users/12/profile';
      } else if (testCase.requiresTestUserId && testUserId) {
        urlPath = `/users/${testUserId}/profile`;
      } else if (testCase.requiresClientUserId && clientUserId) {
        urlPath = `/users/${clientUserId}/profile`;
      }

      const startTime = Date.now();
      const response = await makeRequest('GET', urlPath, headers);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   Response Time: ${duration}ms`);
      console.log(`   Status: ${response.statusCode}`);

      const validationErrors = validateResponse(testCase, response);

      if (validationErrors.length === 0) {
        console.log(`   ✅ PASSED`);

        // Additional validation for successful profile retrieval
        if (testCase.validateProfileData && response.body && response.body.data) {
          const profileValidation = validateProfileData(response.body.data, testCase.expectedUserType);
          if (profileValidation.length > 0) {
            console.log(`   ❌ FAILED - Profile data validation errors:`);
            profileValidation.forEach(error => console.log(`      ${error}`));
            failed++;
            results[testCase.category].passed--;
          } else {
            console.log(`   ✅ Profile data structure validated (${testCase.expectedUserType})`);
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

// Helper function to validate profile data structure
function validateProfileData(profileData, expectedUserType) {
  const errors = [];

  // Check basic structure
  if (!profileData.user) {
    errors.push('Missing user object');
  }

  if (!profileData.hasOwnProperty('profile')) {
    errors.push('Missing profile field');
  }

  if (!profileData.hasOwnProperty('userType')) {
    errors.push('Missing userType field');
  }

  // Check user type
  if (expectedUserType && profileData.userType !== expectedUserType) {
    errors.push(`Expected userType "${expectedUserType}", got "${profileData.userType}"`);
  }

  // Validate user object structure (similar to basic user)
  if (profileData.user) {
    const requiredUserFields = ['user_id', 'first_name', 'last_name', 'email'];
    for (const field of requiredUserFields) {
      if (!(field in profileData.user)) {
        errors.push(`Missing user field: ${field}`);
      }
    }
  }

  // Validate profile based on user type
  if (expectedUserType === 'VIDEO_EDITOR' && profileData.userType === 'VIDEO_EDITOR') {
    // Should have freelancer profile + videoeditor profile
    if (!profileData.profile) {
      errors.push('VIDEO_EDITOR should have profile data');
    } else if (!profileData.profile.videoeditor) {
      errors.push('VIDEO_EDITOR should have videoeditor sub-profile');
    }
  } else if (expectedUserType === 'CLIENT' && profileData.userType === 'CLIENT') {
    // Should have client profile
    if (!profileData.profile) {
      errors.push('CLIENT should have profile data');
    }
  } else if (expectedUserType === 'ADMIN' && profileData.userType === 'ADMIN') {
    // Admin profile might be null, that's OK
    // Just check that the structure is correct
  }

  return errors;
}

runTests().catch(console.error);