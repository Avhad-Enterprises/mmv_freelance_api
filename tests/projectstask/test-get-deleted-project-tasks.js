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
 * Test: Get Deleted Project Tasks (GET /api/v1/projectsTask/getDeletedprojects_task)
 */
async function testGetDeletedProjectTasks() {
  console.log('\n🧪 Testing: Get Deleted Project Tasks (GET /api/v1/projectsTask/getDeletedprojects_task)');
  console.log('='.repeat(70));

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

    // Test getting deleted project tasks
    console.log('📝 Fetching deleted project tasks...');
    const response = await makeRequest('GET', `${BASE_URL}/projectsTask/getDeletedprojects_task`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(response.body, null, 2)}`);

    if (response.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Deleted project tasks fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (response.body) {
        console.log(`${COLORS.green}✅ PASS: Response contains data${COLORS.reset}`);
        return { success: true, data: response.body };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing data${COLORS.reset}`);
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
 * Test: Get Deleted Project Tasks without Authentication
 */
async function testGetDeletedProjectTasksNoAuth() {
  console.log('\n🧪 Testing: Get Deleted Project Tasks without Authentication');
  console.log('='.repeat(70));

  try {
    console.log('📝 Attempting to fetch deleted project tasks without authentication...');
    const response = await makeRequest('GET', `${BASE_URL}/projectsTask/getDeletedprojects_task`);

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
    testGetDeletedProjectTasks(),
    testGetDeletedProjectTasksNoAuth()
  ]).then((results) => {
    const allPassed = results.every(result => result.success);
    console.log('\n📊 Test Results:');
    console.log(`Get Deleted Project Tasks: ${results[0].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Get Deleted Project Tasks (No Auth): ${results[1].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Overall: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
    process.exit(allPassed ? 0 : 1);
  });
}

module.exports = { testGetDeletedProjectTasks, testGetDeletedProjectTasksNoAuth };