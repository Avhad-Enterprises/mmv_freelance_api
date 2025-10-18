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
 * Test: Update Skill (PUT /api/v1/skills/:id)
 */
async function testUpdateSkill() {
  console.log('\n🧪 Testing: Update Skill (PUT /api/v1/skills/:id)');
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

    // First, create a test skill to update
    console.log('📝 Creating a test skill first...');
    const skillData = {
      skill_name: 'Original Skill Name',
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

    // Now update the skill
    console.log(`📝 Updating skill with ID: ${testSkillId}...`);
    const updateData = {
      skill_name: 'Updated Skill Name',
      updated_by: 1
    };

    const updateResponse = await makeRequest('PUT', `${BASE_URL}/skills/${testSkillId}`, updateData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(updateResponse.body, null, 2)}`);

    if (updateResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Skill updated successfully${COLORS.reset}`);

      // Validate response structure
      if (updateResponse.body && updateResponse.body.data) {
        const skill = updateResponse.body.data;

        if (skill.skill_id === testSkillId &&
            skill.skill_name === updateData.skill_name) {
          console.log(`${COLORS.green}✅ PASS: Response data shows updated skill name${COLORS.reset}`);
          return { success: true, skillId: testSkillId };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response data does not show updated skill name${COLORS.reset}`);
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
 * Test: Update Skill - Not Found
 */
async function testUpdateSkillNotFound() {
  console.log('\n🧪 Testing: Update Skill - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;
    const updateData = {
      skill_name: 'Updated Name',
      updated_by: 1
    };

    console.log(`📝 Attempting to update non-existent skill with ID: ${nonExistentId}...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/skills/${nonExistentId}`, updateData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);

    if (updateResponse.statusCode === 404) {
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
 * Test: Update Skill without Authentication
 */
async function testUpdateSkillNoAuth() {
  console.log('\n🧪 Testing: Update Skill without Authentication');
  console.log('='.repeat(50));

  try {
    const updateData = {
      skill_name: 'Updated Name',
      updated_by: 1
    };

    console.log(`📝 Attempting to update skill without authentication...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/skills/${testSkillId || 1}`, updateData, {
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

/**
 * Test: Update Skill with Invalid Data
 */
async function testUpdateSkillInvalidData() {
  console.log('\n🧪 Testing: Update Skill with Invalid Data');
  console.log('='.repeat(50));

  try {
    const invalidData = {
      skill_name: '', // Empty name should fail validation
      updated_by: 1
    };

    console.log(`📝 Attempting to update skill with invalid data...`);
    const updateResponse = await makeRequest('PUT', `${BASE_URL}/skills/${testSkillId || 1}`, invalidData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);

    if (updateResponse.statusCode === 400) {
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

// Main test runner
async function runTests() {
  console.log('🚀 Starting Update Skill Tests');
  console.log('=====================================');

  const results = [];

  // Test successful update
  const updateResult = await testUpdateSkill();
  results.push({ test: 'Update Skill - Success', ...updateResult });

  // Test not found
  const notFoundResult = await testUpdateSkillNotFound();
  results.push({ test: 'Update Skill - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testUpdateSkillNoAuth();
  results.push({ test: 'Update Skill - No Auth', ...noAuthResult });

  // Test invalid data
  const invalidDataResult = await testUpdateSkillInvalidData();
  results.push({ test: 'Update Skill - Invalid Data', ...invalidDataResult });

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

module.exports = { testUpdateSkill, testUpdateSkillNotFound, testUpdateSkillNoAuth, testUpdateSkillInvalidData };