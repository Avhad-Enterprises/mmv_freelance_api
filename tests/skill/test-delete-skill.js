#!/usr/bin/env node

/**
 * Skills Delete API Test
 * Tests the DELETE /skills/:id endpoint
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
 * Test deleting skills
 */
async function testDeleteSkill() {
  printSection('Testing Delete Skill');

  // First, create a test skill
  console.log('\n� Creating a test skill first...');
  const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/skills`, {
    skill_name: 'Test Skill for Deletion',
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

  // Test 1: Delete skill without authentication
  console.log('\nTest 1: Delete skill without authentication');
  const response1 = await makeRequest('DELETE', `${CONFIG.apiVersion}/skills/${testSkillId}`);

  if (response1.statusCode === 401) {
    printTestResult('Delete skill without auth', true, `Status: ${response1.statusCode}, Expected: 401`, null);
    passedTests++;
  } else {
    printTestResult('Delete skill without auth', false, `Status: ${response1.statusCode}, Expected: 401`, response1.body);
    failedTests++;
  }

  // Test 2: Delete skill with valid authentication
  console.log('\nTest 2: Delete skill with valid authentication');
  const response2 = await makeRequest('DELETE', `${CONFIG.apiVersion}/skills/${testSkillId}`, null, authHeader('superAdmin'));

  if (response2.statusCode === 200) {
    printTestResult('Delete skill with auth', true, `Status: ${response2.statusCode}, Expected: 200`, null);
    passedTests++;
  } else {
    printTestResult('Delete skill with auth', false, `Status: ${response2.statusCode}, Expected: 200`, response2.body);
    failedTests++;
  }

  // Test 3: Delete same skill again (should return 404)
  console.log('\nTest 3: Delete same skill again (should return 404)');
  const response3 = await makeRequest('DELETE', `${CONFIG.apiVersion}/skills/${testSkillId}`, null, authHeader('superAdmin'));

  if (response3.statusCode === 404) {
    printTestResult('Delete same skill again', true, `Status: ${response3.statusCode}, Expected: 404`, null);
    passedTests++;
  } else {
    printTestResult('Delete same skill again', false, `Status: ${response3.statusCode}, Expected: 404`, response3.body);
    failedTests++;
  }

  // Test 4: Delete non-existent skill
  console.log('\nTest 4: Delete non-existent skill');
  const response4 = await makeRequest('DELETE', `${CONFIG.apiVersion}/skills/999999`, null, authHeader('superAdmin'));

  if (response4.statusCode === 404) {
    printTestResult('Delete non-existent skill', true, `Status: ${response4.statusCode}, Expected: 404`, null);
    passedTests++;
  } else {
    printTestResult('Delete non-existent skill', false, `Status: ${response4.statusCode}, Expected: 404`, response4.body);
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SKILLS DELETE API TESTS');
  console.log('==========================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.error('❌ Failed to login as super admin');
    process.exit(1);
  }
  console.log('');

  // Run tests
  await testDeleteSkill();

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