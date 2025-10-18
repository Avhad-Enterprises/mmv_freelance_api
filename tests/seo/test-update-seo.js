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
let testSeoId = null;

/**
 * Test: Update SEO (PUT /api/v1/seos/:id)
 */
async function testUpdateSeo() {
  console.log('\n🧪 Testing: Update SEO (PUT /api/v1/seos/:id)');
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

    // First, create a test SEO entry to update
    console.log('📝 Creating a test SEO entry first...');
    const seoData = {
      meta_title: 'Original SEO Title',
      meta_description: 'Original meta description'
    };

    const createResponse = await makeRequest('POST', `${BASE_URL}/seos`, seoData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    if (createResponse.statusCode !== 201) {
      throw new Error(`Failed to create test SEO: ${createResponse.statusCode}`);
    }

    testSeoId = createResponse.body.data.id;
    console.log(`✅ Test SEO created with ID: ${testSeoId}`);

    // Now update the SEO entry
    console.log(`📝 Updating SEO with ID: ${testSeoId}...`);
    const updateData = {
      meta_title: 'Updated SEO Title',
      meta_description: 'Updated meta description',
      canonical_url: 'https://example.com/updated-page',
      og_title: 'Updated OG Title'
    };

    const updateResponse = await makeRequest('PUT', `${BASE_URL}/seos/${testSeoId}`, updateData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(updateResponse.body, null, 2)}`);

    if (updateResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: SEO updated successfully${COLORS.reset}`);

      // Validate response structure
      if (updateResponse.body && updateResponse.body.data) {
        const seo = updateResponse.body.data;

        if (seo.id === testSeoId &&
            seo.meta_title === updateData.meta_title &&
            seo.meta_description === updateData.meta_description) {
          console.log(`${COLORS.green}✅ PASS: Response data shows updated SEO entry${COLORS.reset}`);
          return { success: true, seoId: testSeoId };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response data does not show updated SEO entry${COLORS.reset}`);
          return { success: false };
        }
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing data field${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200, got ${updateResponse.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Update SEO - Not Found
 */
async function testUpdateSeoNotFound() {
  console.log('\n🧪 Testing: Update SEO - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;
    const updateData = {
      meta_title: 'Updated Title'
    };

    console.log(`📝 Attempting to update non-existent SEO with ID: ${nonExistentId}...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/seos/${nonExistentId}`, updateData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);

    if (updateResponse.statusCode === 404) {
      console.log(`${COLORS.green}✅ PASS: Correctly returned 404 for non-existent SEO${COLORS.reset}`);
      return { success: true };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Should have returned 404 for non-existent SEO${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Update SEO without Authentication
 */
async function testUpdateSeoNoAuth() {
  console.log('\n🧪 Testing: Update SEO without Authentication');
  console.log('='.repeat(50));

  try {
    const updateData = {
      meta_title: 'Updated Title'
    };

    console.log(`📝 Attempting to update SEO without authentication...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/seos/${testSeoId || 1}`, updateData, {
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);

    if (updateResponse.statusCode === 401 || updateResponse.statusCode === 403) {
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
 * Test: Update SEO with Invalid Data
 */
async function testUpdateSeoInvalidData() {
  console.log('\n🧪 Testing: Update SEO with Invalid Data');
  console.log('='.repeat(50));

  try {
    const invalidData = {
      meta_title: '' // Empty title should fail validation
    };

    console.log(`📝 Attempting to update SEO with invalid data...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/seos/${testSeoId || 1}`, invalidData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);

    if (updateResponse.statusCode === 400) {
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

// Main test runner
async function runTests() {
  console.log('🚀 Starting Update SEO Tests');
  console.log('=====================================');

  const results = [];

  // Test successful update
  const updateResult = await testUpdateSeo();
  results.push({ test: 'Update SEO - Success', ...updateResult });

  // Test not found
  const notFoundResult = await testUpdateSeoNotFound();
  results.push({ test: 'Update SEO - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testUpdateSeoNoAuth();
  results.push({ test: 'Update SEO - No Auth', ...noAuthResult });

  // Test invalid data
  const invalidDataResult = await testUpdateSeoInvalidData();
  results.push({ test: 'Update SEO - Invalid Data', ...invalidDataResult });

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

module.exports = { testUpdateSeo, testUpdateSeoNotFound, testUpdateSeoNoAuth, testUpdateSeoInvalidData };