#!/usr/bin/env node

/**
 * Project Task Get By Client API Test
 * Tests the GET /projectsTask/client/:client_id endpoint
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
 * Test getting projects by client
 */
async function testGetProjectsByClient() {
  printSection('PROJECT TASK GET BY CLIENT TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 3;
    return;
  }

  // Test 1: Get projects for existing client
  try {
    const clientId = 2; // Use client ID 2 (super admin's client profile)

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/client/${clientId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && Array.isArray(response.body?.data);
    printTestResult(
      'Get projects for existing client',
      passed,
      passed ? 'Projects retrieved successfully' : `Expected 200 with data array, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get projects for existing client',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Get projects for non-existing client
  try {
    const nonExistentClientId = 99999;

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/client/${nonExistentClientId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && Array.isArray(response.body?.data) && response.body.data.length === 0; // Should return empty array
    printTestResult(
      'Get projects for non-existing client',
      passed,
      passed ? 'Returned empty array for non-existing client' : `Expected 200 with empty array, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get projects for non-existing client',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 3: Invalid client ID format
  try {
    const invalidClientId = 'abc';

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/client/${invalidClientId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400 || response.statusCode === 404; // Should get validation error
    printTestResult(
      'Invalid client ID format',
      passed,
      passed ? 'Properly handled invalid client ID format' : `Expected 400/404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Invalid client ID format',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 4: Missing authentication
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/client/2`,
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
  console.log('🧪 Testing Project Task Get By Client API\n');

  await testGetProjectsByClient();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});