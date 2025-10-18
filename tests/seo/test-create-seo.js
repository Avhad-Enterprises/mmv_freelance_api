const http = require('http');
const { CONFIG, makeRequest, COLORS } = require('../test-utils');

// Configuration
const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';

// Test data
const testUsers = {
  superAdmin: {
    email: 'avhadenterprisespc5@gmail.com',
    password: 'SuperAdmin123!'
  }
};

// Global variables
let superAdminToken = '';

/**
 * Test: Create SEO (POST /api/v1/seos)
 */
async function testCreateSeo() {
  console.log('\n🧪 Testing: Create SEO (POST /api/v1/seos)');
  console.log('='.repeat(50));

  try {
    // First, login as super admin to get token
    console.log('🔐 Logging in as super admin...');
    const loginResponse = await makeRequest('POST', `${BASE_URL}/auth/login`, {
      email: testUsers.superAdmin.email,
      password: testUsers.superAdmin.password
    });

    if (loginResponse.statusCode !== 200) {
      throw new Error(`Login failed: ${loginResponse.statusCode} - ${JSON.stringify(loginResponse.body)}`);
    }

    superAdminToken = loginResponse.body.data.token;
    console.log('✅ Super admin login successful');

    // Create a test SEO entry
    console.log('📝 Creating a test SEO entry...');
    const seoData = {
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
    };

    const createResponse = await makeRequest('POST', `${BASE_URL}/seos`, seoData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${createResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(createResponse.body, null, 2)}`);

    if (createResponse.statusCode === 201) {
      console.log(`${COLORS.green}✅ PASS: SEO entry created successfully${COLORS.reset}`);

      // Validate response structure
      if (createResponse.body && createResponse.body.data) {
        const seo = createResponse.body.data;

        if (seo.id && seo.meta_title === seoData.meta_title) {
          console.log(`${COLORS.green}✅ PASS: Response data matches created SEO entry${COLORS.reset}`);
          return { success: true, seoId: seo.id };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response data does not match created SEO entry${COLORS.reset}`);
          return { success: false };
        }
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing data field${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 201, got ${createResponse.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
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

// Main test runner
async function runTests() {
  console.log('🚀 Starting Create SEO Tests');
  console.log('=====================================');

  const results = [];

  // Test successful create
  const createResult = await testCreateSeo();
  results.push({ test: 'Create SEO - Success', ...createResult });

  // Test invalid data
  const invalidDataResult = await testCreateSeoInvalidData();
  results.push({ test: 'Create SEO - Invalid Data', ...invalidDataResult });

  // Test no authentication
  const noAuthResult = await testCreateSeoNoAuth();
  results.push({ test: 'Create SEO - No Auth', ...noAuthResult });

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.success ? `${COLORS.green}✅ PASS${COLORS.reset}` : `${COLORS.red}❌ FAIL${COLORS.reset}`;
    console.log(`${status} ${result.test}`);
  });

  console.log(`\n📈 Total: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log(`${COLORS.green}🎉 All tests passed!${COLORS.reset}`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}💥 Some tests failed${COLORS.reset}`);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testCreateSeo, testCreateSeoInvalidData, testCreateSeoNoAuth };