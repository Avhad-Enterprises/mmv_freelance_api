const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';

// Test data
let superAdminToken = '';
let adminToken = '';
let regularUserToken = '';

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

// Test cases for GET /users
const testCases = [
  // Authentication Tests
  {
    name: "Get All Users Without Authentication",
    description: "Test getting all users without JWT token",
    urlPath: '/users',
    headers: {},
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "AUTHENTICATION",
    expectedMessage: "Authentication token missing"
  },
  {
    name: "Get All Users With Invalid Token",
    description: "Test getting all users with invalid JWT token",
    urlPath: '/users',
    headers: {
      'Authorization': 'Bearer invalid_token'
    },
    expectedStatus: 401,
    expectedFields: ['success', 'message'],
    category: "AUTHENTICATION",
    expectedMessage: "Auth Middleware Exception Occured"
  },
  {
    name: "Get All Users With Regular User Token",
    description: "Test getting all users with regular user token (should fail)",
    urlPath: '/users',
    headers: {}, // Will be set dynamically with regular user token
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "AUTHORIZATION",
    requiresRegularUserToken: true,
    expectedMessage: "Authentication token missing"
  },
  {
    name: "Get All Users With Admin Token",
    description: "Test getting all users with admin token (should fail - requires SUPER_ADMIN)",
    urlPath: '/users',
    headers: {}, // Will be set dynamically with admin token
    expectedStatus: 404,
    expectedFields: ['success', 'message'],
    category: "AUTHORIZATION",
    requiresAdminToken: true,
    expectedMessage: "Authentication token missing"
  },

  // Authorization Tests
  {
    name: "Get All Users With Super Admin Token",
    description: "Test getting all users with super admin token (should succeed)",
    urlPath: '/users',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "AUTHORIZATION",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination']
  },

  // Pagination Tests
  {
    name: "Get Users With Default Pagination",
    description: "Test getting users with default pagination (page=1, limit=10)",
    urlPath: '/users?page=1&limit=10',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "PAGINATION",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination'],
    validatePagination: true,
    expectedPagination: { page: 1, limit: 10 }
  },
  {
    name: "Get Users With Custom Pagination",
    description: "Test getting users with custom pagination (page=2, limit=5)",
    urlPath: '/users?page=2&limit=5',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "PAGINATION",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination'],
    validatePagination: true,
    expectedPagination: { page: 2, limit: 5 }
  },
  {
    name: "Get Users With Invalid Page",
    description: "Test getting users with invalid page parameter",
    urlPath: '/users?page=invalid&limit=10',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200, // Should default to page 1
    expectedFields: ['success', 'data'],
    category: "PAGINATION",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination'],
    validatePagination: true,
    expectedPagination: { page: 1, limit: 10 }
  },

  // Search Tests
  {
    name: "Search Users By Email",
    description: "Test searching users by email",
    urlPath: '/users?search=superadmin@mmv.com',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "SEARCH",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination'],
    validateSearch: true,
    expectedSearchTerm: 'superadmin@mmv.com'
  },
  {
    name: "Search Users By Name",
    description: "Test searching users by first name",
    urlPath: '/users?search=Super',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "SEARCH",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination'],
    validateSearch: true,
    expectedSearchTerm: 'Super'
  },
  {
    name: "Search Users No Results",
    description: "Test searching users with no matching results",
    urlPath: '/users?search=nonexistentuser12345',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "SEARCH",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination'],
    validateEmptySearch: true
  },

  // Role Filter Tests
  {
    name: "Filter Users By Role",
    description: "Test filtering users by role (SUPER_ADMIN)",
    urlPath: '/users?role=SUPER_ADMIN',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "FILTER",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination'],
    validateRoleFilter: true,
    expectedRole: 'SUPER_ADMIN'
  },

  // Data Structure Tests
  {
    name: "Validate User Data Structure",
    description: "Test that user data has correct structure and no passwords",
    urlPath: '/users?page=1&limit=1',
    headers: {}, // Will be set dynamically with super admin token
    expectedStatus: 200,
    expectedFields: ['success', 'data'],
    category: "DATA_STRUCTURE",
    requiresSuperAdminToken: true,
    expectedDataFields: ['users', 'pagination'],
    validateUserStructure: true
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

  return prepared;
}

// Validation helpers
function validatePagination(response, expected) {
  const pagination = response.body.data.pagination;
  return pagination.page === expected.page && pagination.limit === expected.limit;
}

function validateSearch(response, searchTerm) {
  const users = response.body.data.users;
  return users.some(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

function validateEmptySearch(response) {
  const users = response.body.data.users;
  return users.length === 0;
}

function validateRoleFilter(response, role) {
  const users = response.body.data.users;
  return users.every(user =>
    user.roles && user.roles.some(r => r.name === role)
  );
}

function validateUserStructure(response) {
  const users = response.body.data.users;
  if (users.length === 0) return true;

  const user = users[0];
  const requiredFields = ['user_id', 'email', 'first_name', 'last_name', 'roles'];
  const hasRequiredFields = requiredFields.every(field => field in user);
  const hasNoPassword = !('password' in user);

  return hasRequiredFields && hasNoPassword;
}

// Run tests
async function runTests() {
  console.log('🚀 Starting GET /users endpoint tests...\n');

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
        path: url.pathname + url.search,
        method: 'GET',
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

      // Check data fields
      let dataFieldsMatch = true;
      if (preparedTest.expectedDataFields && preparedTest.expectedDataFields.length > 0) {
        for (const field of preparedTest.expectedDataFields) {
          if (!response.body?.data || !(field in response.body.data)) {
            dataFieldsMatch = false;
            break;
          }
        }
        console.log(`📋 Data Fields: ${preparedTest.expectedDataFields.join(', ')} ${dataFieldsMatch ? '✅' : '❌'}`);
      }

      // Check message
      let messageMatch = true;
      if (preparedTest.expectedMessage) {
        messageMatch = response.body && response.body.message === preparedTest.expectedMessage;
        console.log(`💬 Message: "${response.body?.message}" (expected: "${preparedTest.expectedMessage}") ${messageMatch ? '✅' : '❌'}`);
      }

      // Custom validations
      let customValidations = true;

      if (preparedTest.validatePagination && response.status === 200) {
        customValidations = validatePagination(response, preparedTest.expectedPagination);
        console.log(`📄 Pagination: ${customValidations ? '✅' : '❌'}`);
      }

      if (preparedTest.validateSearch && response.status === 200) {
        customValidations = customValidations && validateSearch(response, preparedTest.expectedSearchTerm);
        console.log(`🔍 Search: ${customValidations ? '✅' : '❌'}`);
      }

      if (preparedTest.validateEmptySearch && response.status === 200) {
        customValidations = customValidations && validateEmptySearch(response);
        console.log(`🔍 Empty Search: ${customValidations ? '✅' : '❌'}`);
      }

      if (preparedTest.validateRoleFilter && response.status === 200) {
        customValidations = customValidations && validateRoleFilter(response, preparedTest.expectedRole);
        console.log(`🏷️ Role Filter: ${customValidations ? '✅' : '❌'}`);
      }

      if (preparedTest.validateUserStructure && response.status === 200) {
        customValidations = customValidations && validateUserStructure(response);
        console.log(`🏗️ User Structure: ${customValidations ? '✅' : '❌'}`);
      }

      const testPassed = statusMatch && fieldsMatch && dataFieldsMatch && messageMatch && customValidations;

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