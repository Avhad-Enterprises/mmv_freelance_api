#!/usr/bin/env node

/**
 * Get My Roles API Test
 *
 * Tests the /users/me/roles endpoint (GET method) for retrieving user roles
 */

const https = require('https');
const http = require('http');
const { CONFIG } = require('../test-utils');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';
const ENDPOINT = '/users/me/roles';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

console.log('👥 Get My Roles API Test');
console.log('========================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT} (GET)`);
console.log('');

// Test variables
let adminToken = null;
let adminRoles = null;

let originalUserData = null; // Store original data to restore later

// Helper function to make HTTP request
function makeRequest(method = 'GET', headers = {}, data = null) {
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

// Test cases
const TEST_CASES = [
  // ============== AUTHENTICATION ERRORS ==============
  {
    name: "No Authorization Header",
    description: "Test without Authorization header",
    headers: {},
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

  // ============== SUCCESSFUL ROLE RETRIEVAL ==============
  {
    name: "Get Admin Roles",
    description: "Test retrieving roles for super admin user",
    headers: {}, // Will be set dynamically with admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "SUCCESSFUL_RETRIEVAL",
    requiresAdminToken: true,
    checkRoles: true,
    expectedRoleNames: ['SUPER_ADMIN'] // Super admin should have SUPER_ADMIN role
  },

  // ============== RESPONSE STRUCTURE ==============
  {
    name: "Validate Role Structure",
    description: "Test that role objects have correct structure",
    headers: {}, // Will be set dynamically with admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "RESPONSE_VALIDATION",
    requiresAdminToken: true,
    validateRoleStructure: true
  },

  // ============== EDGE CASES ==============
  {
    name: "User With Multiple Roles",
    description: "Test user with multiple roles (if applicable)",
    headers: {}, // Will be set dynamically with admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "EDGE_CASES",
    requiresAdminToken: true,
    checkMultipleRoles: true
  },

  {
    name: "Empty Roles Array",
    description: "Test handling of users with no roles (edge case)",
    headers: {}, // Will be set dynamically with admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "EDGE_CASES",
    requiresAdminToken: true,
    allowEmptyRoles: true
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

    // Get admin roles for reference
    try {
      const rolesResponse = await makeRequest('GET', { 'Authorization': `Bearer ${adminToken}` });
      if (rolesResponse.body && rolesResponse.body.success && rolesResponse.body.data && rolesResponse.body.data.roles) {
        adminRoles = rolesResponse.body.data.roles;
        console.log(`✅ Admin has ${adminRoles.length} role(s):`, adminRoles.map(r => r.name).join(', '));
      }
    } catch (error) {
      console.log('⚠️  Could not retrieve admin roles');
    }
  }
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = {
    AUTH_ERRORS: { total: 0, passed: 0 },
    SUCCESSFUL_RETRIEVAL: { total: 0, passed: 0 },
    RESPONSE_VALIDATION: { total: 0, passed: 0 },
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
      const response = await makeRequest('GET', headers);
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

  // Additional validation for successful responses
  if (testCase.expectedStatus === 200 && response.body && response.body.success && response.body.data) {
    const data = response.body.data;

    // Check roles field exists
    if (!('roles' in data)) {
      errors.push('Missing roles field in response data');
    } else {
      const roles = data.roles;

      // Check roles is an array
      if (!Array.isArray(roles)) {
        errors.push('Roles field should be an array');
      } else {
        // Validate role structure
        if (testCase.validateRoleStructure) {
          for (let i = 0; i < roles.length; i++) {
            const role = roles[i];
            const requiredFields = ['role_id', 'name', 'label'];
            for (const field of requiredFields) {
              if (!(field in role)) {
                errors.push(`Role ${i} missing required field: ${field}`);
              }
            }
          }
        }

        // Check expected roles
        if (testCase.checkRoles && testCase.expectedRoleNames) {
          const roleNames = roles.map(r => r.name);
          for (const expectedRole of testCase.expectedRoleNames) {
            if (!roleNames.includes(expectedRole)) {
              errors.push(`Expected role "${expectedRole}" not found in user roles: [${roleNames.join(', ')}]`);
            }
          }
        }

        // Check multiple roles
        if (testCase.checkMultipleRoles && roles.length < 1) {
          errors.push('Expected user to have at least one role');
        }

        // Check empty roles handling
        if (testCase.allowEmptyRoles && roles.length === 0) {
          // This is allowed, no error
        } else if (!testCase.allowEmptyRoles && roles.length === 0) {
          errors.push('User should have at least one role');
        }
      }
    }
  }

  return errors;
}

runTests().catch(console.error);