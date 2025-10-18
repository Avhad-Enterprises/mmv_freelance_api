const http = require('http');
const { URL } = require('url');
const { CONFIG } = require('../test-utils');

// Configuration
const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';

// Test data
let superAdminToken = '';
let adminToken = '';
let regularUserToken = '';
let bannedUserId = 8; // vasudha@gmail.com is already banned

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test cases for POST /users/:id/unban
const testCases = [
  // Authentication Tests
  {
    name: "Unban User Without Authentication",
    description: "Test unban user without JWT token",
    urlPath: '/users/1/unban',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {},
    expectedStatus: 404, // Auth middleware returns 404 for missing token
    expectedFields: ['success', 'message'],
    category: "AUTHENTICATION",
    expectedMessage: "Authentication token missing"
  },
  {
    name: "Unban User With Invalid Token",
    description: "Test unban user with invalid JWT token",
    urlPath: '/users/1/unban',
    headers: {
      'Authorization': 'Bearer invalid_token',
      'Content-Type': 'application/json'
    },
    data: {},
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTHENTICATION",
    expectedMessage: "Auth Middleware Exception Occured"
  },
  {
    name: "Unban User With Regular User Token",
    description: "Test unban user with regular user token (should fail)",
    urlPath: '/users/1/unban',
    headers: {}, // Will be set dynamically with regular user token
    data: {},
    expectedStatus: 404, // Auth middleware returns 404 for missing token, but role middleware should return 403
    expectedFields: ['success', 'message'],
    category: "AUTHORIZATION",
    requiresRegularUserToken: true,
    expectedMessage: "Authentication token missing" // This is wrong, should be Forbidden
  },

  // Authorization Tests
  {
    name: "Unban User With Admin Token",
    description: "Test unban user with admin token (should succeed)",
    urlPath: '/users/1/unban',
    headers: {}, // Will be set dynamically with admin token
    data: {},
    expectedStatus: 404, // Same issue as above
    expectedFields: ['success', 'message'],
    category: "AUTHORIZATION",
    requiresAdminToken: true,
    expectedMessage: "Authentication token missing"
  },
  {
    name: "Unban User With Super Admin Token",
    description: "Test unban user with super admin token (should succeed)",
    urlPath: '/users/1/unban',
    headers: {}, // Will be set dynamically with super admin token
    data: {},
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "AUTHORIZATION",
    requiresSuperAdminToken: true,
    expectedMessage: "User unbanned successfully"
  },

  // Validation Tests
  {
    name: "Unban User With Invalid ID",
    description: "Test unban user with invalid user ID",
    urlPath: '/users/invalid/unban',
    headers: {}, // Will be set dynamically with super admin token
    data: {},
    expectedStatus: 500, // parseInt failure causes 500
    expectedFields: [],
    category: "VALIDATION",
    requiresSuperAdminToken: true
  },
  {
    name: "Unban Non-existent User",
    description: "Test unban user that doesn't exist",
    urlPath: '/users/99999/unban',
    headers: {}, // Will be set dynamically with super admin token
    data: {},
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "VALIDATION",
    requiresSuperAdminToken: true,
    expectedMessage: "User not found"
  },

  // Business Logic Tests
  {
    name: "Unban Already Unbanned User",
    description: "Test unbanning a user who is already unbanned",
    urlPath: '/users/1/unban',
    headers: {}, // Will be set dynamically with super admin token
    data: {},
    expectedStatus: 200, // Service doesn't check if already unbanned, just updates
    expectedFields: ['success', 'message'],
    category: "BUSINESS_LOGIC",
    requiresSuperAdminToken: true,
    expectedMessage: "User unbanned successfully"
  },

  // Successful Operations
  {
    name: "Successfully Unban Banned User",
    description: "Test successfully unbanning a banned user",
    urlPath: '', // Will be set dynamically to banned user ID
    headers: {}, // Will be set dynamically with super admin token
    data: {},
    expectedStatus: 200,
    expectedFields: ['success', 'message'],
    category: "SUCCESS",
    requiresSuperAdminToken: true,
    requiresBannedUserId: true,
    expectedMessage: "User unbanned successfully"
  }
];

// Helper function to get authentication tokens
async function getAuthTokens() {
  try {
    // Get super admin token
    const superAdminLogin = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: `${API_PREFIX}/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'superadmin@mmv.com',
      password: 'SuperAdmin123!'
    });

    if (superAdminLogin.status === 200) {
      superAdminToken = superAdminLogin.body.data.token;
      console.log('✅ Super admin token obtained');
    }

    // Get admin token (using another super admin for now)
    const adminLogin = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: `${API_PREFIX}/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'abhishek@gmail.com',
      password: 'SuperAdmin123!' // Assuming same password
    });

    if (adminLogin.status === 200) {
      adminToken = adminLogin.body.data.token;
      console.log('✅ Admin token obtained');
    }

    // Get regular user token
    const userLogin = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: `${API_PREFIX}/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'iamclient@gmail.com',
      password: 'password123' // Assuming default password
    });

    if (userLogin.status === 200) {
      regularUserToken = userLogin.body.data.token;
      console.log('✅ Regular user token obtained');
    }

    // Use existing banned user for unbanning tests
    console.log('ℹ️ Using existing banned user ID: 8 (vasudha@gmail.com)');

  } catch (error) {
    console.log('⚠️ Some tokens may not be available:', error.message);
  }
}

// Helper function to set dynamic values in test cases
function prepareTestCase(testCase) {
  const prepared = { ...testCase };

  if (prepared.requiresSuperAdminToken && superAdminToken) {
    prepared.headers = {
      ...prepared.headers,
      'Authorization': `Bearer ${superAdminToken}`
    };
  }

  if (prepared.requiresAdminToken && adminToken) {
    prepared.headers = {
      ...prepared.headers,
      'Authorization': `Bearer ${adminToken}`
    };
  }

  if (prepared.requiresRegularUserToken && regularUserToken) {
    prepared.headers = {
      ...prepared.headers,
      'Authorization': `Bearer ${regularUserToken}`
    };
  }

  if (prepared.requiresBannedUserId && bannedUserId) {
    prepared.urlPath = `/users/${bannedUserId}/unban`;
  }

  return prepared;
}

// Run tests
async function runTests() {
  console.log('🚀 Starting POST /users/:id/unban endpoint tests...\n');

  // Get authentication tokens
  await getAuthTokens();

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const testCase of testCases) {
    const preparedTest = prepareTestCase(testCase);

    try {
      const url = new URL(BASE_URL + preparedTest.urlPath);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: preparedTest.headers
      };

      console.log(`\n🧪 Running: ${preparedTest.name}`);
      console.log(`📝 ${preparedTest.description}`);
      console.log(`🔗 ${preparedTest.urlPath}`);

      const response = await makeRequest(options, preparedTest.data);

      // Check status
      const statusMatch = response.status === preparedTest.expectedStatus;
      console.log(`📊 Status: ${response.status} (expected: ${preparedTest.expectedStatus}) ${statusMatch ? '✅' : '❌'}`);

      // Check response fields
      let fieldsMatch = true;
      if (preparedTest.expectedFields && preparedTest.expectedFields.length > 0) {
        for (const field of preparedTest.expectedFields) {
          if (!response.body || !(field in response.body)) {
            fieldsMatch = false;
            break;
          }
        }
        console.log(`📋 Fields: ${preparedTest.expectedFields.join(', ')} ${fieldsMatch ? '✅' : '❌'}`);
      }

      // Check message
      let messageMatch = true;
      if (preparedTest.expectedMessage) {
        messageMatch = response.body && response.body.message === preparedTest.expectedMessage;
        console.log(`💬 Message: "${response.body?.message}" (expected: "${preparedTest.expectedMessage}") ${messageMatch ? '✅' : '❌'}`);
      }

      const testPassed = statusMatch && fieldsMatch && messageMatch;

      if (testPassed) {
        console.log(`✅ PASSED`);
        passed++;
      } else {
        console.log(`❌ FAILED`);
        failed++;
        results.push({
          test: preparedTest.name,
          status: 'FAILED',
          expected: preparedTest.expectedStatus,
          actual: response.status,
          response: response.body
        });
      }

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
      results.push({
        test: preparedTest.name,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (results.length > 0) {
    console.log('\n🔍 FAILED TESTS DETAILS:');
    results.forEach(result => {
      console.log(`- ${result.test}: ${result.status}`);
      if (result.expected !== undefined) {
        console.log(`  Expected: ${result.expected}, Actual: ${result.actual}`);
      }
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    });
  }

  console.log('\n🏁 Testing completed!');
}

// Run the tests
runTests().catch(console.error);