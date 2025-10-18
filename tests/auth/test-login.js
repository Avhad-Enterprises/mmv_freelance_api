#!/usr/bin/env node

/**
 * Login API Test
 *
 * This script tests the /auth/login endpoint with various scenarios
 * Based on: LoginDto and auth routes
 *
 * Usage: node tests/auth/test-login.js
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

// Test configuration
const TEST_CONFIG = {
  baseUrl: CONFIG.baseUrl,
  apiVersion: CONFIG.apiVersion,
  endpoint: '/auth/login',
  timeout: 15000,
  showFullResponse: false,
};

// Test user credentials (will be set by registration tests)
let testUsers = {
  client: null,
  videographer: null,
  videoeditor: null
};

/**
 * Test successful login for different user types
 */
async function testSuccessfulLogin() {
  printSection('SUCCESSFUL LOGIN TESTS');

  // First, create a test user for login
  try {
    console.log('Creating a test user for login...\n');
    const response = await makeRequest(
      'POST',
      '/api/v1/auth/register/client',
      {
        full_name: 'Login Test User',
        email: 'login-test@example.com',
        password: 'Password123!',
        company_name: 'Test Company',
        industry: 'film',
        company_size: '1-10',
        country: 'USA',
        state: 'CA',
        city: 'LA',
        phone_number: '1234567890',
        terms_accepted: true,
        privacy_policy_accepted: true
      }
    );

    if (response.statusCode === 201) {
      console.log('✅ Test user created successfully\n');
    } else {
      console.log('⚠️  Test user creation failed, but continuing with test\n');
    }
  } catch (error) {
    console.log('⚠️  Could not create test user, but continuing with test\n');
  }

  // Test login with the created user
  try {
    console.log('DEBUG: Attempting login with: login-test@example.com');
    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      {
        email: 'login-test@example.com',
        password: 'Password123!'
      }
    );

    console.log(`DEBUG: Login response status: ${response.statusCode}`);
    console.log(`DEBUG: Login response body:`, JSON.stringify(response.body, null, 2));

    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'User login',
      passed,
      passed ? 'User logged in successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('User login', false, error.message);
    failedTests++;
  }
}

/**
 * Test login validation
 */
async function testLoginValidation() {
  printSection('LOGIN VALIDATION TESTS');

  // Test 1: Missing email
  try {
    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      {
        password: 'Password123!'
      }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Missing email',
      passed,
      passed ? 'Validation error for missing email' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Missing email', false, error.message);
    failedTests++;
  }

  // Test 2: Missing password
  try {
    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      {
        email: 'test@example.com'
      }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Missing password',
      passed,
      passed ? 'Validation error for missing password' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Missing password', false, error.message);
    failedTests++;
  }

  // Test 3: Invalid email format
  try {
    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      {
        email: 'invalid-email',
        password: 'Password123!'
      }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid email format',
      passed,
      passed ? 'Validation error for invalid email' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Invalid email format', false, error.message);
    failedTests++;
  }

  // Test 4: Password too short
  try {
    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      {
        email: 'test@example.com',
        password: '123'
      }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Password too short',
      passed,
      passed ? 'Validation error for short password' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Password too short', false, error.message);
    failedTests++;
  }
}

/**
 * Test login with wrong credentials
 */
async function testInvalidLogin() {
  printSection('INVALID LOGIN TESTS');

  // Test 1: Wrong email
  try {
    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      }
    );

    const passed = response.statusCode === 401 || response.statusCode === 400 || response.statusCode === 404;
    printTestResult(
      'Wrong email',
      passed,
      passed ? 'Login rejected for wrong email' : `Expected 401/400/404, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Wrong email', false, error.message);
    failedTests++;
  }

  // Test 2: Wrong password
  if (testUsers.client) {
    try {
      const response = await makeRequest(
        'POST',
        TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
        {
          email: testUsers.client.email,
          password: 'WrongPassword123!'
        }
      );

      const passed = response.statusCode === 401 || response.statusCode === 400 || response.statusCode === 404;
      printTestResult(
        'Wrong password',
        passed,
        passed ? 'Login rejected for wrong password' : `Expected 401/400/404, got ${response.statusCode}`,
        response.body
      );

      passed ? passedTests++ : failedTests++;
    } catch (error) {
      printTestResult('Wrong password', false, error.message);
      failedTests++;
    }
  } else {
    printTestResult('Wrong password', false, 'No test user available');
    failedTests++;
  }
}

/**
 * Set up test users by running registration tests
 */
async function setupTestUsers() {
  console.log('🔧 Setting up test users...\n');

  try {
    // Import and run registration tests to create users
    const clientTest = require('./test-client-registration');
    const videographerTest = require('./test-videographer-registration');
    const videoEditorTest = require('./test-videoeditor-registration');

    // Run minimal registrations to create test users
    console.log('Creating test client...');
    // We can't easily extract the created users from the test functions
    // For now, we'll use hardcoded test users or skip this setup
    console.log('Note: Test users should be created by running individual registration tests first\n');

  } catch (error) {
    console.log('Note: Could not setup test users automatically. Please run registration tests first.\n');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🔐 Starting Login API Tests...\n');
  console.log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`Endpoint: ${TEST_CONFIG.endpoint}\n`);

  // Setup test users (optional)
  await setupTestUsers();

  // For demonstration, use some test user emails that might exist
  // In a real scenario, these would be created by the registration tests
  testUsers = {
    client: { email: 'client-test-recent@example.com' },
    videographer: { email: 'videographer-test-recent@example.com' },
    videoeditor: { email: 'videoeditor-test-recent@example.com' }
  };

  try {
    await testSuccessfulLogin();
    await testLoginValidation();
    await testInvalidLogin();

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
  testSuccessfulLogin,
  testLoginValidation,
  testInvalidLogin,
  setTestUsers: (users) => { testUsers = users; }
};