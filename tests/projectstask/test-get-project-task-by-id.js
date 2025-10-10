#!/usr/bin/env node

/**
 * Project Task Get By ID API Test
 * Tests the GET /projectsTask/getprojects_taskbyid/:id endpoint
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
      email: 'superadmin@mmv.com',
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
 * Test getting project task by ID
 */
async function testGetProjectTaskById() {
  printSection('PROJECT TASK GET BY ID TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 3;
    return;
  }

  // Test 1: Get existing project task
  try {
    const projectId = 23; // From public listing, this project exists

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getprojects_taskbyid/${projectId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && response.body?.projects;
    printTestResult(
      'Get existing project task',
      passed,
      passed ? 'Project task retrieved successfully' : `Expected 200 with projects data, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get existing project task',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Get non-existing project task
  try {
    const nonExistentId = 99999;

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getprojects_taskbyid/${nonExistentId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 404; // Should get 404 for non-existent project
    printTestResult(
      'Get non-existing project task',
      passed,
      passed ? 'Correctly returned 404 for non-existent project' : `Expected 404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get non-existing project task',
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
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getprojects_taskbyid/${invalidId}`,
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
  console.log('🧪 Testing Project Task Get By ID API\n');

  await testGetProjectTaskById();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});