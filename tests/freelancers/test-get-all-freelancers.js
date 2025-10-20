#!/usr/bin/env node

/**
 * Freelancers Get All API Test
 * Tests the GET /freelancers/getfreelancers endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  TOKENS,
  authHeader
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get super admin token
 */
async function loginAsSuperAdmin() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('superAdmin', response.body.data.token);
      printTestResult('Super admin login', true, 'SUCCESS', null);
      return true;
    } else {
      printTestResult('Super admin login', false, `Expected success, got ${response.statusCode}`, response.body);
      return false;
    }
  } catch (error) {
    printTestResult('Super admin login', false, `Request failed: ${error.message}`, null);
    return false;
  }
}

/**
 * Test Get All Freelancers (requires auth)
 */
async function testGetAllFreelancers() {
  printSection('Testing Get All Freelancers');

  // Test 1: Get all freelancers without auth
  console.log('Test 1: Get all freelancers without authentication');
  console.log('📤 Request: GET /freelancers/getfreelancers');
  console.log('🔑 Auth: None');

  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/freelancers/getfreelancers`);

  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Get all freelancers without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Get all freelancers with valid auth
  console.log('\nTest 2: Get all freelancers with valid authentication');
  console.log('📤 Request: GET /freelancers/getfreelancers');
  console.log('🔑 Auth: Bearer token (super admin)');

  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/freelancers/getfreelancers`, null, authHeader('superAdmin'));

  console.log('📥 Response Status:', response2.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

  const test2Passed = response2.statusCode === 200 && response2.body?.success === true;
  printTestResult('Get all freelancers with auth', test2Passed, `Status: ${response2.statusCode}, Expected: 200`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Verify response structure
  if (test2Passed && response2.body?.data) {
    console.log('\nTest 3: Verify response structure');
    const data = response2.body.data;
    const isArray = Array.isArray(data);
    const hasValidStructure = isArray && data.every(item =>
      item.hasOwnProperty('user_id') &&
      item.hasOwnProperty('first_name') &&
      item.hasOwnProperty('last_name') &&
      item.hasOwnProperty('email') &&
      item.hasOwnProperty('phone_number') &&
      item.hasOwnProperty('profile_title') &&
      item.hasOwnProperty('skills') &&
      item.hasOwnProperty('role_name')
    );

    const test3Passed = isArray && hasValidStructure && response2.body.count === data.length;
    printTestResult('Verify response structure', test3Passed, `Array: ${isArray}, Valid items: ${hasValidStructure}, Count matches: ${response2.body.count === data.length}`, {
      dataLength: data.length,
      expectedCount: response2.body.count,
      sampleItem: data[0]
    });
    if (test3Passed) passedTests++; else failedTests++;
  }

  // Test 4: Verify complete data (includes sensitive info)
  if (test2Passed && response2.body?.data) {
    console.log('\nTest 4: Verify complete data (includes email/phone)');
    const data = response2.body.data;
    const hasEmail = data.some(item => item.email);
    const hasPhone = data.some(item => item.phone_number);

    const test4Passed = hasEmail && hasPhone;
    printTestResult('Verify complete data', test4Passed, `Has email: ${hasEmail}, Has phone: ${hasPhone}`, null);
    if (test4Passed) passedTests++; else failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FREELANCERS GET ALL API TESTS');
  console.log('=================================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without super admin authentication');
    process.exit(1);
  }

  // Run tests
  await testGetAllFreelancers();

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