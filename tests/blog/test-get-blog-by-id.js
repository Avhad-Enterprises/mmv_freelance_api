#!/usr/bin/env node

/**
 * Blog Get By ID API Test
 * Tests the GET /blog/:id endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Test Get Blog By ID
 */
async function testGetBlogById() {
  printSection('Testing Get Blog by ID');

  // First, get all blogs to find an existing one
  let existingBlogId = null;
  try {
    const allBlogsResponse = await makeRequest('GET', `${CONFIG.apiVersion}/blog`);
    if (allBlogsResponse.body?.data && allBlogsResponse.body.data.length > 0) {
      existingBlogId = allBlogsResponse.body.data[0].blog_id;
      console.log(`Found existing blog with ID: ${existingBlogId}\n`);
    }
  } catch (error) {
    console.log('⚠️  Could not fetch existing blogs\n');
  }

  // Test 1: Get blog by valid ID
  if (existingBlogId) {
    console.log('Test 1: Get blog by valid ID without authentication');
    console.log(`📤 Request: GET /blog/${existingBlogId}`);
    console.log('🔑 Auth: None');

    const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/blog/${existingBlogId}`);

    console.log('📥 Response Status:', response1.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

    const test1Passed = response1.statusCode === 200 &&
                       response1.body?.success === true &&
                       response1.body?.data?.blog_id === existingBlogId;
    printTestResult('Get blog by valid ID without auth', test1Passed,
      `Status: ${response1.statusCode}, Expected: 200, Blog ID matches: ${response1.body?.data?.blog_id === existingBlogId}`,
      response1);
    if (test1Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 1 - No existing blog found');
  }

  // Test 2: Get blog by invalid ID
  console.log('\nTest 2: Get blog by invalid ID');
  console.log('📤 Request: GET /blog/999999');
  console.log('🔑 Auth: None');

  const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/blog/999999`);

  console.log('📥 Response Status:', response2.statusCode);

  const test2Passed = response2.statusCode === 404;
  printTestResult('Get blog by invalid ID', test2Passed, `Status: ${response2.statusCode}, Expected: 404`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Get blog by non-numeric ID
  console.log('\nTest 3: Get blog by non-numeric ID');
  console.log('📤 Request: GET /blog/abc');
  console.log('🔑 Auth: None');

  const response3 = await makeRequest('GET', `${CONFIG.apiVersion}/blog/abc`);

  console.log('📥 Response Status:', response3.statusCode);

  const test3Passed = response3.statusCode === 400;
  printTestResult('Get blog by non-numeric ID', test3Passed, `Status: ${response3.statusCode}, Expected: 400`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Verify response structure
  if (existingBlogId) {
    console.log('\nTest 4: Verify response structure for valid blog');

    const response4 = await makeRequest('GET', `${CONFIG.apiVersion}/blog/${existingBlogId}`);

    const hasRequiredFields = response4.body?.data?.blog_id &&
                             response4.body?.data?.title &&
                             response4.body?.data?.slug &&
                             response4.body?.data?.author_name;

    const test4Passed = response4.statusCode === 200 && hasRequiredFields;
    printTestResult('Verify response structure', test4Passed,
      `Status: ${response4.statusCode}, Has required fields: ${hasRequiredFields}`, response4);
    if (test4Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 4 - No existing blog found');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 BLOG GET BY ID API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testGetBlogById();

  // Print summary
  printSummary(passedTests, failedTests, passedTests + failedTests);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
