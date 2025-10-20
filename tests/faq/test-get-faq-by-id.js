#!/usr/bin/env node

/**
 * FAQ Get By ID API Test
 * Tests the GET /faq/:id endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;
let testFaqId = null;

/**
 * Test Get FAQ by ID
 */
async function testGetFaqById() {
  printSection('Testing Get FAQ by ID');

  // First, get an existing FAQ ID
  try {
    const allFaqsResponse = await makeRequest('GET', `${CONFIG.apiVersion}/faq`);
    if (allFaqsResponse.body?.data && allFaqsResponse.body.data.length > 0) {
      testFaqId = allFaqsResponse.body.data[0].faq_id;
      console.log(`Found existing FAQ with ID: ${testFaqId}`);
    }
  } catch (error) {
    console.log('No existing FAQs found, will test with invalid ID');
  }

  // Test 1: Get FAQ by valid ID without authentication
  if (testFaqId) {
    console.log('\nTest 1: Get FAQ by valid ID without authentication');
    console.log(`📤 Request: GET /faq/${testFaqId}`);
    console.log('🔑 Auth: None');

    const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/faq/${testFaqId}`);

    console.log('📥 Response Status:', response1.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

    const test1Passed = response1.statusCode === 200 &&
                       response1.body?.success === true &&
                       response1.body?.data?.faq_id === testFaqId;
    printTestResult('Get FAQ by valid ID without auth', test1Passed,
      `Status: ${response1.statusCode}, Expected: 200, FAQ ID matches: ${response1.body?.data?.faq_id === testFaqId}`, response1);
    if (test1Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 1 - No existing FAQ found');
  }

  // Test 2: Get FAQ by invalid ID
  console.log('\nTest 2: Get FAQ by invalid ID');
  console.log('📤 Request: GET /faq/999999');
  console.log('🔑 Auth: None');

  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/faq/999999`);

  console.log('📥 Response Status:', response2.statusCode);

  const test2Passed = response2.statusCode === 404;
  printTestResult('Get FAQ by invalid ID', test2Passed, `Status: ${response2.statusCode}, Expected: 404`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Get FAQ by non-numeric ID
  console.log('\nTest 3: Get FAQ by non-numeric ID');
  console.log('📤 Request: GET /faq/abc');
  console.log('🔑 Auth: None');

  const response3 = await makeRequest('GET', `${CONFIG.apiVersion}/faq/abc`);

  console.log('📥 Response Status:', response3.statusCode);

  const test3Passed = response3.statusCode === 400;
  printTestResult('Get FAQ by non-numeric ID', test3Passed, `Status: ${response3.statusCode}, Expected: 400`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Verify response structure for valid FAQ
  if (testFaqId) {
    console.log('\nTest 4: Verify response structure for valid FAQ');
    const response4 = await makeRequest('GET', `${CONFIG.apiVersion}/faq/${testFaqId}`);

    const hasRequiredFields = response4.body?.data &&
                             response4.body.data.faq_id &&
                             response4.body.data.question &&
                             response4.body.data.answer &&
                             response4.body.data.type &&
                             response4.body.data.is_active &&
                             response4.body.data.created_at;

    const test4Passed = response4.statusCode === 200 && hasRequiredFields;
    printTestResult('Verify response structure', test4Passed,
      `Status: ${response4.statusCode}, Has required fields: ${!!hasRequiredFields}`, {
        faqData: response4.body?.data
      });
    if (test4Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 4 - No existing FAQ found');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FAQ GET BY ID API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testGetFaqById();

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