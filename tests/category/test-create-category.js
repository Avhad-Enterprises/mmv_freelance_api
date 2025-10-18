#!/usr/bin/env node

/**
 * Category Create API Test
 * Tests the POST /categories endpoint
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
    console.log('🔐 Logging in as admin...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('admin', response.body.data.token);
      console.log('✅ Admin token stored');
      return true;
    }
    console.log('❌ Login failed');
    return false;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

/**
 * Test category creation
 */
async function testCreateCategory() {
  printSection('Testing Category Creation');

  // Test 1: Create category without authentication
  const test1 = await makeRequest('POST', `${CONFIG.apiVersion}/categories`, {
    category_name: "Technology",
    category_type: "editor",
    description: "Tech-related categories"
  });

  const passed1 = test1.statusCode === 401;
  printTestResult('Create category without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Create category with valid data
  const uniqueName = `Tech Category ${Date.now()}`;
  const test2 = await makeRequest('POST', `${CONFIG.apiVersion}/categories`, {
    category_name: uniqueName,
    category_type: "editor",
    description: "Technology editing category",
    is_active: true,
    created_by: 1
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 201 && test2.body?.data?.category_id;
  printTestResult('Create category with valid data', passed2, `Status: ${test2.statusCode}, ID: ${test2.body?.data?.category_id}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Create category with missing required fields
  const test3 = await makeRequest('POST', `${CONFIG.apiVersion}/categories`, {
    category_name: "Incomplete Category"
    // missing category_type
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed3 = test3.statusCode === 400;
  printTestResult('Create category with missing fields', passed3, `Status: ${test3.statusCode}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Create category with empty name
  const test4 = await makeRequest('POST', `${CONFIG.apiVersion}/categories`, {
    category_name: "",
    category_type: "videographer",
    is_active: true
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed4 = test4.statusCode === 400;
  printTestResult('Create category with empty name', passed4, `Status: ${test4.statusCode}`, test4);
  if (passed4) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Category Create API Tests\n');

  // Login first
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('');

  // Run tests
  await testCreateCategory();

  // Print summary
  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
