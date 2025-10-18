#!/usr/bin/env node

/**
 * Favorites Get My Favorites API Test
 * Tests the GET /favorites/my-favorites endpoint
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
 * Login and get client token
 */
async function loginAsClient() {
  try {
    console.log('🔐 Logging in as client...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('client', response.body.data.token);
      console.log('✅ Client token stored');
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
 * Ensure a freelancer is in favorites for testing
 */
async function ensureFreelancerInFavorites() {
  try {
    console.log('💾 Ensuring at least one freelancer is in favorites...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/favorites/add-freelancer`, {
      freelancer_id: 2
    }, {
      'Authorization': `Bearer ${TOKENS.client}`
    });

    if (response.statusCode === 201 || response.statusCode === 409) {
      console.log('✅ Freelancer is in favorites');
      return true;
    }
    console.log('⚠️  Could not add freelancer to favorites');
    return false;
  } catch (error) {
    console.log('⚠️  Error ensuring freelancer in favorites:', error.message);
    return false;
  }
}

/**
 * Test getting user's favorites
 */
async function testGetMyFavorites() {
  printSection('Testing Get My Favorites');

  // Ensure at least one favorite exists
  await ensureFreelancerInFavorites();

  // Test 1: Get my favorites without auth
  console.log('Test 1: Get my favorites without authentication');
  console.log('📤 Request: GET /favorites/my-favorites');
  console.log('🔑 Auth: None');
  
  const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/favorites/my-favorites`);
  
  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Get my favorites without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Get my favorites with valid auth
  console.log('\nTest 2: Get my favorites with valid authentication');
  console.log('📤 Request: GET /favorites/my-favorites');
  console.log('🔑 Auth: Bearer token (client)');
  
  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/favorites/my-favorites`, null, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response2.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

  const test2Passed = response2.statusCode === 200 && response2.body?.data;
  printTestResult('Get my favorites with auth', test2Passed, `Status: ${response2.statusCode}, Expected: 200`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Verify response structure
  if (test2Passed && response2.body?.data) {
    console.log('\nTest 3: Verify response structure');
    const data = response2.body.data;
    const isArray = Array.isArray(data);
    const hasValidStructure = isArray && (data.length === 0 || (
      data[0].hasOwnProperty('id') &&
      data[0].hasOwnProperty('user_id') &&
      data[0].hasOwnProperty('freelancer_id')
    ));

    const test3Passed = hasValidStructure;
    printTestResult('Response structure validation', test3Passed, 
      `Array: ${isArray}, Valid items: ${hasValidStructure}`, response2);
    if (test3Passed) passedTests++; else failedTests++;
  } else {
    console.log('\nTest 3: Skipped - Previous test failed');
    failedTests++;
  }

  // Test 4: Verify message in response
  console.log('\nTest 4: Verify response message');
  const test4Passed = response2.body?.message !== undefined;
  printTestResult('Response message validation', test4Passed, 
    'Should return a message', response2);
  if (test4Passed) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FAVORITES GET MY FAVORITES API TESTS');
  console.log('=====================================\n');

  // Login first
  const loginSuccess = await loginAsClient();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without client authentication');
    process.exit(1);
  }

  // Run tests
  await testGetMyFavorites();

  // Print summary
  printSummary(passedTests, failedTests, passedTests + failedTests);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
