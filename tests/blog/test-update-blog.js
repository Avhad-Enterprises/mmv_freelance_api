#!/usr/bin/env node

/**
 * Blog Update API Test
 * Tests the PUT /blog endpoint
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
 * Test Update Blog
 */
async function testUpdateBlog() {
  printSection('Testing Update Blog');

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

  // Create a test blog for updating
  if (adminToken) {
    try {
      const blogData = {
        title: 'Test Blog for Update',
        slug: 'test-blog-for-update-' + Date.now(),
        author_name: 'Test Author',
        content: 'This blog will be updated in tests',
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

  // Test 1: Update blog without authentication
  if (testBlogId) {
    console.log('\nTest 1: Update blog without authentication');
    console.log('📤 Request: PUT /blog');
    console.log('🔑 Auth: None');

    const updateData = {
      blog_id: testBlogId,
      title: 'Updated title without auth',
      slug: 'updated-slug'
    };

    const response1 = await makeRequest('PUT', `${CONFIG.apiVersion}/blog`, updateData);

    console.log('📥 Response Status:', response1.statusCode);

    const test1Passed = response1.statusCode === 401;
    printTestResult('Update blog without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
    if (test1Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 1 - No test blog available');
  }

  // Test 2: Update blog with valid admin authentication
  if (adminToken && testBlogId) {
    console.log('\nTest 2: Update blog with valid admin authentication');
    console.log('📤 Request: PUT /blog');
    console.log('🔑 Auth: Bearer token (admin)');

    const updateData = {
      blog_id: testBlogId,
      title: 'Updated Blog Title',
      content: 'This is the updated content for the blog post.',
      status: 'published'
    };

    const response2 = await makeRequest('PUT', `${CONFIG.apiVersion}/blog`, updateData, authHeader('admin'));

    console.log('📥 Response Status:', response2.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

    const test2Passed = response2.statusCode === 200 &&
                       response2.body?.success === true &&
                       response2.body?.data?.blog_id === testBlogId &&
                       response2.body?.data?.title === updateData.title;
    printTestResult('Update blog with admin auth', test2Passed,
      `Status: ${response2.statusCode}, Expected: 200, Blog updated: ${!!response2.body?.data?.blog_id}`, response2);
    if (test2Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 2 - No admin token or test blog available');
  }

  // Test 3: Update blog with invalid ID
  if (adminToken) {
    console.log('\nTest 3: Update blog with invalid ID');
    console.log('📤 Request: PUT /blog (invalid ID)');
    console.log('🔑 Auth: Bearer token (admin)');

    const updateData = {
      blog_id: 999999,
      title: 'This should fail',
      slug: 'invalid-update'
    };

    const response3 = await makeRequest('PUT', `${CONFIG.apiVersion}/blog`, updateData, authHeader('admin'));

    console.log('📥 Response Status:', response3.statusCode);

    const test3Passed = response3.statusCode === 404;
    printTestResult('Update blog with invalid ID', test3Passed, `Status: ${response3.statusCode}, Expected: 404`, response3);
    if (test3Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 3 - No admin token available');
  }

  // Test 4: Update blog without blog_id
  if (adminToken) {
    console.log('\nTest 4: Update blog without blog_id');
    console.log('📤 Request: PUT /blog (missing ID)');
    console.log('🔑 Auth: Bearer token (admin)');

    const updateData = {
      // Missing blog_id
      title: 'This should fail',
      slug: 'missing-id'
    };

    const response4 = await makeRequest('PUT', `${CONFIG.apiVersion}/blog`, updateData, authHeader('admin'));

    console.log('📥 Response Status:', response4.statusCode);

    const test4Passed = response4.statusCode === 400;
    printTestResult('Update blog without ID', test4Passed, `Status: ${response4.statusCode}, Expected: 400`, response4);
    if (test4Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 4 - No admin token available');
  }

  // Clean up: delete the test blog
  if (adminToken && testBlogId) {
    try {
      await makeRequest('DELETE', `${CONFIG.apiVersion}/blog`, { blog_id: testBlogId }, authHeader('admin'));
      console.log(`🧹 Cleaned up test blog with ID: ${testBlogId}`);
    } catch (error) {
      console.log('⚠️  Could not clean up test blog:', error.message);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 BLOG UPDATE API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testUpdateBlog();

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
