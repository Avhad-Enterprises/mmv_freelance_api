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
 * Test: Get Skill by ID (GET /api/v1/skills/:id)
 */
async function testGetSkillById() {
  console.log('\n🧪 Testing: Get Skill by ID (GET /api/v1/skills/:id)');
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

    // First, create a test skill to get its ID
    console.log('📝 Creating a test skill first...');
    const skillData = {
      skill_name: 'Test Skill for GetById',
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

    // Now test getting the skill by ID
    console.log(`📝 Fetching skill with ID: ${testSkillId}...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/skills/${testSkillId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${getResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(getResponse.body, null, 2)}`);

    if (getResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Skill fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (getResponse.body && getResponse.body.data) {
        const skill = getResponse.body.data;

        if (skill.skill_id === testSkillId &&
            skill.skill_name === skillData.skill_name) {
          console.log(`${COLORS.green}✅ PASS: Response data matches created skill${COLORS.reset}`);
          return { success: true, skillId: testSkillId };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response data does not match created skill${COLORS.reset}`);
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
 * Test: Get Skill by ID - Not Found
 */
async function testGetSkillByIdNotFound() {
  console.log('\n🧪 Testing: Get Skill by ID - Not Found');
  console.log('='.repeat(50));

  try {
    const nonExistentId = 999999;

    console.log(`📝 Attempting to fetch non-existent skill with ID: ${nonExistentId}...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/skills/${nonExistentId}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${getResponse.statusCode}`);

    if (getResponse.statusCode === 404) {
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
 * Test: Get Skill by ID without Authentication
 */
async function testGetSkillByIdNoAuth() {
  console.log('\n🧪 Testing: Get Skill by ID without Authentication');
  console.log('='.repeat(50));

  try {
    console.log(`📝 Attempting to fetch skill without authentication...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/skills/${testSkillId || 1}`);

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
  console.log('🚀 Starting Get Skill by ID Tests');
  console.log('=====================================');

  const results = [];

  // Test successful get skill by ID
  const getByIdResult = await testGetSkillById();
  results.push({ test: 'Get Skill by ID - Success', ...getByIdResult });

  // Test not found
  const notFoundResult = await testGetSkillByIdNotFound();
  results.push({ test: 'Get Skill by ID - Not Found', ...notFoundResult });

  // Test no authentication
  const noAuthResult = await testGetSkillByIdNoAuth();
  results.push({ test: 'Get Skill by ID - No Auth', ...noAuthResult });

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

module.exports = { testGetSkillById, testGetSkillByIdNotFound, testGetSkillByIdNoAuth };