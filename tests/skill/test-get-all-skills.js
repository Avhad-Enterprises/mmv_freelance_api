#!/usr/bin/env node

/**
 * Skills Get All API Test
 * Tests the GET /skills endpoint
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
 * Test getting all skills
 */
async function testGetAllSkills() {
  printSection('Testing Get All Skills');

  // Test 1: Get all skills without authentication (should work for public data)
  console.log('\nTest 1: Get all skills without authentication');
  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/skills`);

  if (response1.statusCode === 200) {
    printTestResult('Get all skills without auth', true, `Status: ${response1.statusCode}, Expected: 200 (public data)`, null);
    passedTests++;
  } else {
    printTestResult('Get all skills without auth', false, `Status: ${response1.statusCode}, Expected: 200`, response1.body);
    failedTests++;
  }

  // Test 2: Get all skills with valid authentication
  console.log('\nTest 2: Get all skills with valid authentication');
  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/skills`, null, authHeader('superAdmin'));

  if (response2.statusCode === 200 && Array.isArray(response2.body?.data)) {
    printTestResult('Get all skills with auth', true, `Status: ${response2.statusCode}, Expected: 200`, null);
    passedTests++;
  } else {
    printTestResult('Get all skills with auth', false, `Status: ${response2.statusCode}, Expected: 200`, response2.body);
    failedTests++;
  }

  // Test 3: Verify response structure
  console.log('\nTest 3: Verify response structure');
  if (response2.statusCode === 200 && response2.body?.data) {
    const skills = response2.body.data;
    const isValidArray = Array.isArray(skills);
    const hasValidItems = skills.length === 0 || skills.every(skill =>
      skill && typeof skill === 'object' && skill.skill_id && skill.skill_name
    );

    if (isValidArray && hasValidItems) {
      printTestResult('Verify response structure', true, 'Array: true, Valid items: true', null);
      passedTests++;
    } else {
      printTestResult('Verify response structure', false, `Array: ${isValidArray}, Valid items: ${hasValidItems}`, null);
      failedTests++;
    }
  } else {
    printTestResult('Verify response structure', false, 'No valid response to verify', null);
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SKILLS GET ALL API TESTS');
  console.log('===========================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.error('❌ Failed to login as super admin');
    process.exit(1);
  }
  console.log('');

  // Run tests
  await testGetAllSkills();

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