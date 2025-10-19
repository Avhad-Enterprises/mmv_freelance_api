#!/usr/bin/env node

/**
 * Complete RBAC (Role-Based Access Control) Test
 * Tests the complete RBAC system functionality
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

console.log('🚀 Testing Role-Based Access Control System');
console.log('==========================================');

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
      printTestResult('Admin login', true, 'SUCCESS', null);
      return true;
    } else {
      printTestResult('Admin login', false, `Expected success, got ${response.statusCode}`, response.body);
      return false;
    }
  } catch (error) {
    printTestResult('Admin login', false, `Request failed: ${error.message}`, null);
    return false;
  }
}

/**
 * Login and get client token
 */
async function loginAsClient() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'login-test@example.com',
      password: 'Password123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('client', response.body.data.token);
      printTestResult('Client login', true, 'SUCCESS', null);
      return true;
    } else {
      printTestResult('Client login', false, `Expected success, got ${response.statusCode}`, response.body);
      return false;
    }
  } catch (error) {
    printTestResult('Client login', false, `Request failed: ${error.message}`, null);
    return false;
  }
}

/**
 * Test authenticated endpoints with super admin token
 */
/**
 * Test authenticated endpoints with different user roles
 */
async function testAuthenticatedEndpoints() {
  printSection('TESTING AUTHENTICATED ENDPOINTS');

  // Test with super admin
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/users`, null, authHeader('superAdmin'));

    const passed = response.statusCode === 200;
    printTestResult(
      'Super admin access to users endpoint',
      passed,
      passed ? 'SUCCESS' : `Expected success, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Super admin access to users endpoint',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test with regular admin
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/users`, null, authHeader('admin'));

    const passed = response.statusCode === 200;
    printTestResult(
      'Admin access to users endpoint',
      passed,
      passed ? 'SUCCESS' : `Expected success, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Admin access to users endpoint',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test with client (should be forbidden)
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/users`, null, authHeader('client'));

    const passed = response.statusCode === 403;
    printTestResult(
      'Client forbidden from users endpoint',
      passed,
      passed ? 'SUCCESS (correctly forbidden)' : `Expected 403, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Client forbidden from users endpoint',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }
}/**
 * Test unauthenticated access (should fail)
 */
/**
 * Test unauthenticated access to protected endpoints
 */
async function testUnauthenticatedAccess() {
  printSection('TESTING UNAUTHENTICATED ACCESS');

  // Test without token
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/users`);

    const passed = response.statusCode === 401;
    printTestResult(
      'No token access to users endpoint',
      passed,
      passed ? 'SUCCESS (correctly unauthorized)' : `Expected 401, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'No token access to users endpoint',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test with invalid token
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/users`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });

    const passed = response.statusCode === 401;
    printTestResult(
      'Invalid token access to users endpoint',
      passed,
      passed ? 'SUCCESS (correctly unauthorized)' : `Expected 401, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Invalid token access to users endpoint',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }
}

/**
 * Test public endpoints
 */
async function testPublicEndpoints() {
  printSection('TESTING PUBLIC ENDPOINTS');

  // Test health endpoint
  try {
    const response = await makeRequest('GET', '/health');

    const passed = response.statusCode === 200;
    printTestResult(
      'Health endpoint access',
      passed,
      passed ? `SUCCESS (${response.body?.status || 'OK'})` : `Expected success, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Health endpoint access',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }
}

/**
 * Run all RBAC tests
 */
async function runAllTests() {
  printSection('STARTING RBAC TESTS');

  try {
    // Login as different users
    await loginAsSuperAdmin();
    await loginAsAdmin();
    await loginAsClient();

    // Run all test suites
    await testPublicEndpoints();
    await testAuthenticatedEndpoints();
    await testUnauthenticatedAccess();

    // Print final summary
    printSummary('RBAC Tests', passedTests, failedTests);

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    printSummary('RBAC Tests', passedTests, failedTests);
  }
}

// Export for test runner
module.exports = {
  runAllTests
};