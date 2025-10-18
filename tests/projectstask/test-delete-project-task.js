#!/usr/bin/env node

/**
 * Project Task Delete API Test
 * Tests the DELETE /projectsTask/delete/:id endpoint
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
 * Test deleting project task
 */
async function testDeleteProjectTask() {
  printSection('PROJECT TASK DELETE TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 3;
    return;
  }

  // Test 1: Delete existing project task
  try {
    const projectId = 5; // Use the project ID we created in insert test

    const response = await makeRequest(
      'DELETE',
      `${CONFIG.apiVersion}/projectsTask/delete/${projectId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` } // Use stored token
    );

    const passed = response.statusCode === 200 && response.body?.message;
    printTestResult(
      'Delete existing project task',
      passed,
      passed ? 'Project task deleted successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Delete existing project task',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Delete non-existing project task
  try {
    const nonExistentId = 99999;

    const response = await makeRequest(
      'DELETE',
      `${CONFIG.apiVersion}/projectsTask/delete/${nonExistentId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 404; // Should get 404 for non-existent project
    printTestResult(
      'Delete non-existing project task',
      passed,
      passed ? 'Correctly returned 404 for non-existent project' : `Expected 404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Delete non-existing project task',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 3: Invalid ID format
  try {
    const invalidId = 'abc';

    const response = await makeRequest(
      'DELETE',
      `${CONFIG.apiVersion}/projectsTask/delete/${invalidId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400 || response.statusCode === 404; // Should get validation error
    printTestResult(
      'Invalid ID format',
      passed,
      passed ? 'Properly handled invalid ID format' : `Expected 400/404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Invalid ID format',
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
  console.log('🧪 Testing Project Task Delete API\n');

  await testDeleteProjectTask();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});