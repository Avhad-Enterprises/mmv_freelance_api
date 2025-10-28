#!/usr/bin/env node

/**
 * Contact Admin API Test
 *
 * This script tests the admin contact management endpoints
 * Based on: Contact routes and admin authentication
 *
 * Usage: node tests/contact/test-contact-admin.js
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  authHeader,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

// Test configuration
const TEST_CONFIG = {
  baseUrl: CONFIG.baseUrl,
  apiVersion: CONFIG.apiVersion,
  timeout: 15000,
  showFullResponse: false,
};

// Test data
let adminToken = null;
let testContactId = null;

/**
 * Admin login to get authentication token
 */
async function loginAsAdmin() {
  try {
    const loginData = {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    };

    const response = await makeRequest(
      'POST',
      '/api/v1/auth/login',
      loginData
    );

    if (response.statusCode === 200 && response.body.success) {
      adminToken = response.body.data.token;
      storeToken('admin', adminToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Admin login failed:', error.message);
    return false;
  }
}

/**
 * Create a test contact submission first
 */
async function createTestContactSubmission() {
  try {
    const contactData = {
      name: 'Admin Test User',
      email: 'admin.test@example.com',
      subject: 'Admin Test Subject',
      message: 'This is a test message for admin testing purposes.'
    };

    const response = await makeRequest(
      'POST',
      '/api/v1/contact/submit',
      contactData
    );

    if (response.statusCode === 201 && response.body.success) {
      testContactId = response.body.data.contact_id;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to create test contact:', error.message);
    return false;
  }
}

/**
 * Test admin contact management APIs
 */
async function testAdminContactAPIs() {
  printSection('ADMIN CONTACT MANAGEMENT API TESTS');

  // Test 1: Get all contact submissions (Admin only)
  try {
    const response = await makeRequest(
      'GET',
      '/api/v1/contact/messages',
      null,
      authHeader('admin')
    );

    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get all contact submissions (Admin)',
      passed,
      passed ? 'Contact submissions retrieved successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get all contact submissions (Admin)', false, error.message);
    failedTests++;
  }

  // Test 2: Get specific contact submission by ID (Admin only)
  if (testContactId) {
    try {
      const response = await makeRequest(
        'GET',
        `/api/v1/contact/messages/${testContactId}`,
        null,
        authHeader('admin')
      );

      const passed = response.statusCode === 200 && response.body.success === true;
      printTestResult(
        'Get contact submission by ID (Admin)',
        passed,
        passed ? 'Contact submission retrieved successfully' : `Expected 200, got ${response.statusCode}`,
        response.body
      );

      passed ? passedTests++ : failedTests++;
    } catch (error) {
      printTestResult('Get contact submission by ID (Admin)', false, error.message);
      failedTests++;
    }
  }

  // Test 3: Update contact status (Admin only)
  if (testContactId) {
    try {
      const updateData = {
        status: 'responded',
        notes: 'Responded via email on test date'
      };

      const response = await makeRequest(
        'PATCH',
        `/api/v1/contact/messages/${testContactId}/status`,
        updateData,
        authHeader('admin')
      );

      const passed = response.statusCode === 200 && response.body.success === true;
      printTestResult(
        'Update contact status (Admin)',
        passed,
        passed ? 'Contact status updated successfully' : `Expected 200, got ${response.statusCode}`,
        response.body
      );

      passed ? passedTests++ : failedTests++;
    } catch (error) {
      printTestResult('Update contact status (Admin)', false, error.message);
      failedTests++;
    }
  }

  // Test 4: Try to access admin endpoints without authentication
  try {
    const response = await makeRequest(
      'GET',
      '/api/v1/contact/messages'
    );

    const passed = response.statusCode === 401;
    printTestResult(
      'Access admin endpoint without auth',
      passed,
      passed ? 'Properly denied access' : `Expected 401, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Access admin endpoint without auth', false, error.message);
    failedTests++;
  }

  // Test 5: Try to update status with invalid status value
  if (testContactId) {
    try {
      const invalidUpdateData = {
        status: 'invalid_status',
        notes: 'This should fail'
      };

      const response = await makeRequest(
        'PATCH',
        `/api/v1/contact/messages/${testContactId}/status`,
        invalidUpdateData,
        authHeader('admin')
      );

      const passed = response.statusCode === 400;
      printTestResult(
        'Update with invalid status (Admin)',
        passed,
        passed ? 'Properly rejected invalid status' : `Expected 400, got ${response.statusCode}`,
        response.body
      );

      passed ? passedTests++ : failedTests++;
    } catch (error) {
      printTestResult('Update with invalid status (Admin)', false, error.message);
      failedTests++;
    }
  }

  // Test 6: Try to get non-existent contact submission
  try {
    const response = await makeRequest(
      'GET',
      '/api/v1/contact/messages/99999',
      null,
      authHeader('admin')
    );

    const passed = response.statusCode === 404;
    printTestResult(
      'Get non-existent contact submission',
      passed,
      passed ? 'Properly returned 404' : `Expected 404, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get non-existent contact submission', false, error.message);
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('👑 Starting Contact Admin API Tests...\n');
  console.log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`API Version: ${TEST_CONFIG.apiVersion}\n`);

  try {
    // Login as admin first
    console.log('🔐 Logging in as admin...');
    const loginSuccess = await loginAsAdmin();
    if (!loginSuccess) {
      console.error('❌ Failed to login as admin. Cannot run admin tests.');
      process.exit(1);
    }
    console.log('✅ Admin login successful\n');

    // Create a test contact submission
    console.log('📝 Creating test contact submission...');
    const contactCreated = await createTestContactSubmission();
    if (!contactCreated) {
      console.error('❌ Failed to create test contact. Cannot run admin tests.');
      process.exit(1);
    }
    console.log(`✅ Test contact created with ID: ${testContactId}\n`);

    // Run admin API tests
    await testAdminContactAPIs();

    printSummary(passedTests, failedTests);
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testAdminContactAPIs
};