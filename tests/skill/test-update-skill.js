#!/usr/bin/env node

/**
 * Skills Update API Test
 * Tests the PUT /skills/:id endpoint
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
let testSkillId = null;

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
 * Test updating skills
 */
async function testUpdateSkill() {
  printSection('Testing Update Skill');

  // First, create a test skill
  console.log('\n📝 Creating a test skill first...');
  const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/skills`, {
    skill_name: 'Original Skill Name',
    created_by: 1
  }, authHeader('superAdmin'));

  if (createResponse.statusCode === 201 && createResponse.body?.data?.skill_id) {
    testSkillId = createResponse.body.data.skill_id;
    console.log(`✅ Test skill created with ID: ${testSkillId}`);
  } else {
    console.log('❌ Failed to create test skill');
    failedTests++;
    return;
  }

  // Test 1: Update skill without authentication
  console.log('\nTest 1: Update skill without authentication');
  const response1 = await makeRequest('PUT', `${CONFIG.apiVersion}/skills/${testSkillId}`, {
    skill_name: 'Updated Name'
  });

  if (response1.statusCode === 401) {
    printTestResult('Update skill without auth', true, `Status: ${response1.statusCode}, Expected: 401`, null);
    passedTests++;
  } else {
    printTestResult('Update skill without auth', false, `Status: ${response1.statusCode}, Expected: 401`, response1.body);
    failedTests++;
  }

  // Test 2: Update skill with valid data
  console.log('\nTest 2: Update skill with valid data');
  const response2 = await makeRequest('PUT', `${CONFIG.apiVersion}/skills/${testSkillId}`, {
    skill_name: 'Updated Skill Name',
    updated_by: 1
  }, authHeader('superAdmin'));

  if (response2.statusCode === 200 && response2.body?.data?.skill_name === 'Updated Skill Name') {
    printTestResult('Update skill with valid data', true, `Status: ${response2.statusCode}, Expected: 200`, null);
    passedTests++;
  } else {
    printTestResult('Update skill with valid data', false, `Status: ${response2.statusCode}, Expected: 200`, response2.body);
    failedTests++;
  }

  // Test 3: Update skill with invalid data (empty name)
  console.log('\nTest 3: Update skill with invalid data (empty name)');
  const response3 = await makeRequest('PUT', `${CONFIG.apiVersion}/skills/${testSkillId}`, {
    skill_name: ''
  }, authHeader('superAdmin'));

  if (response3.statusCode === 400) {
    printTestResult('Update skill with invalid data', true, `Status: ${response3.statusCode}, Expected: 400`, null);
    passedTests++;
  } else {
    printTestResult('Update skill with invalid data', false, `Status: ${response3.statusCode}, Expected: 400`, response3.body);
    failedTests++;
  }

  // Test 4: Update non-existent skill
  console.log('\nTest 4: Update non-existent skill');
  const response4 = await makeRequest('PUT', `${CONFIG.apiVersion}/skills/999999`, {
    skill_name: 'Test Name'
  }, authHeader('superAdmin'));

  if (response4.statusCode === 404) {
    printTestResult('Update non-existent skill', true, `Status: ${response4.statusCode}, Expected: 404`, null);
    passedTests++;
  } else {
    printTestResult('Update non-existent skill', false, `Status: ${response4.statusCode}, Expected: 404`, response4.body);
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SKILLS UPDATE API TESTS');
  console.log('==========================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.error('❌ Failed to login as super admin');
    process.exit(1);
  }
  console.log('');

  // Run tests
  await testUpdateSkill();

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