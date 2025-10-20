#!/usr/bin/env node

/**
 * FAQ Update API Test
 * Tests the PUT /faq endpoint
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
 * Test Update FAQ
 */
async function testUpdateFaq() {
  printSection('Testing Update FAQ');

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

  // Create a test FAQ for updating
  if (adminToken) {
    try {
      const faqData = {
        question: 'Test FAQ for update?',
        answer: 'This FAQ will be updated in tests',
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

  // Test 1: Update FAQ without authentication
  if (testFaqId) {
    console.log('\nTest 1: Update FAQ without authentication');
    console.log('📤 Request: PUT /faq');
    console.log('🔑 Auth: None');

    const updateData = {
      faq_id: testFaqId,
      question: 'Updated question without auth?',
      answer: 'This should fail'
    };

    const response1 = await makeRequest('PUT', `${CONFIG.apiVersion}/faq`, updateData);

    console.log(' Response Status:', response1.statusCode);

    const test1Passed = response1.statusCode === 401;
    printTestResult('Update FAQ without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
    if (test1Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 1 - No test FAQ available');
  }

  // Test 2: Update FAQ with valid admin authentication
  if (adminToken && testFaqId) {
    console.log('\nTest 2: Update FAQ with valid admin authentication');
    console.log('📤 Request: PUT /faq');
    console.log('🔑 Auth: Bearer token (admin)');

    const updateData = {
      faq_id: testFaqId,
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email.',
      type: 'account',
      tags: ['password', 'reset', 'account']
    };

    const response2 = await makeRequest('PUT', `${CONFIG.apiVersion}/faq`, updateData, authHeader('admin'));

    console.log('📥 Response Status:', response2.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

    const test2Passed = response2.statusCode === 200 &&
                       response2.body?.success === true &&
                       response2.body?.data?.faq_id === testFaqId &&
                       response2.body?.data?.question === updateData.question;
    printTestResult('Update FAQ with admin auth', test2Passed,
      `Status: ${response2.statusCode}, Expected: 200, FAQ updated: ${!!response2.body?.data?.faq_id}`, response2);
    if (test2Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 2 - No admin token or test FAQ available');
  }

  // Test 3: Update FAQ with invalid ID
  if (adminToken) {
    console.log('\nTest 3: Update FAQ with invalid ID');
    console.log('📤 Request: PUT /faq (invalid ID)');
    console.log('🔑 Auth: Bearer token (admin)');

    const updateData = {
      faq_id: 999999,
      question: 'This should fail',
      answer: 'Invalid ID test'
    };

    const response3 = await makeRequest('PUT', `${CONFIG.apiVersion}/faq`, updateData, authHeader('admin'));

    console.log('📥 Response Status:', response3.statusCode);

    const test3Passed = response3.statusCode === 404;
    printTestResult('Update FAQ with invalid ID', test3Passed, `Status: ${response3.statusCode}, Expected: 404`, response3);
    if (test3Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 3 - No admin token available');
  }

  // Test 4: Update FAQ without faq_id
  if (adminToken) {
    console.log('\nTest 4: Update FAQ without faq_id');
    console.log('📤 Request: PUT /faq (missing ID)');
    console.log('🔑 Auth: Bearer token (admin)');

    const updateData = {
      // Missing faq_id
      question: 'This should fail',
      answer: 'Missing ID test'
    };

    const response4 = await makeRequest('PUT', `${CONFIG.apiVersion}/faq`, updateData, authHeader('admin'));

    console.log('📥 Response Status:', response4.statusCode);

    const test4Passed = response4.statusCode === 400;
    printTestResult('Update FAQ without ID', test4Passed, `Status: ${response4.statusCode}, Expected: 400`, response4);
    if (test4Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 4 - No admin token available');
  }

  // Clean up: delete the test FAQ
  if (adminToken && testFaqId) {
    try {
      await makeRequest('DELETE', `${CONFIG.apiVersion}/faq`, { faq_id: testFaqId }, authHeader('admin'));
      console.log(`🧹 Cleaned up test FAQ with ID: ${testFaqId}`);
    } catch (error) {
      console.log('⚠️  Could not clean up test FAQ:', error.message);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FAQ UPDATE API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testUpdateFaq();

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