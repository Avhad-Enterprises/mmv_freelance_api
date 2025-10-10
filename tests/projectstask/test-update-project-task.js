#!/usr/bin/env node

/**
 * Project Task Update API Test
 * Tests the PUT /projectsTask/updateprojects_taskbyid endpoint
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
 * Test updating project task
 */
async function testUpdateProjectTask() {
  printSection('PROJECT TASK UPDATE TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 3;
    return;
  }

  // Test 1: Valid update
  try {
    const updateData = {
      projects_task_id: 26, // Use the project ID we created in insert test
      project_title: "Updated Test Video Editing Project",
      budget: 6000.00,
      additional_notes: "Updated requirements"
    };

    const response = await makeRequest(
      'PUT',
      `${CONFIG.apiVersion}/projectsTask/updateprojects_taskbyid`,
      updateData,
      { Authorization: `Bearer ${TOKENS.admin}` } // Use stored token
    );

    const passed = response.statusCode === 200 && response.body?.message;
    printTestResult(
      'Valid project task update',
      passed,
      passed ? 'Project task updated successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Valid project task update',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Update non-existing project
  try {
    const updateData = {
      projects_task_id: 99999,
      project_title: "Non-existing project"
    };

    const response = await makeRequest(
      'PUT',
      `${CONFIG.apiVersion}/projectsTask/updateprojects_taskbyid`,
      updateData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 404; // Should get 404 for non-existent project
    printTestResult(
      'Update non-existing project',
      passed,
      passed ? 'Correctly returned 404 for non-existent project' : `Expected 404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Update non-existing project',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 3: Missing projects_task_id
  try {
    const updateData = {
      project_title: "Missing ID update"
    };

    const response = await makeRequest(
      'PUT',
      `${CONFIG.apiVersion}/projectsTask/updateprojects_taskbyid`,
      updateData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400; // Should get validation error
    printTestResult(
      'Missing projects_task_id',
      passed,
      passed ? 'Properly validated missing required field' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Missing projects_task_id',
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
  console.log('🧪 Testing Project Task Update API\n');

  await testUpdateProjectTask();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});