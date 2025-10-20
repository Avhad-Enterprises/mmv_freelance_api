#!/usr/bin/env node

/**
 * Freelancers Get All Public API Test
 * Tests the GET /freelancers/getfreelancers-public endpoint
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
 * Test Get All Freelancers Public (no auth required)
 */
async function testGetAllFreelancersPublic() {
  printSection('Testing Get All Freelancers Public');

  // Test 1: Get all freelancers public without auth
  console.log('Test 1: Get all freelancers public without authentication');
  console.log('📤 Request: GET /freelancers/getfreelancers-public');
  console.log('🔑 Auth: None');

  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/freelancers/getfreelancers-public`);

  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 200 && response1.body?.success === true;
  printTestResult('Get all freelancers public without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 200`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Verify response structure
  if (test1Passed && response1.body?.data) {
    console.log('\nTest 2: Verify response structure');
    const data = response1.body.data;
    const isArray = Array.isArray(data);
    const hasValidStructure = isArray && data.every(item =>
      item.hasOwnProperty('user_id') &&
      item.hasOwnProperty('first_name') &&
      item.hasOwnProperty('last_name') &&
      item.hasOwnProperty('profile_title') &&
      item.hasOwnProperty('skills') &&
      item.hasOwnProperty('role_name')
    );

    const test2Passed = isArray && hasValidStructure && response1.body.count === data.length;
    printTestResult('Verify response structure', test2Passed, `Array: ${isArray}, Valid items: ${hasValidStructure}, Count matches: ${response1.body.count === data.length}`, {
      dataLength: data.length,
      expectedCount: response1.body.count,
      sampleItem: data[0]
    });
    if (test2Passed) passedTests++; else failedTests++;
  }

  // Test 3: Verify data privacy (no sensitive info)
  if (test1Passed && response1.body?.data) {
    console.log('\nTest 3: Verify data privacy (no email/phone)');
    const data = response1.body.data;
    const hasNoEmail = data.every(item => !item.email);
    const hasNoPhone = data.every(item => !item.phone_number);

    const test3Passed = hasNoEmail && hasNoPhone;
    printTestResult('Verify data privacy', test3Passed, `No email: ${hasNoEmail}, No phone: ${hasNoPhone}`, null);
    if (test3Passed) passedTests++; else failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FREELANCERS GET ALL PUBLIC API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testGetAllFreelancersPublic();

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