#!/usr/bin/env node

/**
 * SEO Get by ID API Test
 * Tests the GET /seos/:id endpoint
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
let testSeoId = null;

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
 * Test: Get SEO by ID (GET /api/v1/seos/:id)
 */
/**
 * Test getting SEO by ID
 */
async function testGetSeoById() {
  printSection('Testing Get SEO by ID');

  // First create a test SEO entry
  console.log('� Creating a test SEO entry first...');
  const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/seos`, {
    meta_title: 'Test SEO for GetById',
    meta_description: 'This is a test SEO entry for get by ID testing'
  }, authHeader('superAdmin'));

  if (createResponse.statusCode !== 201) {
    console.log('❌ Failed to create test SEO entry');
    return;
  }

  testSeoId = createResponse.body.data.id;
  console.log(`✅ Test SEO created with ID: ${testSeoId}`);

  // Test 1: Get SEO by ID without auth
  console.log('\nTest 1: Get SEO by ID without authentication');
  console.log('📤 Request: GET /seos/' + testSeoId);
  console.log('🔑 Auth: None');

  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/seos/${testSeoId}`);

  console.log('� Response Status:', response1.statusCode);
  console.log('� Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Get SEO by ID without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Get SEO by ID with valid auth
  console.log('\nTest 2: Get SEO by ID with valid authentication');
  console.log('📤 Request: GET /seos/' + testSeoId);
  console.log('� Auth: Bearer token (super admin)');

  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/seos/${testSeoId}`, null, authHeader('superAdmin'));

  console.log('� Response Status:', response2.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

  const test2Passed = response2.statusCode === 200 && response2.body?.data;
  printTestResult('Get SEO by ID with auth', test2Passed, `Status: ${response2.statusCode}, Expected: 200`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Get SEO by ID with non-existent ID
  console.log('\nTest 3: Get SEO by ID with non-existent ID');
  console.log('📤 Request: GET /seos/999999');
  console.log('� Auth: Bearer token (super admin)');

  const response3 = await makeRequest('GET', `${CONFIG.apiVersion}/seos/999999`, null, authHeader('superAdmin'));

  console.log('� Response Status:', response3.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response3.body, null, 2));

  const test3Passed = response3.statusCode === 404;
  printTestResult('Get SEO by ID not found', test3Passed, `Status: ${response3.statusCode}, Expected: 404`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Verify response structure
  if (test2Passed && response2.body?.data) {
    console.log('\nTest 4: Verify response structure');
    const data = response2.body.data;
    const hasValidStructure = data.hasOwnProperty('id') &&
                             data.hasOwnProperty('meta_title') &&
                             data.hasOwnProperty('meta_description');

    const test4Passed = hasValidStructure;
    printTestResult('Verify response structure', test4Passed, `Valid structure: ${hasValidStructure}`, { data });
    if (test4Passed) passedTests++; else failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SEO GET BY ID API TESTS');
  console.log('==========================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without super admin authentication');
    process.exit(1);
  }

  // Run tests
  await testGetSeoById();

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