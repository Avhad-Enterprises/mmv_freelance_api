#!/usr/bin/env node

/**
 * Skills Get by ID API Test
 * Tests the GET /skills/:id endpoint
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
 * Test getting skill by ID
 */
async function testGetSkillById() {
  printSection('Testing Get Skill by ID');

  // First, create a test skill
  console.log('\n📝 Creating a test skill first...');
  const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/skills`, {
    skill_name: 'Test Skill for GetById',
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

  // Test 1: Get skill by ID without authentication (should work for public data)
  console.log('\nTest 1: Get skill by ID without authentication');
  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/skills/${testSkillId}`);

  if (response1.statusCode === 200) {
    printTestResult('Get skill by ID without auth', true, `Status: ${response1.statusCode}, Expected: 200 (public data)`, null);
    passedTests++;
  } else {
    printTestResult('Get skill by ID without auth', false, `Status: ${response1.statusCode}, Expected: 200`, response1.body);
    failedTests++;
  }

  // Test 2: Get skill by ID with valid authentication
  console.log('\nTest 2: Get skill by ID with valid authentication');
  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/skills/${testSkillId}`, null, authHeader('superAdmin'));

  if (response2.statusCode === 200 && response2.body?.data?.skill_id === testSkillId) {
    printTestResult('Get skill by ID with auth', true, `Status: ${response2.statusCode}, Expected: 200`, null);
    passedTests++;
  } else {
    printTestResult('Get skill by ID with auth', false, `Status: ${response2.statusCode}, Expected: 200`, response2.body);
    failedTests++;
  }

  // Test 3: Get skill by ID with non-existent ID
  console.log('\nTest 3: Get skill by ID with non-existent ID');
  const response3 = await makeRequest('GET', `${CONFIG.apiVersion}/skills/999999`, null, authHeader('superAdmin'));

  if (response3.statusCode === 404) {
    printTestResult('Get skill by ID not found', true, `Status: ${response3.statusCode}, Expected: 404`, null);
    passedTests++;
  } else {
    printTestResult('Get skill by ID not found', false, `Status: ${response3.statusCode}, Expected: 404`, response3.body);
    failedTests++;
  }

  // Test 4: Verify response structure
  console.log('\nTest 4: Verify response structure');
  if (response2.statusCode === 200 && response2.body?.data) {
    const skill = response2.body.data;
    const hasRequiredFields = skill.skill_id && skill.skill_name;

    if (hasRequiredFields) {
      printTestResult('Verify response structure', true, 'Valid structure: true', null);
      passedTests++;
    } else {
      printTestResult('Verify response structure', false, 'Valid structure: false', null);
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
  console.log('🧪 SKILLS GET BY ID API TESTS');
  console.log('=============================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.error('❌ Failed to login as super admin');
    process.exit(1);
  }
  console.log('');

  // Run tests
  await testGetSkillById();

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