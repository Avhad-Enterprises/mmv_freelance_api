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
 * Test: View Robots (GET /api/v1/robots/view)
 */
async function testViewRobots() {
  console.log('\n🧪 Testing: View Robots (GET /api/v1/robots/view)');
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

    // Test viewing robots entry
    console.log('📝 Fetching robots entry for admin view...');
    const viewResponse = await makeRequest('GET', `${BASE_URL}/robots/view`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${viewResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(viewResponse.body, null, 2)}`);

    if (viewResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Robots entry fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (viewResponse.body) {
        console.log(`${COLORS.green}✅ PASS: Response contains data${COLORS.reset}`);
        return { success: true, data: viewResponse.body };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing data${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200, got ${viewResponse.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: View Robots without Authentication
 */
async function testViewRobotsNoAuth() {
  console.log('\n🧪 Testing: View Robots without Authentication');
  console.log('='.repeat(50));

  try {
    console.log('📝 Attempting to view robots without authentication...');
    const response = await makeRequest('GET', `${BASE_URL}/robots/view`);

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
    testViewRobots(),
    testViewRobotsNoAuth()
  ]).then((results) => {
    const allPassed = results.every(result => result.success);
    console.log('\n📊 Test Results:');
    console.log(`View Robots: ${results[0].success ? 'PASSED' : 'FAILED'}`);
    console.log(`View Robots (No Auth): ${results[1].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Overall: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
    process.exit(allPassed ? 0 : 1);
  });
}

module.exports = { testViewRobots, testViewRobotsNoAuth };