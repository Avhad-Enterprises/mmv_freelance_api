#!/usr/bin/env node

/**
 * User Routes Test
 * Tests for common user endpoints
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  getToken,
  authHeader,
  randomEmail,
  randomUsername,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;
let testUserToken = null;
let testUserId = null;

/**
 * Setup: Create a test user using super admin
 */
async function setupTestUser() {
  printSection('SETUP: Creating Test User');
  
  try {
    // First get super admin token
    const adminResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'avhadenterprisespc5@gmail.com',
      password: 'SuperAdmin123!'
    });
    
    if (adminResponse.statusCode !== 200 || !adminResponse.body.data?.token) {
      console.log('✗ Failed to get super admin token');
      return false;
    }
    
    const adminToken = adminResponse.body.data.token;
    
    // Create test user using super admin
    const email = randomEmail('user-test');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/users`, {
      first_name: 'Test',
      last_name: 'User',
      email: email,
      password: 'Password123!',
      roleName: 'CLIENT'
    }, { Authorization: `Bearer ${adminToken}` });
    
    if (response.statusCode === 201 && response.body.data) {
      testUserId = response.body.data.user_id;
      
      // Login as the test user to get token
      const loginResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
        email: email,
        password: 'Password123!'
      });
      
      if (loginResponse.statusCode === 200 && loginResponse.body.data?.token) {
        testUserToken = loginResponse.body.data.token;
        storeToken('testuser', testUserToken);
        console.log(`✓ Test user created: ${email}`);
        console.log(`  User ID: ${testUserId}`);
        return true;
      }
    }
    
    console.log('✗ Failed to create test user');
    return false;
  } catch (error) {
    console.log('✗ Setup failed:', error.message);
    return false;
  }
}

/**
 * Test get own profile
 */
async function testGetMyProfile() {
  printSection('GET MY PROFILE TESTS');
  
  // Test 1: Get profile with valid token
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/users/me`,
      null,
      { Authorization: `Bearer ${testUserToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get my profile with valid token',
      passed,
      passed ? 'Profile retrieved successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get my profile with valid token', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get profile without token
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/users/me`);
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Get my profile without token',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get my profile without token', false, error.message);
    failedTests++;
  }
  
  // Test 3: Get profile with invalid token
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/users/me`,
      null,
      { Authorization: 'Bearer invalid-token-12345' }
    );
    
    const passed = response.statusCode === 401;
    printTestResult(
      'Get my profile with invalid token',
      passed,
      passed ? 'Invalid token rejected' : `Expected 401, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get my profile with invalid token', false, error.message);
    failedTests++;
  }
}

/**
 * Test update profile
 */
async function testUpdateProfile() {
  printSection('UPDATE PROFILE TESTS');
  
  // Test 1: Update basic info with valid data
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/users/me`,
      {
        first_name: 'Updated',
        last_name: 'Name',
        bio: 'This is my updated bio',
        timezone: 'America/New_York',
      },
      { Authorization: `Bearer ${testUserToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Update profile with valid data',
      passed,
      passed ? 'Profile updated successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update profile with valid data', false, error.message);
    failedTests++;
  }
  
  // Test 2: Update with invalid email format
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/users/me`,
      {
        email: 'invalid-email-format',
      },
      { Authorization: `Bearer ${testUserToken}` }
    );
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Update profile with invalid email',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update profile with invalid email', false, error.message);
    failedTests++;
  }
  
  // Test 3: Update without authentication
  try {
    const response = await makeRequest('PATCH', `${CONFIG.apiVersion}/users/me`, {
      first_name: 'Should',
      last_name: 'Fail',
    });
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Update profile without authentication',
      passed,
      passed ? 'Unauthorized update rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update profile without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Test password change
 */
async function testChangePassword() {
  printSection('CHANGE PASSWORD TESTS');
  
  // Test 1: Change password with valid data
  try {
    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/users/change-password`,
      {
        old_password: 'Password123!',
        new_password: 'NewPassword123!',
      },
      { Authorization: `Bearer ${testUserToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Change password with valid credentials',
      passed,
      passed ? 'Password changed successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    if (passed) {
      passedTests++;
      // Change it back for other tests
      await makeRequest(
        'POST',
        `${CONFIG.apiVersion}/users/change-password`,
        {
          old_password: 'NewPassword123!',
          new_password: 'Password123!',
        },
        { Authorization: `Bearer ${testUserToken}` }
      );
    } else {
      failedTests++;
    }
  } catch (error) {
    printTestResult('Change password with valid credentials', false, error.message);
    failedTests++;
  }
  
  // Test 2: Change password with wrong old password
  try {
    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/users/change-password`,
      {
        old_password: 'WrongPassword123!',
        new_password: 'NewPassword123!',
      },
      { Authorization: `Bearer ${testUserToken}` }
    );
    
    const passed = response.statusCode === 400 || response.statusCode === 401;
    printTestResult(
      'Change password with wrong old password',
      passed,
      passed ? 'Wrong password rejected' : `Expected 400/401, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Change password with wrong old password', false, error.message);
    failedTests++;
  }
  
  // Test 3: Change password without authentication
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/users/change-password`, {
      old_password: 'Password123!',
      new_password: 'NewPassword123!',
    });
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Change password without authentication',
      passed,
      passed ? 'Unauthorized change rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Change password without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Test password reset flow
 */
async function testPasswordReset() {
  printSection('PASSWORD RESET TESTS');
  
  // Create a user for password reset testing
  const resetEmail = randomEmail('reset-test');
  await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
    first_name: 'Reset',
    last_name: 'Test',
    email: resetEmail,
    password: 'Password123!',
    username: randomUsername('reset'),
    company_name: 'Reset Test Company',
  });
  
  // Test 1: Request password reset with valid email
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/users/password-reset-request`, {
      email: resetEmail,
    });
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Request password reset with valid email',
      passed,
      passed ? 'Reset email sent' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Request password reset with valid email', false, error.message);
    failedTests++;
  }
  
  // Test 2: Request password reset with non-existent email
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/users/password-reset-request`, {
      email: 'nonexistent@test.com',
    });
    
    // Should still return 200 for security (don't reveal if email exists)
    const passed = response.statusCode === 200 || response.statusCode === 404;
    printTestResult(
      'Request password reset with non-existent email',
      passed,
      passed ? 'Request handled (security)' : `Expected 200/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Request password reset with non-existent email', false, error.message);
    failedTests++;
  }
  
  // Test 3: Request password reset with invalid email format
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/users/password-reset-request`, {
      email: 'invalid-email',
    });
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Request password reset with invalid email',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Request password reset with invalid email', false, error.message);
    failedTests++;
  }
}

/**
 * Test get user roles
 */
async function testGetUserRoles() {
  printSection('GET USER ROLES TESTS');
  
  // Test 1: Get own roles
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/users/me/roles`,
      null,
      { Authorization: `Bearer ${testUserToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get own roles',
      passed,
      passed ? `Roles retrieved: ${JSON.stringify(response.body.data)}` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get own roles', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get roles without authentication
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/users/me/roles`);
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Get roles without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get roles without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Run all user tests
 */
async function runTests() {
  console.log('\n👤 Starting User Route Tests...\n');
  console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);
  
  const setupSuccess = await setupTestUser();
  if (!setupSuccess) {
    console.log('\n❌ Setup failed. Cannot run tests.\n');
    process.exit(1);
  }
  
  await testGetMyProfile();
  await testUpdateProfile();
  await testChangePassword();
  await testPasswordReset();
  await testGetUserRoles();
  
  printSummary(passedTests, failedTests, passedTests + failedTests);
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
