#!/usr/bin/env node

/**
 * Blog Delete API Test
 * Tests the DELETE /blog endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  authHeader,
  storeToken
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;
let adminToken = null;
let testBlogId = null;

/**
 * Test Delete Blog
 */
async function testDeleteBlog() {
  printSection('Testing Delete Blog');

  // Login as admin first
  try {
    console.log('🔐 Logging in as admin...');
    const loginResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    if (loginResponse.body?.data?.token) {
      adminToken = loginResponse.body.data.token;
      storeToken('admin', adminToken);
      console.log('✅ Admin login successful');
    } else {
      console.log('⚠️  Admin login failed, admin tests will be skipped');
    }
  } catch (error) {
    console.log('⚠️  Admin login failed:', error.message);
  }

  // Create a test blog for deleting
  if (adminToken) {
    try {
      const blogData = {
        title: 'Test Blog for Deletion',
        slug: 'test-blog-for-deletion-' + Date.now(),
        author_name: 'Test Author',
        content: 'This blog will be deleted in tests',
        created_by: 84
      };

      const createResponse = await makeRequest('POST', `${CONFIG.apiVersion}/blog`, blogData, authHeader('admin'));

      if (createResponse.body?.data?.blog_id) {
        testBlogId = createResponse.body.data.blog_id;
        console.log(`✅ Test blog created with ID: ${testBlogId}`);
      }
    } catch (error) {
      console.log('⚠️  Could not create test blog:', error.message);
    }
  }

  // Test 1: Delete blog without authentication
  if (testBlogId) {
    console.log('\nTest 1: Delete blog without authentication');
    console.log('📤 Request: DELETE /blog');
    console.log('🔑 Auth: None');

    const deleteData = {
      blog_id: testBlogId
    };

    const response1 = await makeRequest('DELETE', `${CONFIG.apiVersion}/blog`, deleteData);

    console.log('📥 Response Status:', response1.statusCode);

    const test1Passed = response1.statusCode === 401;
    printTestResult('Delete blog without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
    if (test1Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 1 - No test blog available');
  }

  // Test 2: Delete blog with valid admin authentication
  if (adminToken && testBlogId) {
    console.log('\nTest 2: Delete blog with valid admin authentication');
    console.log('📤 Request: DELETE /blog');
    console.log('🔑 Auth: Bearer token (admin)');

    const deleteData = {
      blog_id: testBlogId
    };

    const response2 = await makeRequest('DELETE', `${CONFIG.apiVersion}/blog`, deleteData, authHeader('admin'));

    console.log('📥 Response Status:', response2.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

    const test2Passed = response2.statusCode === 200 &&
                       response2.body?.success === true &&
                       response2.body?.data?.blog_id === testBlogId &&
                       response2.body?.data?.is_deleted === true;
    printTestResult('Delete blog with admin auth', test2Passed,
      `Status: ${response2.statusCode}, Expected: 200, Blog soft deleted: ${!!response2.body?.data?.is_deleted}`, response2);
    if (test2Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 2 - No admin token or test blog available');
  }

  // Test 3: Verify deleted blog is not returned in get all
  if (adminToken && testBlogId) {
    console.log('\nTest 3: Verify deleted blog is not returned in get all');

    try {
      // Wait a moment for the delete to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response3 = await makeRequest('GET', `${CONFIG.apiVersion}/blog`);
      const blogIds = response3.body?.data?.map(blog => blog.blog_id) || [];

      const test3Passed = !blogIds.includes(testBlogId);
      printTestResult('Verify deleted blog not in get all', test3Passed,
        `Deleted blog ID ${testBlogId} not in results: ${test3Passed}`, response3);
      if (test3Passed) passedTests++; else failedTests++;
    } catch (error) {
      console.log('❌ FAIL Verify deleted blog not returned:', error.message);
      failedTests++;
    }
  } else {
    console.log('\n⚠️  SKIP: Test 3 - No admin token or test blog available');
  }

  // Test 4: Delete blog with invalid ID
  if (adminToken) {
    console.log('\nTest 4: Delete blog with invalid ID');
    console.log('📤 Request: DELETE /blog (invalid ID)');
    console.log('🔑 Auth: Bearer token (admin)');

    const deleteData = {
      blog_id: 999999
    };

    const response4 = await makeRequest('DELETE', `${CONFIG.apiVersion}/blog`, deleteData, authHeader('admin'));

    console.log('📥 Response Status:', response4.statusCode);

    const test4Passed = response4.statusCode === 404;
    printTestResult('Delete blog with invalid ID', test4Passed, `Status: ${response4.statusCode}, Expected: 404`, response4);
    if (test4Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 4 - No admin token available');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 BLOG DELETE API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testDeleteBlog();

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
