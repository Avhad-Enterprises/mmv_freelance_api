#!/usr/bin/env node

/**
 * Contact Form API Test
 *
 * This script tests the /contact/submit endpoint
 * Based on: ContactSubmissionDto and contact routes
 *
 * Usage: node tests/contact/test-contact-submit.js
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
  endpoint: '/contact/submit',
  timeout: 15000,
  showFullResponse: false,
};

/**
 * Test successful contact form submission
 */
async function testSuccessfulContactSubmission() {
  printSection('SUCCESSFUL CONTACT FORM SUBMISSION TESTS');

  // Test 1: Complete contact form submission with all fields
  try {
    const contactData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      subject: 'General Inquiry',
      message: 'Hello, I am interested in your video production services. Can you please provide more information about your packages and pricing?'
    };

    console.log(`DEBUG: Requesting URL: ${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiVersion}${TEST_CONFIG.endpoint}`);
    console.log(`DEBUG: Request data:`, JSON.stringify(contactData, null, 2));

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      contactData
    );

    console.log(`DEBUG: Response status: ${response.statusCode}`);
    console.log(`DEBUG: Response headers:`, response.headers);
    console.log(`DEBUG: Response body:`, JSON.stringify(response.body, null, 2));

    if (response.statusCode !== 201) {
      console.log(`DEBUG: Error details:`, response.body?.message || 'No error message');
      if (response.body?.errors) {
        console.log(`DEBUG: Validation errors:`, response.body.errors);
      }
    }

    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Complete contact form submission',
      passed,
      passed ? 'Contact form submitted successfully' : `Expected 201, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    console.log(`DEBUG: Exception caught:`, error.message);
    console.log(`DEBUG: Stack trace:`, error.stack);
    printTestResult('Complete contact form submission', false, error.message);
    failedTests++;
  }

  // Test 2: Minimal contact form submission (required fields only)
  try {
    const minimalData = {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      message: 'I need help with a video project.'
    };

    console.log(`DEBUG: Minimal submission - Request data:`, JSON.stringify(minimalData, null, 2));

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      minimalData
    );

    console.log(`DEBUG: Minimal submission - Response status: ${response.statusCode}`);
    console.log(`DEBUG: Minimal submission - Response body:`, JSON.stringify(response.body, null, 2));

    if (response.statusCode !== 201) {
      console.log(`DEBUG: Minimal submission - Error details:`, response.body?.message || 'No error message');
    }

    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Minimal contact form submission',
      passed,
      passed ? 'Contact form submitted with minimal data' : `Expected 201, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    console.log(`DEBUG: Minimal submission - Exception caught:`, error.message);
    printTestResult('Minimal contact form submission', false, error.message);
    failedTests++;
  }
}

/**
 * Test contact form validation
 */
async function testContactFormValidation() {
  printSection('CONTACT FORM VALIDATION TESTS');

  // Test 1: Missing required fields
  try {
    const invalidData = {
      name: 'Test User'
      // Missing email and message
    };

    console.log(`DEBUG: Validation test - Missing fields - Request data:`, JSON.stringify(invalidData, null, 2));

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      invalidData
    );

    console.log(`DEBUG: Validation test - Missing fields - Response status: ${response.statusCode}`);
    console.log(`DEBUG: Validation test - Missing fields - Response body:`, JSON.stringify(response.body, null, 2));

    const passed = response.statusCode === 400;
    printTestResult(
      'Missing required fields',
      passed,
      passed ? 'Validation error returned for missing fields' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    console.log(`DEBUG: Validation test - Missing fields - Exception caught:`, error.message);
    printTestResult('Missing required fields', false, error.message);
    failedTests++;
  }

  // Test 2: Invalid email format
  try {
    const invalidData = {
      name: 'Test User',
      email: 'invalid-email',
      message: 'Test message'
    };

    console.log(`DEBUG: Validation test - Invalid email - Request data:`, JSON.stringify(invalidData, null, 2));

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      invalidData
    );

    console.log(`DEBUG: Validation test - Invalid email - Response status: ${response.statusCode}`);
    console.log(`DEBUG: Validation test - Invalid email - Response body:`, JSON.stringify(response.body, null, 2));

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid email format',
      passed,
      passed ? 'Validation error for invalid email' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    console.log(`DEBUG: Validation test - Invalid email - Exception caught:`, error.message);
    printTestResult('Invalid email format', false, error.message);
    failedTests++;
  }

  // Test 3: Message too long (over 2000 characters)
  try {
    const longMessage = 'A'.repeat(2001); // 2001 characters
    const invalidData = {
      name: 'Test User',
      email: 'test@example.com',
      message: longMessage
    };

    console.log(`DEBUG: Validation test - Long message - Message length: ${longMessage.length}`);

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      invalidData
    );

    console.log(`DEBUG: Validation test - Long message - Response status: ${response.statusCode}`);
    console.log(`DEBUG: Validation test - Long message - Response body:`, JSON.stringify(response.body, null, 2));

    const passed = response.statusCode === 400;
    printTestResult(
      'Message too long',
      passed,
      passed ? 'Validation error for message length' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    console.log(`DEBUG: Validation test - Long message - Exception caught:`, error.message);
    printTestResult('Message too long', false, error.message);
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('📧 Starting Contact Form API Tests...\n');
  console.log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`Endpoint: ${TEST_CONFIG.endpoint}\n`);

  try {
    await testSuccessfulContactSubmission();
    await testContactFormValidation();

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
  testSuccessfulContactSubmission,
  testContactFormValidation
};