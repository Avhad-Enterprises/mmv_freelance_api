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
 * Test: Get SEO by ID (GET /api/v1/seos/:id)
 */
async function testGetSeoById() {
  console.log('\n🧪 Testing: Get SEO by ID (GET /api/v1/seos/:id)');
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

    // First, create a test SEO entry to get its ID
    console.log('📝 Creating a test SEO entry first...');
    const seoData = {
      meta_title: 'Test SEO for GetById',
      meta_description: 'This is a test SEO entry for get by ID testing'
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

    // Now test getting the SEO by ID
    console.log(`📝 Fetching SEO with ID: ${testSeoId}...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/seos/${testSeoId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${getResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(getResponse.body, null, 2)}`);

    if (getResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: SEO fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (getResponse.body && getResponse.body.data) {
        const seo = getResponse.body.data;

        if (seo.id === testSeoId &&
            seo.meta_title === seoData.meta_title) {
          console.log(`${COLORS.green}✅ PASS: Response data matches created SEO entry${COLORS.reset}`);
          return { success: true, seoId: testSeoId };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response data does not match created SEO entry${COLORS.reset}`);
          return { success: false };
        }
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing data field${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200, got ${getResponse.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Get SEO by ID - Not Found
 */
async function testGetSeoByIdNotFound() {
  console.log('\n🧪 Testing: Get SEO by ID - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;

    console.log(`📝 Attempting to fetch non-existent SEO with ID: ${nonExistentId}...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/seos/${nonExistentId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${getResponse.statusCode}`);

    if (getResponse.statusCode === 404) {
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
 * Test: Get SEO by ID without Authentication
 */
async function testGetSeoByIdNoAuth() {
  console.log('\n🧪 Testing: Get SEO by ID without Authentication');
  console.log('='.repeat(50));

  try {
    console.log(`📝 Attempting to fetch SEO without authentication...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/seos/${testSeoId || 1}`);

    console.log(`📊 Response Status: ${getResponse.statusCode}`);

    if (getResponse.statusCode === 401 || getResponse.statusCode === 403) {
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
  console.log('🚀 Starting Get SEO by ID Tests');
  console.log('=====================================');

  const results = [];

  // Test successful get SEO by ID
  const getByIdResult = await testGetSeoById();
  results.push({ test: 'Get SEO by ID - Success', ...getByIdResult });

  // Test not found
  const notFoundResult = await testGetSeoByIdNotFound();
  results.push({ test: 'Get SEO by ID - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testGetSeoByIdNoAuth();
  results.push({ test: 'Get SEO by ID - No Auth', ...noAuthResult });

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

module.exports = { testGetSeoById, testGetSeoByIdNotFound, testGetSeoByIdNoAuth };