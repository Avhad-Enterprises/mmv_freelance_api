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
 * Test: Get Active Editors Count (GET /api/v1/projectsTask/count/active-editors)
 */
async function testGetActiveEditorsCount() {
  console.log('\n🧪 Testing: Get Active Editors Count (GET /api/v1/projectsTask/count/active-editors)');
  console.log('='.repeat(75));

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

    // Test getting active editors count
    console.log('📝 Fetching active editors count...');
    const response = await makeRequest('GET', `${BASE_URL}/projectsTask/count/active-editors`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(response.body, null, 2)}`);

    if (response.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Active editors count fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (response.body && typeof response.body.active_editors_count === 'number') {
        console.log(`${COLORS.green}✅ PASS: Response contains valid count${COLORS.reset}`);
        console.log(`📊 Active editors count: ${response.body.active_editors_count}`);
        return { success: true, data: response.body };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing valid active_editors_count field${COLORS.reset}`);
        return { success: false };
      }
    } else if (response.statusCode === 500) {
      console.log(`${COLORS.yellow}⚠️  Expected status 200, got 500 - Endpoint may have database column issues${COLORS.reset}`);
      console.log(`${COLORS.yellow}⚠️  This suggests the endpoint references a non-existent 'editor_id' column${COLORS.reset}`);
      return { success: false };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200, got ${response.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Get Active Editors Count without Authentication
 */
async function testGetActiveEditorsCountNoAuth() {
  console.log('\n🧪 Testing: Get Active Editors Count without Authentication');
  console.log('='.repeat(75));

  try {
    console.log('📝 Attempting to fetch active editors count without authentication...');
    const response = await makeRequest('GET', `${BASE_URL}/projectsTask/count/active-editors`);

    console.log(`📊 Response Status: ${response.statusCode}`);

    if (response.statusCode === 401 || response.statusCode === 403) {
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

// Run the tests
if (require.main === module) {
  Promise.all([
    testGetActiveEditorsCount(),
    testGetActiveEditorsCountNoAuth()
  ]).then((results) => {
    const allPassed = results.every(result => result.success);
    console.log('\n📊 Test Results:');
    console.log(`Get Active Editors Count: ${results[0].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Get Active Editors Count (No Auth): ${results[1].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Overall: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
    process.exit(allPassed ? 0 : 1);
  });
}

module.exports = { testGetActiveEditorsCount, testGetActiveEditorsCountNoAuth };