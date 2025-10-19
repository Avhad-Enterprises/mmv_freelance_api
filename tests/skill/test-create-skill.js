#!/usr/bin/env node

/**
 * Skills Create API Test
 * Tests the POST /skills endpoint
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
 * Login and get super admin token
 */
async function loginAsSuperAdmin() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('superAdmin', response.body.data.token);
      printTestResult('Super admin login', true, 'SUCCESS', null);
      return true;
    } else {
      printTestResult('Super admin login', false, `Expected success, got ${response.statusCode}`, response.body);
      return false;
    }
  } catch (error) {
    printTestResult('Super admin login', false, `Request failed: ${error.message}`, null);
    return false;
  }
}

/**
 * Test creating skills
 */
async function testCreateSkill() {
  printSection('Testing Create Skill');

  // Test 1: Create skill without authentication
  console.log('\nTest 1: Create skill without authentication');
  const response1 = await makeRequest('POST', `${CONFIG.apiVersion}/skills`, {
    skill_name: 'Test Skill',
    created_by: 1
  });

  if (response1.statusCode === 401) {
    printTestResult('Create skill without auth', true, `Status: ${response1.statusCode}, Expected: 401`, null);
    passedTests++;
  } else {
    printTestResult('Create skill without auth', false, `Status: ${response1.statusCode}, Expected: 401`, response1.body);
    failedTests++;
  }

  // Test 2: Create skill with valid data
  console.log('\nTest 2: Create skill with valid data');
  const response2 = await makeRequest('POST', `${CONFIG.apiVersion}/skills`, {
    skill_name: 'Test Skill',
    created_by: 1
  }, authHeader('superAdmin'));

  if (response2.statusCode === 201 && response2.body?.data?.skill_name === 'Test Skill') {
    printTestResult('Create skill with valid data', true, `Status: ${response2.statusCode}, Expected: 201`, null);
    passedTests++;
  } else {
    printTestResult('Create skill with valid data', false, `Status: ${response2.statusCode}, Expected: 201`, response2.body);
    failedTests++;
  }

  // Test 3: Create skill with invalid data (empty name)
  console.log('\nTest 3: Create skill with invalid data (empty name)');
  const response3 = await makeRequest('POST', `${CONFIG.apiVersion}/skills`, {
    skill_name: '',
    created_by: 1
  }, authHeader('superAdmin'));

  if (response3.statusCode === 400) {
    printTestResult('Create skill with invalid data', true, `Status: ${response3.statusCode}, Expected: 400`, null);
    passedTests++;
  } else {
    printTestResult('Create skill with invalid data', false, `Status: ${response3.statusCode}, Expected: 400`, response3.body);
    failedTests++;
  }

  // Test 4: Create skill with missing required fields
  console.log('\nTest 4: Create skill with missing required fields');
  const response4 = await makeRequest('POST', `${CONFIG.apiVersion}/skills`, {}, authHeader('superAdmin'));

  if (response4.statusCode === 400) {
    printTestResult('Create skill with missing fields', true, `Status: ${response4.statusCode}, Expected: 400`, null);
    passedTests++;
  } else {
    printTestResult('Create skill with missing fields', false, `Status: ${response4.statusCode}, Expected: 400`, response4.body);
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SKILLS CREATE API TESTS');
  console.log('==========================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.error('❌ Failed to login as super admin');
    process.exit(1);
  }
  console.log('');

  // Run tests
  await testCreateSkill();

  // Summary
  printSummary(passedTests, failedTests, passedTests + failedTests);
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };