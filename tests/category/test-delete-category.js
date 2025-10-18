#!/usr/bin/env node

/**
 * Category Delete API Test
 * Tests the DELETE /categories/:id endpoint
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
 * Test deleting category
 */
async function testDeleteCategory() {
  printSection('Testing Delete Category');

  // First, create a test category
  const uniqueName = `Delete Test ${Date.now()}`;
  const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/categories`, {
    category_name: uniqueName,
    category_type: "videographer",
    description: "Category for deletion testing",
    is_active: true,
    created_by: 1
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  let testCategoryId = null;
  if (createResponse.statusCode === 201 && createResponse.body?.data?.category_id) {
    testCategoryId = createResponse.body.data.category_id;
    console.log(`✅ Created test category with ID: ${testCategoryId}`);
  } else {
    console.log('⚠️  Failed to create test category, using ID 1 as fallback');
    testCategoryId = 1;
  }

  // Test 1: Delete category without authentication
  const test1 = await makeRequest('DELETE', `${CONFIG.apiVersion}/categories/${testCategoryId}`);

  const passed1 = test1.statusCode === 401;
  printTestResult('Delete category without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Create another category for successful deletion test
  const uniqueName2 = `Delete Test 2 ${Date.now()}`;
  const createResponse2 = await makeRequest('POST', `${CONFIG.apiVersion}/categories`, {
    category_name: uniqueName2,
    category_type: "editor",
    description: "Second category for deletion",
    is_active: true,
    created_by: 1
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  let testCategoryId2 = createResponse2.body?.data?.category_id || testCategoryId;

  // Test 2: Delete category with valid ID
  const test2 = await makeRequest('DELETE', `${CONFIG.apiVersion}/categories/${testCategoryId2}`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.message === "category deleted";
  printTestResult('Delete category with valid ID', passed2, `Status: ${test2.statusCode}, Message: ${test2.body?.message}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Delete non-existent category
  const test3 = await makeRequest('DELETE', `${CONFIG.apiVersion}/categories/999999`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed3 = test3.statusCode === 404;
  printTestResult('Delete non-existent category', passed3, `Status: ${test3.statusCode}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Delete with invalid ID format
  const test4 = await makeRequest('DELETE', `${CONFIG.apiVersion}/categories/abc`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed4 = test4.statusCode === 400 || test4.statusCode === 404;
  printTestResult('Delete with invalid ID format', passed4, `Status: ${test4.statusCode}`, test4);
  if (passed4) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Category Delete API Tests\n');

  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('');
  await testDeleteCategory();

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
