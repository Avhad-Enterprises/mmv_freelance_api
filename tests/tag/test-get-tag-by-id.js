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
let testTagId = null;

/**
 * Test: Get Tag by ID (GET /api/v1/tags/:id)
 */
async function testGetTagById() {
  console.log('\n🧪 Testing: Get Tag by ID (GET /api/v1/tags/:id)');
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

    // First, create a test tag to get its ID
    console.log('📝 Creating a test tag first...');
    const tagData = {
      tag_name: 'Test Tag for GetById',
      tag_value: 'test-get-by-id',
      tag_type: 'blog',
      created_by: 1
    };

    const createResponse = await makeRequest('POST', `${BASE_URL}/tags`, tagData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    if (createResponse.statusCode !== 201) {
      throw new Error(`Failed to create test tag: ${createResponse.statusCode}`);
    }

    testTagId = createResponse.body.data.tag_id;
    console.log(`✅ Test tag created with ID: ${testTagId}`);

    // Now test getting the tag by ID
    console.log(`📝 Fetching tag with ID: ${testTagId}...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/tags/${testTagId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${getResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(getResponse.body, null, 2)}`);

    if (getResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Tag fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (getResponse.body && getResponse.body.data) {
        const tag = getResponse.body.data;

        if (tag.tag_id === testTagId &&
            tag.tag_name === tagData.tag_name &&
            tag.tag_value === tagData.tag_value &&
            tag.tag_type === tagData.tag_type) {
          console.log(`${COLORS.green}✅ PASS: Response data matches created tag${COLORS.reset}`);
          return { success: true, tagId: testTagId };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response data does not match created tag${COLORS.reset}`);
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
 * Test: Get Tag by ID - Not Found
 */
async function testGetTagByIdNotFound() {
  console.log('\n🧪 Testing: Get Tag by ID - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;

    console.log(`📝 Attempting to fetch non-existent tag with ID: ${nonExistentId}...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/tags/${nonExistentId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${getResponse.statusCode}`);

    if (getResponse.statusCode === 404) {
      console.log(`${COLORS.green}✅ PASS: Correctly returned 404 for non-existent tag${COLORS.reset}`);
      return { success: true };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Should have returned 404 for non-existent tag${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Get Tag by ID without Authentication
 */
async function testGetTagByIdNoAuth() {
  console.log('\n🧪 Testing: Get Tag by ID without Authentication');
  console.log('='.repeat(50));

  try {
    console.log(`📝 Attempting to fetch tag without authentication...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/tags/${testTagId || 1}`);

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
  console.log('🚀 Starting Get Tag by ID Tests');
  console.log('=====================================');

  const results = [];

  // Test successful get tag by ID
  const getByIdResult = await testGetTagById();
  results.push({ test: 'Get Tag by ID - Success', ...getByIdResult });

  // Test not found
  const notFoundResult = await testGetTagByIdNotFound();
  results.push({ test: 'Get Tag by ID - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testGetTagByIdNoAuth();
  results.push({ test: 'Get Tag by ID - No Auth', ...noAuthResult });

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

module.exports = { testGetTagById, testGetTagByIdNotFound, testGetTagByIdNoAuth };