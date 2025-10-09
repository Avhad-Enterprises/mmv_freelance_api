#!/usr/bin/env node

/**
 * Public APIs Test - Get All Jobs & Freelancers
 * Tests for public endpoints that don't require authentication
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
} = require('./test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Test get all jobs (public endpoint)
 */
async function testGetAllJobs() {
  printSection('GET ALL JOBS - PUBLIC API TEST');

  try {
    // Test without authentication (should work)
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/projectsTask/getallprojectlisting`);

    const success = response.statusCode === 200 && response.body && response.body.success === true;
    printTestResult('Get all jobs (no auth)', success, {
      status: response.statusCode,
      hasData: !!response.body,
      success: response.body?.success,
      count: response.body?.data?.length || 0
    });

    if (success) {
      passedTests++;
    } else {
      failedTests++;
      console.log('❌ Response:', JSON.stringify(response, null, 2));
    }

  } catch (error) {
    printTestResult('Get all jobs (no auth)', false, { error: error.message });
    failedTests++;
  }
}

/**
 * Test get all freelancers (public endpoint)
 */
async function testGetAllFreelancers() {
  printSection('GET ALL FREELANCERS - PUBLIC API TEST');

  try {
    // Test without authentication (should work)
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/freelancers/getfreelancers`);

    const success = response.statusCode === 200 && response.body && response.body.success === true;
    printTestResult('Get all freelancers (no auth)', success, {
      status: response.statusCode,
      hasData: !!response.body,
      success: response.body?.success,
      count: response.body?.data?.length || 0
    });

    if (success) {
      passedTests++;
    } else {
      failedTests++;
      console.log('❌ Response:', JSON.stringify(response, null, 2));
    }

  } catch (error) {
    printTestResult('Get all freelancers (no auth)', false, { error: error.message });
    failedTests++;
  }
}

/**
 * Test that endpoints reject authenticated requests (if they shouldn't)
 * Actually, these should work with or without auth, so this is optional
 */
async function testEndpointsWithAuth() {
  printSection('ENDPOINTS WITH AUTHENTICATION TEST (OPTIONAL)');

  // Note: These endpoints are designed to work without auth,
  // but they should also work with auth. This test is optional.

  console.log('ℹ️  Skipping auth test - endpoints are designed for public access');
}

/**
 * Run all public API tests
 */
async function runPublicAPITests() {
  console.log('🚀 Starting Public APIs Test Suite');
  console.log('📋 Testing endpoints that should work without authentication\n');

  await testGetAllJobs();
  await testGetAllFreelancers();
  await testEndpointsWithAuth();

  printSummary(passedTests, failedTests);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run tests
runPublicAPITests().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});