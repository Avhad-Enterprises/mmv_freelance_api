#!/usr/bin/env node

/**
 * Category Get All API Test
 * Tests the GET /categories endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  TOKENS,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get admin token
 */
async function loginAsAdmin() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('admin', response.body.data.token);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Test getting all categories
 */
async function testGetAllCategories() {
  printSection('Testing Get All Categories');

  // Test 1: Get all categories without authentication (should work since it's public)
  const test1 = await makeRequest('GET', `${CONFIG.apiVersion}/categories`);

  const passed1 = test1.statusCode === 200 && Array.isArray(test1.body?.data);
  printTestResult('Get categories without auth', passed1, `Status: ${test1.statusCode}, Expected: 200`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Get all categories with authentication
  const test2 = await makeRequest('GET', `${CONFIG.apiVersion}/categories`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.success === true && Array.isArray(test2.body?.data);
  printTestResult('Get all categories with auth', passed2, `Status: ${test2.statusCode}, Count: ${test2.body?.data?.length}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Verify response structure
  if (test2.body?.data && test2.body.data.length > 0) {
    const category = test2.body.data[0];
    const hasRequiredFields = category.category_id && category.category_name && category.category_type;
    
    printTestResult('Verify response structure', hasRequiredFields, `Has required fields: ${hasRequiredFields}`);
    if (hasRequiredFields) passedTests++; else failedTests++;
  } else {
    printTestResult('Verify response structure', false, 'No categories found to verify');
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Category Get All API Tests\n');

  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('');
  await testGetAllCategories();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
