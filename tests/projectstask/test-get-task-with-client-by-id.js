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
let testProjectTaskId = null;

/**
 * Test: Get Task With Client By ID (GET /api/v1/projectsTask/tasks-with-client/:id)
 */
async function testGetTaskWithClientById() {
  console.log('\n🧪 Testing: Get Task With Client By ID (GET /api/v1/projectsTask/tasks-with-client/:id)');
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

    // First, get a project task ID to test with
    console.log('📝 Getting a project task ID to test with...');
    const allTasksResponse = await makeRequest('GET', `${BASE_URL}/projectsTask/getallprojects_task`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    if (allTasksResponse.statusCode === 200 && allTasksResponse.body && allTasksResponse.body.length > 0) {
      testProjectTaskId = allTasksResponse.body[0].id;
      console.log(`✅ Found project task with ID: ${testProjectTaskId}`);
    } else {
      console.log('⚠️ No existing project tasks found, will test with a non-existent ID');
      testProjectTaskId = 999999; // Use a non-existent ID for testing
    }

    // Test getting task with client by ID
    console.log(`📝 Fetching task with client info for ID: ${testProjectTaskId}...`);
    const response = await makeRequest('GET', `${BASE_URL}/projectsTask/tasks-with-client/${testProjectTaskId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(response.body, null, 2)}`);

    if (response.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Task with client info fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (response.body) {
        console.log(`${COLORS.green}✅ PASS: Response contains data${COLORS.reset}`);
        return { success: true, data: response.body };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing data${COLORS.reset}`);
        return { success: false };
      }
    } else if (response.statusCode === 404 && testProjectTaskId === 999999) {
      console.log(`${COLORS.green}✅ PASS: Correctly returned 404 for non-existent task${COLORS.reset}`);
      return { success: true };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200 or 404, got ${response.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Get Task With Client By ID without Authentication
 */
async function testGetTaskWithClientByIdNoAuth() {
  console.log('\n🧪 Testing: Get Task With Client By ID without Authentication');
  console.log('='.repeat(75));

  try {
    console.log('📝 Attempting to fetch task with client info without authentication...');
    const response = await makeRequest('GET', `${BASE_URL}/projectsTask/tasks-with-client/1`);

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
    testGetTaskWithClientById(),
    testGetTaskWithClientByIdNoAuth()
  ]).then((results) => {
    const allPassed = results.every(result => result.success);
    console.log('\n📊 Test Results:');
    console.log(`Get Task With Client By ID: ${results[0].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Get Task With Client By ID (No Auth): ${results[1].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Overall: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
    process.exit(allPassed ? 0 : 1);
  });
}

module.exports = { testGetTaskWithClientById, testGetTaskWithClientByIdNoAuth };