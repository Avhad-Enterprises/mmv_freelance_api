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
 * Test: Delete Tag (DELETE /api/v1/tags/:id)
 */
async function testDeleteTag() {
  console.log('\n🧪 Testing: Delete Tag (DELETE /api/v1/tags/:id)');
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

    // First, create a test tag to delete
    console.log('📝 Creating a test tag to delete...');
    const tagData = {
      tag_name: 'Tag to Delete',
      tag_value: 'delete-me',
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

    // Now delete the tag
    console.log(`🗑️  Deleting tag with ID: ${testTagId}...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/tags/${testTagId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${deleteResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(deleteResponse.body, null, 2)}`);

    if (deleteResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Tag deleted successfully${COLORS.reset}`);

      // Validate response structure
      if (deleteResponse.body && deleteResponse.body.data) {
        const deletedTag = deleteResponse.body.data;

        if (deletedTag.tag_id === testTagId &&
            deletedTag.is_deleted === true) {
          console.log(`${COLORS.green}✅ PASS: Tag marked as deleted${COLORS.reset}`);
          return { success: true, tagId: testTagId };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Tag not properly marked as deleted${COLORS.reset}`);
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
 * Test: Delete Tag - Not Found
 */
async function testDeleteTagNotFound() {
  console.log('\n🧪 Testing: Delete Tag - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;

    console.log(`🗑️  Attempting to delete non-existent tag with ID: ${nonExistentId}...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/tags/${nonExistentId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${deleteResponse.statusCode}`);

    if (deleteResponse.statusCode === 404) {
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
 * Test: Delete Tag without Authentication
 */
async function testDeleteTagNoAuth() {
  console.log('\n🧪 Testing: Delete Tag without Authentication');
  console.log('='.repeat(50));

  try {
    console.log('🗑️  Attempting to delete tag without authentication...');
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/tags/${testTagId || 1}`, null, {
      'Content-Type': 'application/json'
    });

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
 * Test: Verify Deleted Tag is Not Returned in Get All Tags
 */
async function testDeletedTagNotInList() {
  console.log('\n🧪 Testing: Verify Deleted Tag is Not Returned in Get All Tags');
  console.log('='.repeat(50));

  try {
    // Create another test tag
    const tagData = {
      tag_name: 'Tag to Verify Deletion',
      tag_value: 'verify-deletion',
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

    const verifyTagId = createResponse.body.data.tag_id;
    console.log(`✅ Test tag created with ID: ${verifyTagId}`);

    // Delete the tag
    await makeRequest('DELETE', `${BASE_URL}/tags/${verifyTagId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    // Get all tags and verify the deleted tag is not in the list
    console.log('📝 Fetching all tags to verify deleted tag is not included...');
    const getAllResponse = await makeRequest('GET', `${BASE_URL}/tags`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    if (getAllResponse.statusCode === 200 && getAllResponse.body && getAllResponse.body.data) {
      const allTags = getAllResponse.body.data;
      const deletedTagInList = allTags.find(tag => tag.tag_id === verifyTagId);

      if (!deletedTagInList) {
        console.log(`${COLORS.green}✅ PASS: Deleted tag is not returned in get all tags${COLORS.reset}`);
        return { success: true };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Deleted tag is still returned in get all tags${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Could not fetch all tags to verify deletion${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Delete Tag Tests');
  console.log('=====================================');

  const results = [];

  // Test successful tag deletion
  const deleteResult = await testDeleteTag();
  results.push({ test: 'Delete Tag - Success', ...deleteResult });

  // Test not found
  const notFoundResult = await testDeleteTagNotFound();
  results.push({ test: 'Delete Tag - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testDeleteTagNoAuth();
  results.push({ test: 'Delete Tag - No Auth', ...noAuthResult });

  // Test deleted tag not in list
  const notInListResult = await testDeletedTagNotInList();
  results.push({ test: 'Delete Tag - Not in List', ...notInListResult });

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

module.exports = { testDeleteTag, testDeleteTagNotFound, testDeleteTagNoAuth, testDeletedTagNotInList };