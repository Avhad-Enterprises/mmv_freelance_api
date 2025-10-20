#!/usr/bin/env node

/**
 * Update Basic Info API Test
 *
 * Tests the /users/me endpoint (PATCH method) for updating user information
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

console.log('📝 Update Basic Info API Test');
console.log('==============================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT} (PATCH)`);
console.log('');

// Test user credentials (we'll need to create one or use existing)
let testToken = null;

let originalUserData = null; // Store original data to restore later

// Helper function to make HTTP request
function makeRequest(method = 'PATCH', headers = {}, data = null) {
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
    data: { first_name: "John" },
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
    data: { first_name: "John" },
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
    data: { first_name: "John" },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  // ============== VALIDATION ERRORS ==============
  {
    name: "Empty Request Body",
    description: "Test with empty request body",
    headers: {}, // Will be set dynamically with valid token
    data: {},
    expectedStatus: 200, // Empty body should be allowed (all fields optional)
    expectedFields: ['success', 'message', 'data'],
    category: "VALIDATION_TESTS",
    requiresToken: true
  },

  {
    name: "Invalid Email Format",
    description: "Test with invalid email format",
    headers: {}, // Will be set dynamically with valid token
    data: { email: "invalid-email" },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresToken: true
  },

  {
    name: "Invalid URL Format",
    description: "Test with invalid profile picture URL",
    headers: {}, // Will be set dynamically with valid token
    data: { profile_picture: "not-a-url" },
    expectedStatus: 400,
    expectedFields: ['success', 'message'],
    category: "VALIDATION_ERRORS",
    requiresToken: true
  },

  // ============== SUCCESSFUL UPDATES ==============
  {
    name: "Update First Name Only",
    description: "Test updating only first name",
    headers: {}, // Will be set dynamically with valid token
    data: { first_name: "UpdatedFirstName" },
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'data'],
    category: "SUCCESSFUL_UPDATES",
    requiresToken: true,
    checkField: 'first_name',
    expectedValue: "UpdatedFirstName"
  },

  {
    name: "Update Last Name Only",
    description: "Test updating only last name",
    headers: {}, // Will be set dynamically with valid token
    data: { last_name: "UpdatedLastName" },
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'data'],
    category: "SUCCESSFUL_UPDATES",
    requiresToken: true,
    checkField: 'last_name',
    expectedValue: "UpdatedLastName"
  },

  {
    name: "Update Email",
    description: "Test updating email address",
    headers: {}, // Will be set dynamically with valid token
    data: { email: "updated@example.com" },
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'data'],
    category: "SUCCESSFUL_UPDATES",
    requiresToken: true,
    checkField: 'email',
    expectedValue: "updated@example.com"
  },

  {
    name: "Update Phone Number",
    description: "Test updating phone number",
    headers: {}, // Will be set dynamically with valid token
    data: { phone_number: "+1234567890" },
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'data'],
    category: "SUCCESSFUL_UPDATES",
    requiresToken: true,
    checkField: 'phone_number',
    expectedValue: "+1234567890"
  },

  {
    name: "Update Multiple Fields",
    description: "Test updating multiple fields at once",
    headers: {}, // Will be set dynamically with valid token
    data: {
      first_name: "Multi",
      last_name: "Update",
      city: "New City",
      country: "New Country"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'data'],
    category: "SUCCESSFUL_UPDATES",
    requiresToken: true,
    checkFields: {
      first_name: "Multi",
      last_name: "Update",
      city: "New City",
      country: "New Country"
    }
  },

  {
    name: "Update Boolean Fields",
    description: "Test updating boolean fields",
    headers: {}, // Will be set dynamically with valid token
    data: {
      phone_verified: true,
      email_verified: false,
      email_notifications: false
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'data'],
    category: "SUCCESSFUL_UPDATES",
    requiresToken: true,
    checkFields: {
      phone_verified: true,
      email_verified: false,
      email_notifications: false
    }
  },

  // ============== SECURITY TESTS ==============
  {
    name: "SQL Injection Attempt",
    description: "Test SQL injection in first_name field",
    headers: {}, // Will be set dynamically with valid token
    data: { first_name: "'; DROP TABLE users; --" },
    expectedStatus: 200, // Should succeed as it's just a string field
    expectedFields: ['success', 'message', 'data'],
    category: "SECURITY_TESTS",
    requiresToken: true
  },

  {
    name: "XSS Attempt",
    description: "Test XSS injection in bio field",
    headers: {}, // Will be set dynamically with valid token
    data: { bio: "<script>alert('xss')</script>" },
    expectedStatus: 200, // Should succeed as it's just a string field
    expectedFields: ['success', 'message', 'data'],
    category: "SECURITY_TESTS",
    requiresToken: true
  },

  // ============== EDGE CASES ==============
  {
    name: "Very Long Strings",
    description: "Test with extremely long string values",
    headers: {}, // Will be set dynamically with valid token
    data: {
      first_name: "A".repeat(200),
      last_name: "B".repeat(200),
      bio: "C".repeat(1000)
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'data'],
    category: "EDGE_CASES",
    requiresToken: true
  },

  {
    name: "Unicode Characters",
    description: "Test with unicode characters",
    headers: {}, // Will be set dynamically with valid token
    data: {
      first_name: "José",
      last_name: "Müller",
      city: "São Paulo"
    },
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'data'],
    category: "EDGE_CASES",
    requiresToken: true
  }
];

// Run tests
async function runTests() {
  // First, try to get a valid token for authenticated tests
  console.log('🔑 Attempting to obtain authentication token...');
  testToken = await loginAndGetToken('testadmin@example.com', 'TestAdmin123!');

  if (testToken) {
    console.log('✅ Authentication token obtained');

    // Get original user data for restoration later
    try {
      const profileResponse = await makeRequest('GET', { 'Authorization': `Bearer ${testToken}` });
      if (profileResponse.body && profileResponse.body.success && profileResponse.body.data && profileResponse.body.data.user) {
        originalUserData = profileResponse.body.data.user;
        console.log('✅ Original user data stored for restoration');
      }
    } catch (error) {
      console.log('⚠️  Could not retrieve original user data');
    }
  } else {
    console.log('❌ Could not obtain authentication token - authenticated tests will fail');
  }
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = {
    AUTH_ERRORS: { total: 0, passed: 0 },
    VALIDATION_ERRORS: { total: 0, passed: 0 },
    VALIDATION_TESTS: { total: 0, passed: 0 },
    SUCCESSFUL_UPDATES: { total: 0, passed: 0 },
    SECURITY_TESTS: { total: 0, passed: 0 },
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

      if (testCase.requiresToken && testToken) {
        headers['Authorization'] = `Bearer ${testToken}`;
      }

      const startTime = Date.now();
      const response = await makeRequest('PATCH', headers, testCase.data);
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

  // Restore original user data if we have it
  if (originalUserData && testToken) {
    console.log('🔄 Restoring original user data...');
    try {
      const restoreData = {
        first_name: originalUserData.first_name,
        last_name: originalUserData.last_name,
        email: originalUserData.email,
        phone_number: originalUserData.phone_number,
        city: originalUserData.city,
        country: originalUserData.country
      };

      await makeRequest('PATCH', { 'Authorization': `Bearer ${testToken}` }, restoreData);
      console.log('✅ Original user data restored');
    } catch (error) {
      console.log('⚠️  Could not restore original user data');
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

  // Additional validation for successful updates
  if (testCase.expectedStatus === 200 && response.body && response.body.success && response.body.data) {
    const data = response.body.data;

    // Check single field update
    if (testCase.checkField && testCase.expectedValue) {
      if (data[testCase.checkField] !== testCase.expectedValue) {
        errors.push(`Field ${testCase.checkField} not updated correctly. Expected: ${testCase.expectedValue}, Got: ${data[testCase.checkField]}`);
      }
    }

    // Check multiple field updates
    if (testCase.checkFields) {
      for (const [field, expectedValue] of Object.entries(testCase.checkFields)) {
        if (data[field] !== expectedValue) {
          errors.push(`Field ${field} not updated correctly. Expected: ${expectedValue}, Got: ${data[field]}`);
        }
      }
    }
  }

  return errors;
}

runTests().catch(console.error);