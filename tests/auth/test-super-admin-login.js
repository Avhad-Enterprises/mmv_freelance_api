#!/usr/bin/env node

/**
 * Super Admin Login Test
 * Logs in as super admin and stores the token for use in other tests
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSummary,
  storeToken,
} = require('../test-utils');

async function testSuperAdminLogin() {
  console.log('🔐 Testing Super Admin Login\n');

  console.log('============================================================');
  console.log('SUPER ADMIN LOGIN TEST');
  console.log('============================================================\n');

  // Test: Login as super admin
  console.log('Test: Login as super admin');
  const loginData = {
    email: 'superadmin@mmv.com',
    password: 'SuperAdmin123!'
  };

  const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, loginData);

  const passed = response.statusCode === 200 && response.body && response.body.success === true;
  printTestResult(
    'Super admin login',
    passed,
    passed ? 'Successfully logged in as super admin' : `Login failed: ${response.statusCode}`,
    response.body
  );

  if (passed && response.body.data && response.body.data.token) {
    // Store the token for use in other tests
    storeToken('admin', response.body.data.token);
    console.log('\n✅ Admin token stored for subsequent tests');
  }

  printSummary();
}

testSuperAdminLogin().catch(console.error);