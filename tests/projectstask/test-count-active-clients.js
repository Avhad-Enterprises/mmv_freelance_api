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
 * Test: Get Active Clients Count (GET /api/v1/projectsTask/count/active-clients)
 */
async function testGetActiveClientsCount() {
  console.log('\n🧪 Testing: Get Active Clients Count (GET /api/v1/projectsTask/count/active-clients)');
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

    // Test getting active clients count
    console.log('📝 Fetching active clients count...');
    const response = await makeRequest('GET', `${BASE_URL}/projectsTask/count/active-clients`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(response.body, null, 2)}`);

    if (response.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Active clients count fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (response.body && typeof response.body.active_clients_count === 'number') {
        console.log(`${COLORS.green}✅ PASS: Response contains valid count${COLORS.reset}`);
        console.log(`📊 Active clients count: ${response.body.active_clients_count}`);
        return { success: true, data: response.body };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing valid active_clients_count field${COLORS.reset}`);
        return { success: false };
      }
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
 * Test: Get Active Clients Count without Authentication
 */
async function testGetActiveClientsCountNoAuth() {
  console.log('\n🧪 Testing: Get Active Clients Count without Authentication');
  console.log('='.repeat(75));

  try {
    console.log('📝 Attempting to fetch active clients count without authentication...');
    const response = await makeRequest('GET', `${BASE_URL}/projectsTask/count/active-clients`);

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
    testGetActiveClientsCount(),
    testGetActiveClientsCountNoAuth()
  ]).then((results) => {
    const allPassed = results.every(result => result.success);
    console.log('\n📊 Test Results:');
    console.log(`Get Active Clients Count: ${results[0].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Get Active Clients Count (No Auth): ${results[1].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Overall: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
    process.exit(allPassed ? 0 : 1);
  });
}

module.exports = { testGetActiveClientsCount, testGetActiveClientsCountNoAuth };