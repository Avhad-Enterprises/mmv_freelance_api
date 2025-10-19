#!/usr/bin/env node

/**
 * SEO Update API Test
 * Tests the PUT /seos/:id endpoint
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
 * Test updating SEO entries
 */
async function testUpdateSeo() {
  printSection('Testing Update SEO');

  // First create a test SEO entry
  console.log('📝 Creating a test SEO entry first...');
  const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/seos`, {
    meta_title: 'Original SEO Title',
    meta_description: 'Original meta description'
  }, authHeader('superAdmin'));

  if (createResponse.statusCode !== 201) {
    console.log('❌ Failed to create test SEO entry');
    return;
  }

  testSeoId = createResponse.body.data.id;
  console.log(`✅ Test SEO created with ID: ${testSeoId}`);

  // Test 1: Update SEO without auth
  console.log('\nTest 1: Update SEO without authentication');
  console.log('📤 Request: PUT /seos/' + testSeoId);
  console.log('📦 Body:', { meta_title: 'Updated Title' });
  console.log('🔑 Auth: None');

  const response1 = await makeRequest('PUT', `${CONFIG.apiVersion}/seos/${testSeoId}`, {
    meta_title: 'Updated Title'
  });

  const test1Passed = response1.statusCode === 401;
  printTestResult('Update SEO without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Update SEO with valid data
  console.log('\nTest 2: Update SEO with valid data');
  console.log('📤 Request: PUT /seos/' + testSeoId);
  console.log('�� Body:', {
    meta_title: 'Updated SEO Title',
    meta_description: 'Updated meta description',
    canonical_url: 'https://example.com/updated-page'
  });
  console.log('🔑 Auth: Bearer token (super admin)');

  const response2 = await makeRequest('PUT', `${CONFIG.apiVersion}/seos/${testSeoId}`, {
    meta_title: 'Updated SEO Title',
    meta_description: 'Updated meta description',
    canonical_url: 'https://example.com/updated-page'
  }, authHeader('superAdmin'));

  const test2Passed = response2.statusCode === 200 && response2.body?.data;
  printTestResult('Update SEO with valid data', test2Passed, `Status: ${response2.statusCode}, Expected: 200`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Update SEO with invalid data
  console.log('\nTest 3: Update SEO with invalid data (empty title)');
  console.log('📤 Request: PUT /seos/' + testSeoId);
  console.log('📦 Body:', { meta_title: '' });
  console.log('🔑 Auth: Bearer token (super admin)');

  const response3 = await makeRequest('PUT', `${CONFIG.apiVersion}/seos/${testSeoId}`, {
    meta_title: ''
  }, authHeader('superAdmin'));

  const test3Passed = response3.statusCode === 400;
  printTestResult('Update SEO with invalid data', test3Passed, `Status: ${response3.statusCode}, Expected: 400`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Update non-existent SEO
  console.log('\nTest 4: Update non-existent SEO');
  console.log('📤 Request: PUT /seos/999999');
  console.log('📦 Body:', { meta_title: 'Test Title' });
  console.log('🔑 Auth: Bearer token (super admin)');

  const response4 = await makeRequest('PUT', `${CONFIG.apiVersion}/seos/999999`, {
    meta_title: 'Test Title'
  }, authHeader('superAdmin'));

  const test4Passed = response4.statusCode === 404;
  printTestResult('Update non-existent SEO', test4Passed, `Status: ${response4.statusCode}, Expected: 404`, response4);
  if (test4Passed) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SEO UPDATE API TESTS');
  console.log('========================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without super admin authentication');
    process.exit(1);
  }

  // Run tests
  await testUpdateSeo();

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
