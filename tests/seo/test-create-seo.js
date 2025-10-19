#!/usr/bin/env node

/**
 * SEO Create API Test
 * Tests the POST /seos endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  TOKENS,
  authHeader
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get super admin token
 */
async function loginAsSuperAdmin() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('superAdmin', response.body.data.token);
      printTestResult('Super admin login', true, 'SUCCESS', null);
      return true;
    } else {
      printTestResult('Super admin login', false, `Expected success, got ${response.statusCode}`, response.body);
      return false;
    }
  } catch (error) {
    printTestResult('Super admin login', false, `Request failed: ${error.message}`, null);
    return false;
  }
}
/**
 * Test creating SEO entries
 */
async function testCreateSeo() {
  printSection('Testing Create SEO');

  // Test 1: Create SEO without auth
  console.log('Test 1: Create SEO without authentication');
  console.log('📤 Request: POST /seos');
  console.log('📦 Body:', {
    meta_title: 'Test Page Title',
    meta_description: 'This is a test meta description for SEO testing'
  });
  console.log('� Auth: None');

  const response1 = await makeRequest('POST', `${CONFIG.apiVersion}/seos`, {
    meta_title: 'Test Page Title',
    meta_description: 'This is a test meta description for SEO testing'
  });

  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Create SEO without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Create SEO with valid data
  console.log('\nTest 2: Create SEO with valid data');
  console.log('📤 Request: POST /seos');
  console.log('📦 Body:', {
    meta_title: 'Test Page Title',
    meta_description: 'This is a test meta description for SEO testing',
    canonical_url: 'https://example.com/test-page',
    og_title: 'Test OG Title',
    og_description: 'Test OG Description',
    og_image_url: 'https://example.com/test-image.jpg',
    og_site_name: 'Test Site',
    og_locale: 'en_US',
    twitter_card: 'summary_large_image',
    twitter_title: 'Test Twitter Title',
    twitter_description: 'Test Twitter Description',
    twitter_image_url: 'https://example.com/test-twitter-image.jpg',
    twitter_site: '@testsite',
    twitter_creator: '@testcreator',
    status: 'active'
  });
  console.log('🔑 Auth: Bearer token (super admin)');

  const response2 = await makeRequest('POST', `${CONFIG.apiVersion}/seos`, {
    meta_title: 'Test Page Title',
    meta_description: 'This is a test meta description for SEO testing',
    canonical_url: 'https://example.com/test-page',
    og_title: 'Test OG Title',
    og_description: 'Test OG Description',
    og_image_url: 'https://example.com/test-image.jpg',
    og_site_name: 'Test Site',
    og_locale: 'en_US',
    twitter_card: 'summary_large_image',
    twitter_title: 'Test Twitter Title',
    twitter_description: 'Test Twitter Description',
    twitter_image_url: 'https://example.com/test-twitter-image.jpg',
    twitter_site: '@testsite',
    twitter_creator: '@testcreator',
    status: 'active'
  }, authHeader('superAdmin'));

  console.log('� Response Status:', response2.statusCode);
  console.log('� Response Body:', JSON.stringify(response2.body, null, 2));

  const test2Passed = response2.statusCode === 201 && response2.body?.data;
  printTestResult('Create SEO with valid data', test2Passed, `Status: ${response2.statusCode}, Expected: 201`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Create SEO with invalid data (empty title)
  console.log('\nTest 3: Create SEO with invalid data (empty title)');
  console.log('📤 Request: POST /seos');
  console.log('📦 Body:', {
    meta_title: '',
    meta_description: 'Valid description'
  });
  console.log('🔑 Auth: Bearer token (super admin)');

  const response3 = await makeRequest('POST', `${CONFIG.apiVersion}/seos`, {
    meta_title: '',
    meta_description: 'Valid description'
  }, authHeader('superAdmin'));

  console.log('📥 Response Status:', response3.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response3.body, null, 2));

  const test3Passed = response3.statusCode === 400;
  printTestResult('Create SEO with invalid data', test3Passed, `Status: ${response3.statusCode}, Expected: 400`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Create SEO with missing required fields
  console.log('\nTest 4: Create SEO with missing required fields');
  console.log('📤 Request: POST /seos');
  console.log('📦 Body:', {});
  console.log('🔑 Auth: Bearer token (super admin)');

  const response4 = await makeRequest('POST', `${CONFIG.apiVersion}/seos`, {}, authHeader('superAdmin'));

  console.log('📥 Response Status:', response4.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response4.body, null, 2));

  const test4Passed = response4.statusCode === 400;
  printTestResult('Create SEO with missing fields', test4Passed, `Status: ${response4.statusCode}, Expected: 400`, response4);
  if (test4Passed) passedTests++; else failedTests++;
}

/**
 * Test: Create SEO with Invalid Data
 */
async function testCreateSeoInvalidData() {
  console.log('\n🧪 Testing: Create SEO with Invalid Data');
  console.log('='.repeat(50));

  try {
    const invalidData = {
      meta_title: '', // Empty title should fail validation
      meta_description: 'Valid description'
    };

    console.log(`📝 Attempting to create SEO with invalid data...`);
    const createResponse = await makeRequest('POST', `${BASE_URL}/seos`, invalidData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${createResponse.statusCode}`);

    if (createResponse.statusCode === 400) {
      console.log(`${COLORS.green}✅ PASS: Correctly rejected invalid data${COLORS.reset}`);
      return { success: true };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Should have rejected invalid data with 400${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Create SEO without Authentication
 */
async function testCreateSeoNoAuth() {
  console.log('\n🧪 Testing: Create SEO without Authentication');
  console.log('='.repeat(50));

  try {
    const seoData = {
      meta_title: 'Test Title',
      meta_description: 'Test description',
      created_by: 1
    };

    console.log(`📝 Attempting to create SEO without authentication...`);
    const createResponse = await makeRequest('POST', `${BASE_URL}/seos`, seoData, {
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${createResponse.statusCode}`);

    if (createResponse.statusCode === 401 || createResponse.statusCode === 403) {
      console.log(`${COLORS.green}✅ PASS: Correctly rejected unauthenticated request${COLORS.reset}`);
      return { success: true };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Should have rejected unauthenticated request${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SEO CREATE API TESTS');
  console.log('========================\n');

  // Login first
  const loginSuccess = await loginAsSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without super admin authentication');
    process.exit(1);
  }

  // Run tests
  await testCreateSeo();

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