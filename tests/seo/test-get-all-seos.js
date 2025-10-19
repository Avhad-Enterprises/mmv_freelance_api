#!/usr/bin/env node

/**
 * SEO Get All API Test
 * Tests the GET /seos endpoint
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
async function testGetAllSeos() {
  printSection('Testing Get All SEO');

  // Test 1: Get all SEO without auth
  console.log('Test 1: Get all SEO without authentication');
  console.log('� Request: GET /seos');
  console.log('🔑 Auth: None');

  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/seos`);

  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Get all SEO without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Get all SEO with valid auth
  console.log('\nTest 2: Get all SEO with valid authentication');
  console.log('📤 Request: GET /seos');
  console.log('� Auth: Bearer token (super admin)');

  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/seos`, null, authHeader('superAdmin'));

  console.log('� Response Status:', response2.statusCode);
  console.log('� Response Body:', JSON.stringify(response2.body, null, 2));

  const test2Passed = response2.statusCode === 200 && response2.body?.data;
  printTestResult('Get all SEO with auth', test2Passed, `Status: ${response2.statusCode}, Expected: 200`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Verify response structure
  if (test2Passed && response2.body?.data) {
    console.log('\nTest 3: Verify response structure');
    const data = response2.body.data;
    const isArray = Array.isArray(data);
    const hasValidStructure = isArray && data.every(item =>
      item.hasOwnProperty('id') &&
      item.hasOwnProperty('meta_title') &&
      item.hasOwnProperty('meta_description')
    );

    const test3Passed = isArray && hasValidStructure;
    printTestResult('Verify response structure', test3Passed, `Array: ${isArray}, Valid items: ${hasValidStructure}`, { dataLength: data.length, sampleItem: data[0] });
    if (test3Passed) passedTests++; else failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SEO GET ALL API TESTS');
  console.log('=========================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without super admin authentication');
    process.exit(1);
  }

  // Run tests
  await testGetAllSeos();

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