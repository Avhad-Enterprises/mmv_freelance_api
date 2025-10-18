#!/usr/bin/env node

/**
 * Project Task Count Active API Test
 * Tests the GET /projectsTask/countactiveprojects_task endpoint
 */

const {
  CONFIG,
  TOKENS,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  authHeader,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get admin token
 */
async function loginAsAdmin() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'avhadenterprisespc5@gmail.com',
      password: 'SuperAdmin123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('admin', response.body.data.token);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Test counting active project tasks
 */
async function testCountActiveProjectTasks() {
  printSection('PROJECT TASK COUNT ACTIVE TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 2;
    return;
  }

  // Test 1: Get count of active project tasks
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/countactiveprojects_task`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && typeof response.body?.count === 'number';
    printTestResult(
      'Get active project tasks count',
      passed,
      passed ? 'Count retrieved successfully' : `Expected 200 with count, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get active project tasks count',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Missing authentication
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/countactiveprojects_task`,
      null,
      {} // No auth header
    );

    const passed = response.statusCode === 401; // Should get 401 for missing auth
    printTestResult(
      'Missing authentication',
      passed,
      passed ? 'Correctly returned 401 for missing authentication' : `Expected 401, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Missing authentication',
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
  console.log('🧪 Testing Project Task Count Active API\n');

  await testCountActiveProjectTasks();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});