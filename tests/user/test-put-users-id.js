const http = require('http');
const { CONFIG } = require('../test-utils');

// Configuration
const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';

// Test data
const testUsers = {
  superAdmin: {
    email: 'superadmin@mmv.com',
    password: 'SuperAdmin123!'
  }
};

// Global variables
let superAdminToken = '';
let testUserId = null; // Will be set after creating a test user

// Helper functions
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
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
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

function validateResponse(response, expectedStatus, requiredFields = [], customValidators = []) {
  console.log(`📊 Status: ${response.status} (expected: ${expectedStatus}) ${response.status === expectedStatus ? '✅' : '❌'}`);

  if (response.status !== expectedStatus) {
    return false;
  }

  if (requiredFields.length > 0) {
    const missingFields = requiredFields.filter(field => !response.data || !(field in response.data));
    console.log(`📋 Fields: ${missingFields.length === 0 ? 'success, message, data' : missingFields.join(', ')} ${missingFields.length === 0 ? '✅' : '❌'}`);
    if (missingFields.length > 0) {
      return false;
    }
  }

  // Run custom validators
  for (const validator of customValidators) {
    if (!validator(response)) {
      return false;
    }
  }

  return true;
}

function validateUserData(user) {
  const requiredFields = ['user_id', 'email', 'first_name', 'last_name', 'username', 'is_active', 'created_at', 'updated_at'];
  const hasAllFields = requiredFields.every(field => field in user);
  const hasNoPassword = !('password' in user);

  console.log(`👤 User Data: ${hasAllFields ? '✅' : '❌'} | Password Hidden: ${hasNoPassword ? '✅' : '❌'}`);

  return hasAllFields && hasNoPassword;
}

async function loginAndGetToken(email, password) {
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/auth/login`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const response = await makeRequest(options, { email, password });

  if (response.status === 200 && response.data?.data?.token) {
    return response.data.data.token;
  }

  throw new Error('Failed to login');
}

// Create a test user for update operations
async function createTestUser() {
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`
    }
  };

  const userData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test.user.${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  const response = await makeRequest(options, userData);

  if (response.status === 201 && response.data?.data?.user_id) {
    testUserId = response.data.data.user_id;
    console.log(`✅ Test user created with ID: ${testUserId}`);
    return response.data.data;
  }

  throw new Error('Failed to create test user');
}

// Test functions
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Running: ${testName}`);
  try {
    const result = await testFunction();
    console.log(`${result ? '✅ PASSED' : '❌ FAILED'}`);
    return result;
  } catch (error) {
    console.log(`❌ FAILED - Error: ${error.message}`);
    return false;
  }
}

async function testUpdateUserWithoutAuth() {
  console.log(`📝 Test updating user without JWT token`);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users/1`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const updateData = {
    first_name: 'Updated'
  };

  const response = await makeRequest(options, updateData);
  return validateResponse(response, 404, ['success', 'message'], [
    (res) => {
      console.log(`💬 Message: "${res.data?.message}" (expected: "Authentication token missing") ${res.data?.message === 'Authentication token missing' ? '✅' : '❌'}`);
      return res.data?.message === 'Authentication token missing';
    }
  ]);
}

async function testUpdateUserWithInvalidToken() {
  console.log(`📝 Test updating user with invalid JWT token`);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users/1`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid_token'
    }
  };

  const updateData = {
    first_name: 'Updated'
  };

  const response = await makeRequest(options, updateData);
  return validateResponse(response, 401, ['success', 'message'], [
    (res) => {
      console.log(`💬 Message: "${res.data?.message}" (expected: "Auth Middleware Exception Occured") ${res.data?.message === 'Auth Middleware Exception Occured' ? '✅' : '❌'}`);
      return res.data?.message === 'Auth Middleware Exception Occured';
    }
  ]);
}

async function testUpdateUserWithSuperAdmin() {
  console.log(`📝 Test updating user with super admin token`);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users/${testUserId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`
    }
  };

  const updateData = {
    first_name: 'Updated',
    last_name: 'Name',
    phone_number: '+1234567890'
  };

  const response = await makeRequest(options, updateData);
  return validateResponse(response, 200, ['success', 'message', 'data'], [
    (res) => {
      console.log(`💬 Message: "${res.data?.message}" (expected: "User updated successfully") ${res.data?.message === 'User updated successfully' ? '✅' : '❌'}`);
      return res.data?.message === 'User updated successfully';
    },
    (res) => validateUserData(res.data?.data),
    (res) => {
      const user = res.data?.data;
      const isUpdated = user.first_name === 'Updated' && user.last_name === 'Name' && user.phone_number === '+1234567890';
      console.log(`🔄 Data Updated: ${isUpdated ? '✅' : '❌'}`);
      return isUpdated;
    }
  ]);
}

async function testUpdateUserPassword() {
  console.log(`📝 Test updating user password`);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users/${testUserId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`
    }
  };

  const updateData = {
    password: 'NewPassword123!'
  };

  const response = await makeRequest(options, updateData);
  return validateResponse(response, 200, ['success', 'message', 'data'], [
    (res) => {
      console.log(`💬 Message: "${res.data?.message}" (expected: "User updated successfully") ${res.data?.message === 'User updated successfully' ? '✅' : '❌'}`);
      return res.data?.message === 'User updated successfully';
    },
    (res) => validateUserData(res.data?.data)
  ]);
}

async function testUpdateUserEmail() {
  console.log(`📝 Test updating user email`);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users/${testUserId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`
    }
  };

  const updateData = {
    email: `updated.email.${Date.now()}@example.com`
  };

  const response = await makeRequest(options, updateData);
  return validateResponse(response, 200, ['success', 'message', 'data'], [
    (res) => {
      console.log(`💬 Message: "${res.data?.message}" (expected: "User updated successfully") ${res.data?.message === 'User updated successfully' ? '✅' : '❌'}`);
      return res.data?.message === 'User updated successfully';
    },
    (res) => validateUserData(res.data?.data),
    (res) => {
      const user = res.data?.data;
      const isEmailUpdated = user.email === updateData.email;
      console.log(`📧 Email Updated: ${isEmailUpdated ? '✅' : '❌'}`);
      return isEmailUpdated;
    }
  ]);
}

async function testUpdateUserNotFound() {
  console.log(`📝 Test updating non-existent user`);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users/99999`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`
    }
  };

  const updateData = {
    first_name: 'NonExistent'
  };

  const response = await makeRequest(options, updateData);
  return validateResponse(response, 404, ['success', 'message'], [
    (res) => {
      console.log(`💬 Message: "${res.data?.message}" (expected: "User not found") ${res.data?.message === 'User not found' ? '✅' : '❌'}`);
      return res.data?.message === 'User not found';
    }
  ]);
}

async function testUpdateUserEmptyData() {
  console.log(`📝 Test updating user with empty data`);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users/${testUserId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`
    }
  };

  const updateData = {}; // Empty object

  const response = await makeRequest(options, updateData);
  return validateResponse(response, 200, ['success', 'message', 'data'], [
    (res) => {
      console.log(`💬 Message: "${res.data?.message}" (expected: "User updated successfully") ${res.data?.message === 'User updated successfully' ? '✅' : '❌'}`);
      return res.data?.message === 'User updated successfully';
    },
    (res) => validateUserData(res.data?.data)
  ]);
}

async function testUpdateUserInvalidEmail() {
  console.log(`📝 Test updating user with invalid email`);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `${API_PREFIX}/users/${testUserId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`
    }
  };

  const updateData = {
    email: 'invalid-email'
  };

  const response = await makeRequest(options, updateData);
  return validateResponse(response, 400, ['success', 'message'], [
    (res) => {
      console.log(`💬 Message: "${res.data?.message}" (expected: validation error) ${res.data?.message && res.data.message.includes('email') ? '✅' : '❌'}`);
      return res.data?.message && res.data.message.includes('email');
    }
  ]);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting PUT /users/:id endpoint tests...\n');

  try {
    // Get super admin token
    superAdminToken = await loginAndGetToken(testUsers.superAdmin.email, testUsers.superAdmin.password);
    console.log('✅ Super admin token obtained\n');

    // Create a test user for update operations
    await createTestUser();
  } catch (error) {
    console.log('❌ Setup failed:', error.message);
    return;
  }

  const tests = [
    { name: 'Update User Without Authentication', func: testUpdateUserWithoutAuth },
    { name: 'Update User With Invalid Token', func: testUpdateUserWithInvalidToken },
    { name: 'Update User With Super Admin Token', func: testUpdateUserWithSuperAdmin },
    { name: 'Update User Password', func: testUpdateUserPassword },
    { name: 'Update User Email', func: testUpdateUserEmail },
    { name: 'Update User Not Found', func: testUpdateUserNotFound },
    { name: 'Update User Empty Data', func: testUpdateUserEmptyData },
    { name: 'Update User Invalid Email', func: testUpdateUserInvalidEmail }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await runTest(test.name, test.func);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n==================================================');
  console.log('📊 TEST SUMMARY');
  console.log('==================================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  console.log('\n🏁 Testing completed!');
}

// Run tests
runAllTests().catch(console.error);