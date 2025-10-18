#!/usr/bin/env node

/**
 * Saved Project Get All API Test
 * Tests the GET /saved/listsave endpoint (Admin only)
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
 * Login and get admin token
 */
async function loginAsClient() {
  try {
    console.log('🔐 Logging in as client...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('client', response.body.data.token);
      console.log('✅ Client token stored');
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
 * Login and get admin token
 */
async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

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
 * Test getting all saved projects
 */
async function testGetAllSaved() {
  printSection('Testing Get All Saved Projects (Admin Only)');

  // Test 1: Get all saved projects without auth
  console.log('Test 1: Get all saved projects without authentication');
  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/saved/listsave`);

  const test1Passed = response1.statusCode === 401;
  printTestResult('Get all saved without auth', test1Passed, `Status: ${response1.statusCode}`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Get all saved projects with client auth (should fail)
  console.log('\nTest 2: Get all saved projects with client authentication');
  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/saved/listsave`, null, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const test2Passed = response2.statusCode === 403 || response2.statusCode === 401;
  printTestResult('Get all saved with client auth', test2Passed, `Status: ${response2.statusCode}`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Get all saved projects with admin auth
  console.log('\nTest 3: Get all saved projects with admin authentication');
  const response3 = await makeRequest('GET', `${CONFIG.apiVersion}/saved/listsave`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const test3Passed = response3.statusCode === 200 && response3.body?.success === true;
  printTestResult('Get all saved with admin auth', test3Passed, `Status: ${response3.statusCode}`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Verify response structure
  if (test3Passed && response3.body?.data) {
    console.log('\nTest 4: Verify response structure');
    const data = response3.body.data;
    const isArray = Array.isArray(data);
    const hasValidStructure = isArray && data.every(item =>
      item.hasOwnProperty('user_id') &&
      item.hasOwnProperty('projects_task_id')
    );

    const test4Passed = isArray && hasValidStructure;
    printTestResult('Verify response structure', test4Passed, `Array: ${isArray}, Valid items: ${hasValidStructure}`, { dataLength: data.length, sampleItem: data[0] });
    if (test4Passed) passedTests++; else failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SAVED PROJECT GET ALL API TESTS');
  console.log('=====================================\n');

  // Login as both client and admin
  const clientLoginSuccess = await loginAsClient();
  const adminLoginSuccess = await loginAsAdmin();

  if (!clientLoginSuccess || !adminLoginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Run tests
  await testGetAllSaved();

  // Print summary
  printSummary(passedTests, failedTests, passedTests + failedTests);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };