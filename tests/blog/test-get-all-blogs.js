#!/usr/bin/env node

/**
 * Blog API Test - Get All Blogs
 *
 * This script tests the /blog/getallblogs endpoint
 *
 * Usage: node tests/blog/test-get-all-blogs.js
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
  endpoint: '/blog',
  timeout: 15000,
  showFullResponse: false,
};

/**
 * Test successful get all blogs
 */
async function testGetAllBlogs() {
  printSection('GET ALL BLOGS TESTS');

  try {
    console.log(`DEBUG: Requesting URL: ${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiVersion}${TEST_CONFIG.endpoint}`);
    const response = await makeRequest(
      'GET',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null
    );

    console.log(`DEBUG: Response status: ${response.statusCode}`);
    console.log(`DEBUG: Response body:`, JSON.stringify(response.body, null, 2));

    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get all blogs',
      passed,
      passed ? 'Blogs fetched successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    if (passed && response.body.data) {
      console.log(`📊 Found ${response.body.data.length} blogs`);
    }

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get all blogs', false, error.message);
    failedTests++;
  }
}

/**
 * Run all blog tests
 */
async function runTests() {
  console.log('\n📝 Starting Blog API Tests...\n');
  console.log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`Endpoint: ${TEST_CONFIG.endpoint}\n`);

  await testGetAllBlogs();

  printSummary(passedTests, failedTests, passedTests + failedTests);

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testGetAllBlogs: runTests
};