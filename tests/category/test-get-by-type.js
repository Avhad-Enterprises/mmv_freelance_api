#!/usr/bin/env node

/**
 * Category Get by Type API Test
 * Tests the GET /categories/by-type endpoint
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
 * Test getting categories by type
 */
async function testGetCategoriesByType() {
  printSection('Testing Get Categories by Type');

  // First, create a test category with specific type
  const uniqueName = `Tech Type Test ${Date.now()}`;
  const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/categories`, {
    category_name: uniqueName,
    category_type: "videographer",
    description: "Test category for type filtering",
    is_active: true,
    created_by: 1
  }, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  let testType = "videographer";
  if (createResponse.statusCode === 201) {
    console.log(`✅ Created test category with type: ${testType}`);
  }

  // Test 1: Get by type without authentication (should work since it's public)
  const test1 = await makeRequest('GET', `${CONFIG.apiVersion}/categories/by-type?type=${testType}`);

  const passed1 = test1.statusCode === 200 && test1.body?.success === true;
  printTestResult('Get by type without auth', passed1, `Status: ${test1.statusCode}, Expected: 200`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Get by type with query parameter
  const test2 = await makeRequest('GET', `${CONFIG.apiVersion}/categories/by-type?type=${testType}`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.success === true;
  printTestResult('Get by type with query param', passed2, `Status: ${test2.statusCode}, Success: ${test2.body?.success}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Get by type without type parameter
  const test3 = await makeRequest('GET', `${CONFIG.apiVersion}/categories/by-type`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed3 = test3.statusCode === 400;
  printTestResult('Get by type without type param', passed3, `Status: ${test3.statusCode}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Get by non-existent type
  const test4 = await makeRequest('GET', `${CONFIG.apiVersion}/categories/by-type?type=nonexistent-type-999`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed4 = test4.statusCode === 200 && Array.isArray(test4.body?.data);
  printTestResult('Get by non-existent type', passed4, `Status: ${test4.statusCode}, Returns empty array`, test4);
  if (passed4) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Category Get by Type API Tests\n');

  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('');
  await testGetCategoriesByType();

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
