#!/usr/bin/env node

/**
 * Category Update API Test
 * Tests the PUT /categories/:id endpoint
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
 * Test updating category
 */
async function testUpdateCategory() {
  printSection('Testing Update Category');

  // First, create a test category
  const uniqueName = `Update Test ${Date.now()}`;
  const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/categories`, {
    category_name: uniqueName,
    category_type: "editor",
    description: "Category for update testing",
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

  // Test 1: Update category without authentication
  const test1 = await makeRequest('PUT', `${CONFIG.apiVersion}/categories/${testCategoryId}`, {
    category_name: "Updated Name"
  });

  const passed1 = test1.statusCode === 401;
  printTestResult('Update category without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Update category with valid data
  const updatedName = `Updated Test Category ${Date.now()}`;
  const test2 = await makeRequest('PUT', `${CONFIG.apiVersion}/categories/${testCategoryId}`, {
    category_name: updatedName,
    description: "Updated via test",
    updated_by: 1
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.message === "Category updated";
  printTestResult('Update category with valid data', passed2, `Status: ${test2.statusCode}, Message: ${test2.body?.message}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Update non-existent category
  const test3 = await makeRequest('PUT', `${CONFIG.apiVersion}/categories/999999`, {
    category_name: "Non-existent"
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed3 = test3.statusCode === 404;
  printTestResult('Update non-existent category', passed3, `Status: ${test3.statusCode}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Update with invalid ID format
  const test4 = await makeRequest('PUT', `${CONFIG.apiVersion}/categories/abc`, {
    category_name: "Invalid ID"
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed4 = test4.statusCode === 400 || test4.statusCode === 404;
  printTestResult('Update with invalid ID format', passed4, `Status: ${test4.statusCode}`, test4);
  if (passed4) passedTests++; else failedTests++;

  // Test 5: Update with empty name (validation)
  const test5 = await makeRequest('PUT', `${CONFIG.apiVersion}/categories/${testCategoryId}`, {
    category_name: ""
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed5 = test5.statusCode === 400 || test5.statusCode === 500; // Either validation or DB constraint
  printTestResult('Update with empty name', passed5, `Status: ${test5.statusCode}`, test5);
  if (passed5) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Category Update API Tests\n');

  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('');
  await testUpdateCategory();

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
