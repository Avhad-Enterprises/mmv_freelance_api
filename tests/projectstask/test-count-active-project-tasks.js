#!/usr/bin/env node

/**
 * Project Task Count API Test
 * Tests the GET /projects-tasks/count endpoint with various query parameters
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
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
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
 * Test counting project tasks with different parameters
 */
async function testCountProjectTasks() {
  printSection('PROJECT TASK COUNT TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 6;
    return;
  }

  // Test 1: Get count of active project tasks
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/count?type=active`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && typeof response.body?.count === 'number' && response.body?.type === 'active';
    printTestResult(
      'Get active project tasks count',
      passed,
      passed ? 'Active count retrieved successfully' : `Expected 200 with count and type, got ${response.statusCode}. Body: ${JSON.stringify(response.body)}`,
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

  // Test 2: Get count of all project tasks
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/count?type=all`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && typeof response.body?.count === 'number' && response.body?.type === 'all';
    printTestResult(
      'Get all project tasks count',
      passed,
      passed ? 'All count retrieved successfully' : `Expected 200 with count and type, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get all project tasks count',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 3: Get count of completed project tasks
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/count?type=completed`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && typeof response.body?.count === 'number' && response.body?.type === 'completed';
    printTestResult(
      'Get completed project tasks count',
      passed,
      passed ? 'Completed count retrieved successfully' : `Expected 200 with count and type, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get completed project tasks count',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 4: Get count by client ID
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/count?client_id=1`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && response.body?.success === true && typeof response.body?.projects_count === 'number' && response.body?.client_id === 1;
    printTestResult(
      'Get project count by client ID',
      passed,
      passed ? 'Client count retrieved successfully' : `Expected 200 with success and projects_count, got ${response.statusCode}. Body: ${JSON.stringify(response.body)}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get project count by client ID',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 5: Get count by editor ID
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/count?freelancer_id=1`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && response.body?.success === true && typeof response.body?.shortlisted_count === 'number' && response.body?.freelancer_id === 1;
    printTestResult(
      'Get project count by editor ID',
      passed,
      passed ? 'Editor count retrieved successfully' : `Expected 200 with success and shortlisted_count, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get project count by editor ID',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 6: Missing authentication
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/count?type=active`,
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
  console.log('🧪 Testing Project Task Count API\n');

  await testCountProjectTasks();

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