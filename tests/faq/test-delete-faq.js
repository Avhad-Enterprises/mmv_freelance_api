#!/usr/bin/env node

/**
 * FAQ Delete API Test
 * Tests the DELETE /faq endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  authHeader
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;
let adminToken = null;
let testFaqId = null;

/**
 * Test Delete FAQ
 */
async function testDeleteFaq() {
  printSection('Testing Delete FAQ');

  // Login as admin first
  try {
    console.log('🔐 Logging in as admin...');
    const loginResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'admin@test.com',
      password: 'Admin123!'
    });

    if (loginResponse.body?.data?.token) {
      adminToken = loginResponse.body.data.token;
      console.log('✅ Admin login successful');
    } else {
      console.log('⚠️  Admin login failed, admin tests will be skipped');
    }
  } catch (error) {
    console.log('⚠️  Admin login failed:', error.message);
  }

  // Create a test FAQ for deleting
  if (adminToken) {
    try {
      const faqData = {
        question: 'Test FAQ for deletion?',
        answer: 'This FAQ will be deleted in tests',
        type: 'test'
      };

      const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/faq`, faqData, authHeader('admin'));

      if (createResponse.body?.data?.faq_id) {
        testFaqId = createResponse.body.data.faq_id;
        console.log(`✅ Test FAQ created with ID: ${testFaqId}`);
      }
    } catch (error) {
      console.log('⚠️  Could not create test FAQ:', error.message);
    }
  }

  // Test 1: Delete FAQ without authentication
  if (testFaqId) {
    console.log('\nTest 1: Delete FAQ without authentication');
    console.log('📤 Request: DELETE /faq');
    console.log('🔑 Auth: None');

    const deleteData = {
      faq_id: testFaqId
    };

    const response1 = await makeRequest('DELETE', `${CONFIG.apiVersion}/faq`, deleteData);

    console.log('📥 Response Status:', response1.statusCode);

    const test1Passed = response1.statusCode === 401;
    printTestResult('Delete FAQ without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
    if (test1Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 1 - No test FAQ available');
  }

  // Test 2: Delete FAQ with valid admin authentication
  if (adminToken && testFaqId) {
    console.log('\nTest 2: Delete FAQ with valid admin authentication');
    console.log('📤 Request: DELETE /faq');
    console.log('🔑 Auth: Bearer token (admin)');

    const deleteData = {
      faq_id: testFaqId
    };

    const response2 = await makeRequest('DELETE', `${CONFIG.apiVersion}/faq`, deleteData, authHeader('admin'));

    console.log('📥 Response Status:', response2.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

    const test2Passed = response2.statusCode === 200 &&
                       response2.body?.success === true &&
                       response2.body?.data?.faq_id === testFaqId &&
                       response2.body?.data?.is_deleted === true;
    printTestResult('Delete FAQ with admin auth', test2Passed,
      `Status: ${response2.statusCode}, Expected: 200, FAQ soft deleted: ${!!response2.body?.data?.is_deleted}`, response2);
    if (test2Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 2 - No admin token or test FAQ available');
  }

  // Test 3: Verify deleted FAQ is not returned in get all
  if (adminToken && testFaqId) {
    console.log('\nTest 3: Verify deleted FAQ is not returned in get all');

    try {
      // Wait a moment for the delete to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response3 = await makeRequest('GET', `${CONFIG.apiVersion}/faq`);
      const faqIds = response3.body?.data?.map(faq => faq.faq_id) || [];

      const test3Passed = !faqIds.includes(testFaqId);
      printTestResult('Verify deleted FAQ not in get all', test3Passed,
        `Deleted FAQ ID ${testFaqId} not in results: ${test3Passed}`, response3);
      if (test3Passed) passedTests++; else failedTests++;
    } catch (error) {
      console.log('❌ FAIL Verify deleted FAQ not returned:', error.message);
      failedTests++;
    }
  } else {
    console.log('\n⚠️  SKIP: Test 3 - No admin token or test FAQ available');
  }

  // Test 4: Delete FAQ with invalid ID
  if (adminToken) {
    console.log('\nTest 4: Delete FAQ with invalid ID');
    console.log('📤 Request: DELETE /faq (invalid ID)');
    console.log('🔑 Auth: Bearer token (admin)');

    const deleteData = {
      faq_id: 999999
    };

    const response4 = await makeRequest('DELETE', `${CONFIG.apiVersion}/faq`, deleteData, authHeader('admin'));

    console.log('📥 Response Status:', response4.statusCode);

    const test4Passed = response4.statusCode === 404;
    printTestResult('Delete FAQ with invalid ID', test4Passed, `Status: ${response4.statusCode}, Expected: 404`, response4);
    if (test4Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 4 - No admin token available');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FAQ DELETE API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testDeleteFaq();

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