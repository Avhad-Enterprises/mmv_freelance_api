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
let testSkillId = null;

/**
 * Test: Delete Skill (DELETE /api/v1/skills/:id)
 */
async function testDeleteSkill() {
  console.log('\n🧪 Testing: Delete Skill (DELETE /api/v1/skills/:id)');
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

    // First, create a test skill to delete
    console.log('📝 Creating a test skill first...');
    const skillData = {
      skill_name: 'Test Skill for Deletion',
      created_by: 1
    };

    const createResponse = await makeRequest('POST', `${BASE_URL}/skills`, skillData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    if (createResponse.statusCode !== 201) {
      throw new Error(`Failed to create test skill: ${createResponse.statusCode}`);
    }

    testSkillId = createResponse.body.data.skill_id;
    console.log(`✅ Test skill created with ID: ${testSkillId}`);

    // Now delete the skill
    console.log(`🗑️ Deleting skill with ID: ${testSkillId}...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/skills/${testSkillId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${deleteResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(deleteResponse.body, null, 2)}`);

    if (deleteResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Skill deleted successfully${COLORS.reset}`);

      // Validate response structure
      if (deleteResponse.body && deleteResponse.body.message) {
        console.log(`${COLORS.green}✅ PASS: Response contains success message${COLORS.reset}`);
        return { success: true, skillId: testSkillId };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing success message${COLORS.reset}`);
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
 * Test: Delete Skill - Not Found
 */
async function testDeleteSkillNotFound() {
  console.log('\n🧪 Testing: Delete Skill - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;

    console.log(`🗑️ Attempting to delete non-existent skill with ID: ${nonExistentId}...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/skills/${nonExistentId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${deleteResponse.statusCode}`);

    if (deleteResponse.statusCode === 404) {
      console.log(`${COLORS.green}✅ PASS: Correctly returned 404 for non-existent skill${COLORS.reset}`);
      return { success: true };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Should have returned 404 for non-existent skill${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Delete Skill without Authentication
 */
async function testDeleteSkillNoAuth() {
  console.log('\n🧪 Testing: Delete Skill without Authentication');
  console.log('='.repeat(50));

  try {
    console.log(`🗑️ Attempting to delete skill without authentication...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/skills/${testSkillId || 1}`);

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
 * Test: Verify Soft Delete - Skill should not appear in GET all after deletion
 */
async function testSoftDeleteVerification() {
  console.log('\n🧪 Testing: Soft Delete Verification');
  console.log('='.repeat(50));

  try {
    // First, create a test skill
    console.log('📝 Creating a test skill for soft delete verification...');
    const skillData = {
      skill_name: 'Soft Delete Test Skill',
      created_by: 1
    };

    const createResponse = await makeRequest('POST', `${BASE_URL}/skills`, skillData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    if (createResponse.statusCode !== 201) {
      throw new Error(`Failed to create test skill: ${createResponse.statusCode}`);
    }

    const skillId = createResponse.body.data.skill_id;
    console.log(`✅ Test skill created with ID: ${skillId}`);

    // Delete the skill
    console.log(`🗑️ Deleting skill with ID: ${skillId}...`);
    const deleteResponse = await makeRequest('DELETE', `${BASE_URL}/skills/${skillId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    if (deleteResponse.statusCode !== 200) {
      throw new Error(`Failed to delete skill: ${deleteResponse.statusCode}`);
    }

    // Now try to get all skills and verify the deleted skill is not in the list
    console.log('📝 Fetching all skills to verify soft delete...');
    const getAllResponse = await makeRequest('GET', `${BASE_URL}/skills`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    if (getAllResponse.statusCode === 200) {
      const skills = getAllResponse.body.data || [];
      const deletedSkill = skills.find(skill => skill.skill_id === skillId);

      if (!deletedSkill) {
        console.log(`${COLORS.green}✅ PASS: Deleted skill not found in GET all response (soft delete working)${COLORS.reset}`);
        return { success: true };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Deleted skill still appears in GET all response${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Could not fetch skills to verify soft delete${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Delete Skill Tests');
  console.log('=====================================');

  const results = [];

  // Test successful delete
  const deleteResult = await testDeleteSkill();
  results.push({ test: 'Delete Skill - Success', ...deleteResult });

  // Test not found
  const notFoundResult = await testDeleteSkillNotFound();
  results.push({ test: 'Delete Skill - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testDeleteSkillNoAuth();
  results.push({ test: 'Delete Skill - No Auth', ...noAuthResult });

  // Test soft delete verification
  const softDeleteResult = await testSoftDeleteVerification();
  results.push({ test: 'Soft Delete Verification', ...softDeleteResult });

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

module.exports = { testDeleteSkill, testDeleteSkillNotFound, testDeleteSkillNoAuth, testSoftDeleteVerification };