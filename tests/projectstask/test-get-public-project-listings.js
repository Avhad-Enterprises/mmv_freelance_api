#!/usr/bin/env node

/**
 * Project Task Public Listing API Test
 * Tests the GET /projectsTask/getallprojectlisting-public endpoint
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

/**
 * Test getting public project listings
 */
async function testGetPublicProjectListings() {
  printSection('PROJECT TASK PUBLIC LISTING TESTS');

  // Test 1: Get public project listings (no auth required)
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getallprojectlisting-public`,
      null,
      {} // No authentication required for public endpoint
    );

    const passed = response.statusCode === 200 && response.body?.success === true && Array.isArray(response.body?.data);
    printTestResult(
      'Get public project listings',
      passed,
      passed ? `Retrieved ${response.body?.data?.length || 0} public project listings` : `Expected 200 with array, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get public project listings',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Verify response structure
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getallprojectlisting-public`,
      null,
      {}
    );

    if (response.statusCode === 200 && Array.isArray(response.body?.data)) {
      const firstProject = response.body.data[0];
      const hasExpectedFields = firstProject &&
        firstProject.project_title &&
        firstProject.project_description &&
        firstProject.budget !== undefined;

      printTestResult(
        'Verify response structure',
        hasExpectedFields,
        hasExpectedFields ? 'Response contains expected project fields' : 'Response missing expected fields',
        firstProject
      );

      if (hasExpectedFields) passedTests++;
      else failedTests++;
    } else {
      printTestResult(
        'Verify response structure',
        false,
        'Cannot verify structure due to failed request',
        null
      );
      failedTests++;
    }

  } catch (error) {
    printTestResult(
      'Verify response structure',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Testing Project Task Public Listing API\n');

  await testGetPublicProjectListings();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});