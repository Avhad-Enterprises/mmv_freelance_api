#!/usr/bin/env node

/**
 * Project Task Get All API Test
 * Tests the GET /projects-tasks endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  authHeader,
  storeToken,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get admin token
 */
async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    console.log('Login response:', response.statusCode, response.body);

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('admin', response.body.data.token);
      console.log('✅ Admin token stored');
      return true;
    }
    console.log('❌ Login failed');
    return false;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

/**
 * Test getting all project tasks
 */
async function testGetAllProjectTasks() {
  // Login as admin first
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without admin authentication');
    failedTests += 2; // Both tests will fail
    return;
  }

  printSection('PROJECT TASK GET ALL TESTS');

  // Test 1: Get all project tasks with admin authentication
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks`,
      null,
      authHeader('admin') // Requires admin authentication
    );

    const passed = response.statusCode === 200 && response.body?.success === true;
    printTestResult(
      'Get all project tasks with admin auth',
      passed,
      passed ? 'Successfully retrieved project tasks' : `Expected success, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get all project tasks with admin auth',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Access without authentication (should fail)
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks`,
      null,
      {} // No auth header
    );

    // NOTE: Currently failing due to authentication
    const passed = response.statusCode === 401; // Auth middleware returns 401
    printTestResult(
      'Access without authentication',
      passed,
      passed ? 'Correctly rejected unauthenticated request' : `Expected 401 auth error, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Access without authentication',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Testing Project Task Get All API\n');

  await testGetAllProjectTasks();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests
};
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});