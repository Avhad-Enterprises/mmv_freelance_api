#!/usr/bin/env node

/**
 * FAQ Create API Test
 * Tests the POST /faq endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  authHeader,
  storeToken
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;
let adminToken = null;

/**
 * Test Create FAQ
 */
async function testCreateFaq() {
  printSection('Testing Create FAQ');

  // Login as admin first
  try {
    console.log('🔐 Logging in as admin...');
    console.log('📧 Email: testadmin@example.com');
    console.log('🔑 Password: TestAdmin123!');
    const loginResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    console.log('📥 Login Response Status:', loginResponse.statusCode);
    console.log('📥 Login Response Body:', JSON.stringify(loginResponse.body, null, 2));

    if (loginResponse.body?.data?.token) {
      adminToken = loginResponse.body.data.token;
      storeToken('admin', adminToken);
      console.log('✅ Admin login successful');
      console.log('🎫 Token received:', adminToken.substring(0, 20) + '...');
    } else {
      console.log('⚠️  Admin login failed, admin tests will be skipped');
      console.log('❌ Error details:', loginResponse.body?.message || 'Unknown error');
    }
  } catch (error) {
    console.log('⚠️  Admin login failed:', error.message);
  }

  // Test 1: Create FAQ without authentication
  console.log('\nTest 1: Create FAQ without authentication');
  console.log('📤 Request: POST /faq');
  console.log('🔑 Auth: None');

  const faqData = {
    question: 'Test question without auth?',
    answer: 'This should fail without authentication'
  };

  const response1 = await makeRequest('POST', `${CONFIG.apiVersion}/faq`, faqData);

  console.log('📥 Response Status:', response1.statusCode);

  const test1Passed = response1.statusCode === 401;
  printTestResult('Create FAQ without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Create FAQ with valid admin authentication
  if (adminToken) {
    console.log('\nTest 2: Create FAQ with valid admin authentication');
    console.log('📤 Request: POST /faq');
    console.log('🔑 Auth: Bearer token (admin)');

    const validFaqData = {
      question: 'How do I hire a freelancer?',
      answer: 'First, create a project posting with your requirements.'
    };

    console.log('📤 Request Data:', JSON.stringify(validFaqData, null, 2));
    console.log('🔑 Auth Header:', JSON.stringify(authHeader('admin'), null, 2));

    const response2 = await makeRequest('POST', `${CONFIG.apiVersion}/faq`, validFaqData, authHeader('admin'));

    console.log('📥 Response Status:', response2.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

    const test2Passed = response2.statusCode === 201 &&
                       response2.body?.success === true &&
                       response2.body?.data?.faq_id &&
                       response2.body?.data?.question === validFaqData.question;
    printTestResult('Create FAQ with admin auth', test2Passed,
      `Status: ${response2.statusCode}, Expected: 201, FAQ created: ${!!response2.body?.data?.faq_id}`, response2);
    if (test2Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 2 - No admin token available');
  }

  // Test 3: Create FAQ with missing required fields
  if (adminToken) {
    console.log('\nTest 3: Create FAQ with missing required fields');
    console.log('📤 Request: POST /faq (invalid data)');
    console.log('🔑 Auth: Bearer token (admin)');

    const invalidFaqData = {
      // Missing question and answer
    };

    console.log('📤 Request Data (invalid):', JSON.stringify(invalidFaqData, null, 2));
    console.log('🔑 Auth Header:', JSON.stringify(authHeader('admin'), null, 2));

    const response3 = await makeRequest('POST', `${CONFIG.apiVersion}/faq`, invalidFaqData, authHeader('admin'));

    console.log('📥 Response Status:', response3.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response3.body, null, 2));

    const test3Passed = response3.statusCode === 400;
    printTestResult('Create FAQ with missing fields', test3Passed, `Status: ${response3.statusCode}, Expected: 400`, response3);
    if (test3Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 3 - No admin token available');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FAQ CREATE API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testCreateFaq();

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