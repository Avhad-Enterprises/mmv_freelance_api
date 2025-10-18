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
 * Test: Create Skill (POST /api/v1/skills)
 */
async function testCreateSkill() {
  console.log('\n🧪 Testing: Create Skill (POST /api/v1/skills)');
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

    // Test data for creating a skill
    const skillData = {
      skill_name: 'Test Skill',
      created_by: 1
    };

    console.log('📝 Creating new skill...');
    const createResponse = await makeRequest('POST', `${BASE_URL}/skills`, skillData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${createResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(createResponse.body, null, 2)}`);

    if (createResponse.statusCode === 201) {
      console.log(`${COLORS.green}✅ PASS: Skill created successfully${COLORS.reset}`);

      // Validate response structure
      if (createResponse.body && createResponse.body.data) {
        const skill = createResponse.body.data;
        if (skill.skill_name === skillData.skill_name &&
            skill.created_by === skillData.created_by) {
          console.log(`${COLORS.green}✅ PASS: Response data structure is correct${COLORS.reset}`);
          return { success: true, skillId: skill.skill_id };
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

// Main test runner
async function runTests() {
  console.log('🚀 Starting Skill Creation Tests');
  console.log('=====================================');

  const result = await testCreateSkill();

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));

  if (result.success) {
    console.log(`${COLORS.green}✅ PASS: Create Skill${COLORS.reset}`);
    console.log(`\n📈 Test passed! Skill created with ID: ${result.skillId}`);
    console.log(`${COLORS.green}🎉 Skills API is working!${COLORS.reset}`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}❌ FAIL: Create Skill${COLORS.reset}`);
    console.log(`${COLORS.red}💥 Test failed${COLORS.reset}`);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testCreateSkill };