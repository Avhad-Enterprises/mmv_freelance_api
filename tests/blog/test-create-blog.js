#!/usr/bin/env node

/**
 * Blog Create API Test
 * Tests the POST /blog endpoint
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

/**
 * Test Create Blog
 */
async function testCreateBlog() {
  printSection('Testing Create Blog');

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
      console.log('✅ Admin login successful\n');
    } else {
      console.log('⚠️  Admin login failed, admin tests will be skipped\n');
    }
  } catch (error) {
    console.log('⚠️  Admin login failed:', error.message, '\n');
  }

  // Test 1: Create blog without authentication
  console.log('Test 1: Create blog without authentication');
  console.log('📤 Request: POST /blog');
  console.log('🔑 Auth: None');

  const blogData = {
    title: 'Test Blog Post',
    slug: 'test-blog-post-' + Date.now(),
    author_name: 'Test Author',
    content: 'This is test content'
  };

  const response1 = await makeRequest('POST', `${CONFIG.apiVersion}/blog`, blogData);
  console.log('📥 Response Status:', response1.statusCode);

  const test1Passed = response1.statusCode === 401;
  printTestResult('Create blog without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Create blog with valid admin authentication
  if (adminToken) {
    console.log('\nTest 2: Create blog with valid admin authentication');
    console.log('📤 Request: POST /blog');
    console.log('🔑 Auth: Bearer token (admin)');

    const validBlogData = {
      title: 'How to Create Amazing Videos',
      slug: 'how-to-create-amazing-videos-' + Date.now(),
      author_name: 'Test Admin',
      content: 'This is a comprehensive guide on creating amazing videos...',
      short_description: 'A guide to video creation',
      category: 'tutorial',
      status: 'published',
      created_by: 84
    };

    const response2 = await makeRequest('POST', `${CONFIG.apiVersion}/blog`, validBlogData, authHeader('admin'));

    console.log('📥 Response Status:', response2.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

    const test2Passed = response2.statusCode === 201 &&
                       response2.body?.success === true &&
                       response2.body?.data?.blog_id &&
                       response2.body?.data?.title === validBlogData.title;
    printTestResult('Create blog with admin auth', test2Passed,
      `Status: ${response2.statusCode}, Expected: 201, Blog created: ${!!response2.body?.data?.blog_id}`, response2);
    if (test2Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 2 - No admin token available');
  }

  // Test 3: Create blog with missing required fields
  if (adminToken) {
    console.log('\nTest 3: Create blog with missing required fields');
    console.log('📤 Request: POST /blog (invalid data)');
    console.log('🔑 Auth: Bearer token (admin)');

    const invalidBlogData = {
      // Missing title, slug, and author_name
      content: 'Some content'
    };

    const response3 = await makeRequest('POST', `${CONFIG.apiVersion}/blog`, invalidBlogData, authHeader('admin'));

    console.log('📥 Response Status:', response3.statusCode);

    const test3Passed = response3.statusCode === 400;
    printTestResult('Create blog with missing fields', test3Passed, `Status: ${response3.statusCode}, Expected: 400`, response3);
    if (test3Passed) passedTests++; else failedTests++;
  } else {
    console.log('\n⚠️  SKIP: Test 3 - No admin token available');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 BLOG CREATE API TESTS');
  console.log('=======================================\n');

  // Run tests
  await testCreateBlog();

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
