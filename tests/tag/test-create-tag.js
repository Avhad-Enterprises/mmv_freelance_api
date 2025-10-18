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
 * Test: Create Tag (POST /api/v1/tags)
 */
async function testCreateTag() {
  console.log('\n🧪 Testing: Create Tag (POST /api/v1/tags)');
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

    // Test data for creating a tag
    const tagData = {
      tag_name: 'Test Blog Tag',
      tag_value: 'blog-category-1',
      tag_type: 'blog',
      created_by: 1
    };

    console.log('📝 Creating new tag...');
    const createResponse = await makeRequest('POST', `${BASE_URL}/tags`, tagData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${createResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(createResponse.body, null, 2)}`);

    if (createResponse.statusCode === 201) {
      console.log(`${COLORS.green}✅ PASS: Tag created successfully${COLORS.reset}`);

      // Validate response structure
      if (createResponse.body && createResponse.body.data) {
        const tag = createResponse.body.data;
        if (tag.tag_name === tagData.tag_name &&
            tag.tag_value === tagData.tag_value &&
            tag.tag_type === tagData.tag_type) {
          console.log(`${COLORS.green}✅ PASS: Response data structure is correct${COLORS.reset}`);
          return { success: true, tagId: tag.tag_id };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response data structure is incorrect${COLORS.reset}`);
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
 * Test: Create Tag with Invalid Data
 */
async function testCreateTagInvalidData() {
  console.log('\n🧪 Testing: Create Tag with Invalid Data');
  console.log('='.repeat(50));

  try {
    // Test with missing required fields
    const invalidTagData = {
      tag_name: 'Test Tag'
      // Missing tag_value, tag_type, created_by
    };

    console.log('📝 Attempting to create tag with invalid data...');
    const createResponse = await makeRequest('POST', `${BASE_URL}/tags`, invalidTagData, {
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
 * Test: Create Tag without Authentication
 */
async function testCreateTagNoAuth() {
  console.log('\n🧪 Testing: Create Tag without Authentication');
  console.log('='.repeat(50));

  try {
    const tagData = {
      tag_name: 'Unauthorized Tag',
      tag_value: 'unauthorized',
      tag_type: 'blog',
      created_by: 1
    };

    console.log('📝 Attempting to create tag without authentication...');
    const createResponse = await makeRequest('POST', `${BASE_URL}/tags`, tagData, {
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
  console.log('🚀 Starting Tag Creation Tests');
  console.log('=====================================');

  const results = [];

  // Test successful tag creation
  const createResult = await testCreateTag();
  results.push({ test: 'Create Tag - Success', ...createResult });

  // Test invalid data
  const invalidDataResult = await testCreateTagInvalidData();
  results.push({ test: 'Create Tag - Invalid Data', ...invalidDataResult });

  // Test no authentication
  const noAuthResult = await testCreateTagNoAuth();
  results.push({ test: 'Create Tag - No Auth', ...noAuthResult });

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

module.exports = { testCreateTag, testCreateTagInvalidData, testCreateTagNoAuth };