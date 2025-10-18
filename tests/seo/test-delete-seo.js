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
 * Test: Delete SEO (DELETE /api/v1/seos/:id)
 */
async function testDeleteSeo() {
  console.log('\n🧪 Testing: Delete SEO (DELETE /api/v1/seos/:id)');
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

    // First, create a test SEO entry to delete
    console.log('📝 Creating a test SEO entry first...');
    const seoData = {
      meta_title: 'Test SEO for Deletion',
      meta_description: 'This is a test SEO entry for deletion testing'
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

    // Now delete the SEO entry
    console.log(`🗑️ Deleting SEO with ID: ${testSeoId}...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/seos/${testSeoId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${deleteResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(deleteResponse.body, null, 2)}`);

    if (deleteResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: SEO deleted successfully${COLORS.reset}`);

      // Validate response structure
      if (deleteResponse.body && deleteResponse.body.data) {
        const seo = deleteResponse.body.data;

        if (seo.id === testSeoId && seo.is_deleted === true) {
          console.log(`${COLORS.green}✅ PASS: Response shows soft deleted SEO entry${COLORS.reset}`);
          return { success: true, seoId: testSeoId };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response does not show soft deleted SEO entry${COLORS.reset}`);
          return { success: false };
        }
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing data field${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200, got ${deleteResponse.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Delete SEO - Not Found
 */
async function testDeleteSeoNotFound() {
  console.log('\n🧪 Testing: Delete SEO - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;

    console.log(`🗑️ Attempting to delete non-existent SEO with ID: ${nonExistentId}...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/seos/${nonExistentId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${deleteResponse.statusCode}`);

    if (deleteResponse.statusCode === 404) {
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
 * Test: Delete SEO without Authentication
 */
async function testDeleteSeoNoAuth() {
  console.log('\n🧪 Testing: Delete SEO without Authentication');
  console.log('='.repeat(50));

  try {
    console.log(`🗑️ Attempting to delete SEO without authentication...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/seos/${testSeoId || 1}`);

    console.log(`📊 Response Status: ${deleteResponse.statusCode}`);

    if (deleteResponse.statusCode === 401 || deleteResponse.statusCode === 403) {
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
 * Test: Verify Soft Delete - SEO should not appear in GET all after deletion
 */
async function testSoftDeleteVerification() {
  console.log('\n🧪 Testing: Soft Delete Verification');
  console.log('='.repeat(50));

  try {
    // First, create a test SEO entry
    console.log('📝 Creating a test SEO entry for soft delete verification...');
    const seoData = {
      meta_title: 'Soft Delete Test SEO',
      meta_description: 'This is a test SEO entry for soft delete verification'
    };

    const createResponse = await makeRequest('POST', `${BASE_URL}/seos`, seoData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    if (createResponse.statusCode !== 201) {
      throw new Error(`Failed to create test SEO: ${createResponse.statusCode}`);
    }

    const seoId = createResponse.body.data.id;
    console.log(`✅ Test SEO created with ID: ${seoId}`);

    // Delete the SEO entry
    console.log(`🗑️ Deleting SEO with ID: ${seoId}...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/seos/${seoId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    if (deleteResponse.statusCode !== 200) {
      throw new Error(`Failed to delete SEO: ${deleteResponse.statusCode}`);
    }

    // Now try to get all SEO entries and verify the deleted SEO is not in the list
    console.log('📝 Fetching all SEO entries to verify soft delete...');
    const getAllResponse = await makeRequest('GET', `${BASE_URL}/seos`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    if (getAllResponse.statusCode === 200) {
      const seos = getAllResponse.body.data || [];
      const deletedSeo = seos.find(seo => seo.id === seoId);

      if (!deletedSeo) {
        console.log(`${COLORS.green}✅ PASS: Deleted SEO not found in GET all response (soft delete working)${COLORS.reset}`);
        return { success: true };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Deleted SEO still appears in GET all response${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Could not fetch SEO entries to verify soft delete${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Delete SEO Tests');
  console.log('=====================================');

  const results = [];

  // Test successful delete
  const deleteResult = await testDeleteSeo();
  results.push({ test: 'Delete SEO - Success', ...deleteResult });

  // Test not found
  const notFoundResult = await testDeleteSeoNotFound();
  results.push({ test: 'Delete SEO - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testDeleteSeoNoAuth();
  results.push({ test: 'Delete SEO - No Auth', ...noAuthResult });

  // Test soft delete verification
  const softDeleteResult = await testSoftDeleteVerification();
  results.push({ test: 'Soft Delete Verification', ...softDeleteResult });

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

module.exports = { testDeleteSeo, testDeleteSeoNotFound, testDeleteSeoNoAuth, testSoftDeleteVerification };