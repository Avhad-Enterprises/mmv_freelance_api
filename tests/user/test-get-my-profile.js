#!/usr/bin/env node

/**
 * Get My Profile API Test
 *
 * Tests the /users/me endpoint (requires authentication)
 */

const https = require('https');
const http = require('http');

// Import configuration from test-utils
const { CONFIG } = require('../test-utils');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = CONFIG.apiVersion;
const ENDPOINT = '/users/me';

const TEST_CONFIG = {
  baseUrl: BASE_URL,
  endpoint: ENDPOINT,
  timeout: 10000,
  showFullResponse: false,
};

// Test user credentials (we'll need to create one or use existing)
let testToken = null;

console.log('👤 Get My Profile API Test');
console.log('===========================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${API_PREFIX}${ENDPOINT}`);
console.log('');

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
    expectedStatus: 401, // Auth middleware returns 401 for missing token
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

  {
    name: "Expired JWT Token",
    description: "Test with expired JWT token",
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcl9pZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZXMiOlsiQ0xJRU5UIl0sImlhdCI6MTYwOTQ2NzIwMCwiZXhwIjoxNjA5NDY3MjAwfQ.invalid'
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTH_ERRORS"
  },

  // ============== VALID AUTHENTICATED REQUESTS ==============
  {
    name: "Valid Authenticated Request",
    description: "Test with valid JWT token",
    headers: {}, // Will be set dynamically with valid token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "VALID_REQUESTS",
    requiresToken: true
  },

  // ============== MALFORMED REQUESTS ==============
  {
    name: "Wrong HTTP Method",
    description: "Test with POST instead of GET",
    method: 'POST',
    headers: {}, // Will be set dynamically with valid token
    expectedStatus: 404, // Route not found for POST
    expectedFields: ['success', 'message'],
    category: "MALFORMED_REQUESTS",
    requiresToken: true
  },

  // ============== SECURITY TESTS ==============
  {
    name: "SQL Injection in Token",
    description: "Test SQL injection in Authorization header",
    headers: {
      'Authorization': 'Bearer "; DROP TABLE users; --"'
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  },

  {
    name: "XSS in Token",
    description: "Test XSS injection in Authorization header",
    headers: {
      'Authorization': 'Bearer <script>alert("xss")</script>'
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "SECURITY_TESTS"
  }
];

// Run tests
async function runTests() {
  // First, try to get a valid token for authenticated tests
  console.log('🔑 Attempting to obtain authentication token...');
  testToken = await loginAndGetToken('avhadenterprisespc5@gmail.com', 'SuperAdmin123!');

  if (testToken) {
    console.log('✅ Authentication token obtained');
  } else {
    console.log('⚠️  Could not obtain authentication token - some tests may fail');
  }
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = {
    AUTH_ERRORS: { total: 0, passed: 0 },
    VALID_REQUESTS: { total: 0, passed: 0 },
    MALFORMED_REQUESTS: { total: 0, passed: 0 },
    SECURITY_TESTS: { total: 0, passed: 0 }
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
      const response = await makeRequest(testCase.method || 'GET', headers);
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

  // Additional validation for successful profile requests
  if (testCase.expectedStatus === 200 && response.body && response.body.success) {
    const data = response.body.data;
    if (!data) {
      errors.push('Missing data field in successful response');
    } else if (!data.user) {
      errors.push('Missing user field in profile data');
    } else {
      // Check for essential user fields
      const requiredFields = ['user_id', 'email', 'first_name', 'last_name'];
      for (const field of requiredFields) {
        if (!(field in data.user)) {
          errors.push(`Missing required user field: ${field}`);
        }
      }
    }
  }

  return errors;
}

runTests().catch(console.error);