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
 * Test: Update Tag (PUT /api/v1/tags/:id)
 */
async function testUpdateTag() {
  console.log('\n🧪 Testing: Update Tag (PUT /api/v1/tags/:id)');
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

    // First, create a test tag to update
    console.log('📝 Creating a test tag to update...');
    const tagData = {
      tag_name: 'Original Tag Name',
      tag_value: 'original-value',
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

    // Now update the tag
    const updateData = {
      tag_name: 'Updated Tag Name',
      tag_value: 'updated-value',
      tag_type: 'project',
      updated_by: 1
    };

    console.log(`📝 Updating tag with ID: ${testTagId}...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/tags/${testTagId}`, updateData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(updateResponse.body, null, 2)}`);

    if (updateResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Tag updated successfully${COLORS.reset}`);

      // Validate response structure
      if (updateResponse.body && updateResponse.body.data) {
        const updatedTag = updateResponse.body.data;

        if (updatedTag.tag_id === testTagId &&
            updatedTag.tag_name === updateData.tag_name &&
            updatedTag.tag_value === updateData.tag_value &&
            updatedTag.tag_type === updateData.tag_type) {
          console.log(`${COLORS.green}✅ PASS: Tag updated with correct data${COLORS.reset}`);
          return { success: true, tagId: testTagId };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Tag not updated with correct data${COLORS.reset}`);
          console.log(`Expected: ${JSON.stringify(updateData)}`);
          console.log(`Actual: ${JSON.stringify(updatedTag)}`);
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
 * Test: Update Tag - Partial Update
 */
async function testUpdateTagPartial() {
  console.log('\n🧪 Testing: Update Tag - Partial Update');
  console.log('='.repeat(50));

  try {
    // Create another test tag
    const tagData = {
      tag_name: 'Partial Update Tag',
      tag_value: 'partial-update',
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

    const partialUpdateTagId = createResponse.body.data.tag_id;
    console.log(`✅ Test tag created with ID: ${partialUpdateTagId}`);

    // Update only the tag_name
    const partialUpdateData = {
      tag_name: 'Partially Updated Name',
      updated_by: 1
    };

    console.log(`📝 Partially updating tag with ID: ${partialUpdateTagId}...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/tags/${partialUpdateTagId}`, partialUpdateData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);

    if (updateResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Tag partially updated successfully${COLORS.reset}`);

      // Validate that only specified fields were updated
      if (updateResponse.body && updateResponse.body.data) {
        const updatedTag = updateResponse.body.data;

        if (updatedTag.tag_name === partialUpdateData.tag_name &&
            updatedTag.tag_value === tagData.tag_value && // Should remain unchanged
            updatedTag.tag_type === tagData.tag_type) {   // Should remain unchanged
          console.log(`${COLORS.green}✅ PASS: Only specified fields were updated${COLORS.reset}`);
          return { success: true };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Unexpected fields were modified${COLORS.reset}`);
          return { success: false };
        }
      }
      return { success: true };
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
 * Test: Update Tag - Not Found
 */
async function testUpdateTagNotFound() {
  console.log('\n🧪 Testing: Update Tag - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;
    const updateData = {
      tag_name: 'Non-existent Tag',
      updated_by: 1
    };

    console.log(`📝 Attempting to update non-existent tag with ID: ${nonExistentId}...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/tags/${nonExistentId}`, updateData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);

    if (updateResponse.statusCode === 404) {
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
 * Test: Update Tag without Authentication
 */
async function testUpdateTagNoAuth() {
  console.log('\n🧪 Testing: Update Tag without Authentication');
  console.log('='.repeat(50));

  try {
    const updateData = {
      tag_name: 'Unauthorized Update',
      updated_by: 1
    };

    console.log('📝 Attempting to update tag without authentication...');
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/tags/${testTagId || 1}`, updateData, {
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

// Main test runner
async function runTests() {
  console.log('🚀 Starting Update Tag Tests');
  console.log('=====================================');

  const results = [];

  // Test successful tag update
  const updateResult = await testUpdateTag();
  results.push({ test: 'Update Tag - Success', ...updateResult });

  // Test partial update
  const partialResult = await testUpdateTagPartial();
  results.push({ test: 'Update Tag - Partial', ...partialResult });

  // Test not found
  const notFoundResult = await testUpdateTagNotFound();
  results.push({ test: 'Update Tag - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testUpdateTagNoAuth();
  results.push({ test: 'Update Tag - No Auth', ...noAuthResult });

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

module.exports = { testUpdateTag, testUpdateTagPartial, testUpdateTagNotFound, testUpdateTagNoAuth };