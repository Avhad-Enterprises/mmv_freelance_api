#!/usr/bin/env node

/**
 * Project Task Get By Client ID API Test
 * Tests the GET /projects-tasks/client/:clientId endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  TOKENS,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get client token
 */
async function loginAsClient() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('client', response.body.data.token);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Test getting project tasks by client ID
 */
async function testGetProjectsByClientId() {
  printSection('PROJECT TASK GET BY CLIENT ID TESTS');

  // Login first
  const loginSuccess = await loginAsClient();
  if (!loginSuccess) {
    console.log('❌ Failed to login as client');
    failedTests += 3;
    return;
  }

  // Test 1: Get projects by client ID with authentication
  try {
    const clientId = 1; // Assuming client ID 1 exists in test data
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/client/${clientId}`,
      null,
      { Authorization: `Bearer ${TOKENS.client}` }
    );

    const passed = response.statusCode === 200 && response.body?.success === true;
    printTestResult(
      'Get projects by client ID',
      passed,
      passed ? 'Projects retrieved successfully' : `Expected 200 with success, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get projects by client ID',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Access without authentication
  try {
    const clientId = 1;
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/client/${clientId}`
    );

    const passed = response.statusCode === 401;
    printTestResult(
      'Access without authentication',
      passed,
      passed ? 'Correctly rejected unauthenticated request' : `Expected 401, got ${response.statusCode}`,
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

  // Test 3: Invalid client ID (non-numeric)
  try {
    const invalidClientId = 'abc';
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/client/${invalidClientId}`,
      null,
      { Authorization: `Bearer ${TOKENS.client}` }
    );

    const passed = response.statusCode === 400; // Should return 400 for invalid ID
    printTestResult(
      'Invalid client ID (non-numeric)',
      passed,
      passed ? 'Correctly rejected invalid client ID' : `Expected 400 error, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Invalid client ID (non-numeric)',
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
  console.log('🧪 Testing Project Task Get By Client ID API\n');

  await testGetProjectsByClientId();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});