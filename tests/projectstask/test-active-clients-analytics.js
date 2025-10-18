#!/usr/bin/env node

/**
 * Active Clients Analytics API Test
 * Tests the GET /projects-tasks/analytics/active-clients endpoint
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
async function loginAsClient() {
  try {
    console.log('🔐 Logging in as client...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });

    console.log('Login response:', response.statusCode, response.body);

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
 * Login and get admin token
 */
async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    console.log('Login response:', response.statusCode, response.body);

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
 * Test active clients analytics
 */
async function testActiveClientsAnalytics() {
  printSection('Testing Active Clients Analytics');

  // Test 1: Get active clients count without authentication
  const test1 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/analytics/active-clients`);

  const passed1 = test1.statusCode === 401;
  printTestResult('Get active clients without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Get active clients count with admin auth
  const test2 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/analytics/active-clients`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 200 &&
                  test2.body?.success === true &&
                  typeof test2.body?.count === 'number' &&
                  test2.body?.type === 'active_clients';
  printTestResult('Get active clients with admin auth', passed2, `Status: ${test2.statusCode}, Success: ${test2.body?.success}, Count: ${test2.body?.count}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Get active clients count with client auth (should fail)
  const test3 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/analytics/active-clients`, null, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed3 = test3.statusCode === 403; // Forbidden for non-admin
  printTestResult('Get active clients with client auth (should fail)', passed3, `Status: ${test3.statusCode}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Verify count is non-negative
  const test4 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/analytics/active-clients`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed4 = test4.statusCode === 200 && test4.body?.count >= 0;
  printTestResult('Verify active clients count is valid', passed4, `Status: ${test4.statusCode}, Count: ${test4.body?.count}`, test4);
  if (passed4) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Active Clients Analytics API Tests\n');

  // Login first
  const adminLoginSuccess = await loginAsAdmin();
  if (!adminLoginSuccess) {
    console.log('❌ Cannot proceed without admin authentication');
    process.exit(1);
  }

  const clientLoginSuccess = await loginAsClient();
  if (!clientLoginSuccess) {
    console.log('❌ Cannot proceed without client authentication');
    process.exit(1);
  }

  console.log('');

  // Run tests
  await testActiveClientsAnalytics();

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