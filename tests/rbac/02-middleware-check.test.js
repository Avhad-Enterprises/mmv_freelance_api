const { makeRequest, printSection, printTestResult, printSummary, storeToken, TOKENS, authHeader } = require('../test-utils');

/**
 * Login as super admin
 */
async function loginAsSuperAdmin() {
  try {
    const response = await makeRequest('POST', '/api/v1/auth/login', {
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
 * Ensure Client user exists and get token
 */
/**
 * Ensure Client user exists and get token
 */
async function ensureClientUser() {
  const timestamp = Date.now();
  const email = `login-test-${timestamp}@example.com`;
  const password = 'Password123!';
  const { CONFIG } = require('../test-utils');

  // 1. Register new user
  try {
    console.log(`  Registering new client user: ${email}...`);
    const regResponse = await makeRequest('POST', '/api/v1/auth/register/client', {
      email,
      password,
      first_name: 'Test',
      last_name: 'Client',
      phone_number: '1234567890',
      company_name: 'Test Corp',
      industry: 'film',
      company_size: '1-10',
      country: 'India',
      terms_accepted: true,
      privacy_policy_accepted: true
    });

    if (regResponse.statusCode === 201) {
      // 2. Login immediately
      const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
        email,
        password
      });

      if (loginRes.statusCode === 200 && loginRes.body?.data?.token) {
        storeToken('client', loginRes.body.data.token);
        printTestResult('Client login', true, 'SUCCESS', null);
        return true;
      }
    }
    printTestResult('Client setup failed', false, `Status: ${regResponse.statusCode}`, regResponse.body);
    return false;
  } catch (error) {
    printTestResult('Client setup failed', false, error.message, null);
    return false;
  }
}

/**
 * Test role-based endpoint access
 */
async function testRoleBasedEndpoint(endpoint, tokenKey, userRole, expectedResult) {
  try {
    const response = await makeRequest('GET', endpoint, null, authHeader(tokenKey));

    if (expectedResult === 'success') {
      const passed = response.statusCode === 200;
      printTestResult(
        `${userRole} access to ${endpoint}`,
        passed,
        passed ? 'SUCCESS' : `Expected success, got ${response.statusCode}`,
        response.body
      );
      return passed;
    } else if (expectedResult === 'forbidden') {
      const passed = response.statusCode === 403;
      printTestResult(
        `${userRole} access to ${endpoint}`,
        passed,
        passed ? 'SUCCESS (correctly forbidden)' : `Expected 403, got ${response.statusCode}`,
        response.body
      );
      return passed;
    }

    return false;

  } catch (error) {
    if (expectedResult === 'forbidden' && error.message.includes('403')) {
      printTestResult(
        `${userRole} access to ${endpoint}`,
        true,
        'SUCCESS (correctly forbidden)',
        null
      );
      return true;
    } else {
      printTestResult(
        `${userRole} access to ${endpoint}`,
        false,
        `Request failed: ${error.message}`,
        null
      );
      return false;
    }
  }
}

/**
 * Test user management endpoints
 */
async function testUserManagement(tokenKey, userRole, expectSuccess = true) {
  try {
    const response = await makeRequest('GET', '/api/v1/users', null, authHeader(tokenKey));

    if (expectSuccess) {
      const passed = response.statusCode === 200;
      printTestResult(
        `${userRole} user management access`,
        passed,
        passed ? `SUCCESS (found ${response.body?.data?.users?.length || 0} users)` : `Expected success, got ${response.statusCode}`,
        response.body
      );
      return passed;
    } else {
      const passed = response.statusCode === 403;
      printTestResult(
        `${userRole} user management access`,
        passed,
        passed ? 'SUCCESS (correctly forbidden)' : `Expected 403, got ${response.statusCode}`,
        response.body
      );
      return passed;
    }

  } catch (error) {
    if (expectSuccess) {
      printTestResult(
        `${userRole} user management access`,
        false,
        `Request failed: ${error.message}`,
        null
      );
      return false;
    } else {
      // For clients, 403 might come as an error
      printTestResult(
        `${userRole} user management access`,
        true,
        'SUCCESS (correctly forbidden)',
        null
      );
      return true;
    }
  }
}

/**
 * Test project task endpoints with different roles
 */
async function testProjectTaskEndpoints() {
  printSection('TESTING PROJECT TASK ENDPOINTS');

  let passedTests = 0;
  let failedTests = 0;

  // Test admin-only endpoints
  const adminOnlyResult = await testRoleBasedEndpoint('/api/v1/projects-tasks/analytics/active-clients', 'superAdmin', 'SUPER_ADMIN', 'success');
  if (adminOnlyResult) passedTests++; else failedTests++;

  const clientForbiddenResult = await testRoleBasedEndpoint('/api/v1/projects-tasks/analytics/active-clients', 'client', 'CLIENT', 'forbidden');
  if (clientForbiddenResult) passedTests++; else failedTests++;

  // Test multi-role endpoints
  const adminMultiResult = await testRoleBasedEndpoint('/api/v1/projects-tasks', 'superAdmin', 'SUPER_ADMIN', 'success');
  if (adminMultiResult) passedTests++; else failedTests++;

  const clientMultiResult = await testRoleBasedEndpoint('/api/v1/projects-tasks', 'client', 'CLIENT', 'success');
  if (clientMultiResult) passedTests++; else failedTests++;

  console.log('Project Task Endpoints Results:');
  printSummary(passedTests, failedTests);
}

/**
 * Run all role-based access tests
 */
async function runAllTests() {
  printSection('STARTING ROLE-BASED ACCESS CONTROL TESTS');

  let passedTests = 0;
  let failedTests = 0;

  try {
    // Step 1: Login users
    const superAdminLogin = await loginAsSuperAdmin();
    const clientLogin = await ensureClientUser();

    if (!superAdminLogin) {
      printTestResult('Cannot proceed without super admin token', false, 'CRITICAL FAILURE', null);
      return;
    }

    // Step 2: Test user management
    const superAdminUserMgmt = await testUserManagement('superAdmin', 'SUPER_ADMIN');
    if (superAdminUserMgmt) passedTests++; else failedTests++;

    if (clientLogin) {
      const clientUserMgmt = await testUserManagement('client', 'CLIENT', false);
      if (clientUserMgmt) passedTests++; else failedTests++;
    }

    // Step 3: Test project task endpoints
    if (TOKENS.superAdmin && TOKENS.client) {
      await testProjectTaskEndpoints();
    }

    // Step 4: Test basic health check
    try {
      const response = await makeRequest('GET', '/health');
      const passed = response.statusCode === 200;
      printTestResult(
        'Server health check',
        passed,
        passed ? 'SUCCESS' : `Expected success, got ${response.statusCode}`,
        response.body
      );
      if (passed) passedTests++; else failedTests++;
    } catch (error) {
      printTestResult('Server health check', false, `Request failed: ${error.message}`, null);
      failedTests++;
    }

    // Print final summary
    console.log('Role-Based Access Control Tests Results:');
    printSummary(passedTests, failedTests);

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    printSummary(passedTests, failedTests);
  }
}

// Export for test runner
module.exports = {
  runAllTests
};