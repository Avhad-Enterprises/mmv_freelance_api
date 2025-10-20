#!/usr/bin/env node

/**
 * FAQ Get All API Test
 * Tests the GET /faq endpoint
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
 * Test Get All FAQs (no auth required)
 */
async function testGetAllFaqs() {
  printSection('Testing Get All FAQs');

  // Test 1: Get all FAQs without authentication
  console.log('Test 1: Get all FAQs without authentication');
  console.log('📤 Request: GET /faq');
  console.log('🔑 Auth: None');

  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/faq`);

  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 200 && response1.body?.success === true;
  printTestResult('Get all FAQs without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 200`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Verify response structure
  if (test1Passed && response1.body?.data) {
    console.log('\nTest 2: Verify response structure');
    const data = response1.body.data;
    const isArray = Array.isArray(data);
    const hasValidStructure = isArray && data.every(item =>
      item.hasOwnProperty('faq_id') &&
      item.hasOwnProperty('question') &&
      item.hasOwnProperty('answer') &&
      item.hasOwnProperty('type') &&
      item.hasOwnProperty('is_active') &&
      item.hasOwnProperty('created_at')
    );
    const countMatches = response1.body.data ? response1.body.data.length >= 0 : false;

    const test2Passed = isArray && hasValidStructure && countMatches;
    printTestResult('Verify response structure', test2Passed, `Array: ${isArray}, Valid items: ${hasValidStructure}, Count matches: ${countMatches}`, {
      dataLength: data.length,
      sampleItem: data[0]
    });
    if (test2Passed) passedTests++; else failedTests++;
  }

  // Test 3: Verify only active FAQs are returned
  if (test1Passed && response1.body?.data) {
    console.log('\nTest 3: Verify only active FAQs are returned');
    const data = response1.body.data;
    const allActive = data.every(item => item.is_active === true);
    const noneDeleted = data.every(item => item.is_deleted === false);

    const test3Passed = allActive && noneDeleted;
    printTestResult('Verify only active FAQs are returned', test3Passed, `All active: ${allActive}, None deleted: ${noneDeleted}`, null);
    if (test3Passed) passedTests++; else failedTests++;
  }

  // Test 4: Verify FAQs are ordered by creation date (newest first)
  if (test1Passed && response1.body?.data && response1.body.data.length > 1) {
    console.log('\nTest 4: Verify FAQs are ordered by creation date (newest first)');
    const data = response1.body.data;
    let isOrdered = true;
    for (let i = 0; i < data.length - 1; i++) {
      const currentDate = new Date(data[i].created_at);
      const nextDate = new Date(data[i + 1].created_at);
      if (currentDate.getTime() < nextDate.getTime()) {
        isOrdered = false;
        break;
      }
    }

    const test4Passed = isOrdered;
    printTestResult('Verify FAQs ordered by creation date', test4Passed, `Newest first: ${isOrdered}`, {
      firstItemDate: data[0]?.created_at,
      lastItemDate: data[data.length - 1]?.created_at
    });
    if (test4Passed) passedTests++; else failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FAQ GET ALL API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testGetAllFaqs();

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