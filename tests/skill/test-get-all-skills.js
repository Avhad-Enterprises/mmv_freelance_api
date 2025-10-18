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
 * Test: Get All Skills (GET /api/v1/skills)
 */
async function testGetAllSkills() {
  console.log('\n🧪 Testing: Get All Skills (GET /api/v1/skills)');
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

    console.log('📝 Fetching all skills...');
    const getResponse = await makeRequest('GET', `${BASE_URL}/skills`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${getResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(getResponse.body, null, 2)}`);

    if (getResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Skills fetched successfully${COLORS.reset}`);

      // Validate response structure
      if (getResponse.body && getResponse.body.data) {
        const skills = getResponse.body.data;

        if (Array.isArray(skills)) {
          console.log(`${COLORS.green}✅ PASS: Response data is an array${COLORS.reset}`);
          console.log(`📊 Found ${skills.length} skills`);

          // Validate each skill has required fields
          let validSkills = 0;
          skills.forEach((skill, index) => {
            if (skill.skill_id && skill.skill_name) {
              validSkills++;
            } else {
              console.log(`${COLORS.yellow}⚠️  Skill at index ${index} missing required fields${COLORS.reset}`);
            }
          });

          if (validSkills === skills.length) {
            console.log(`${COLORS.green}✅ PASS: All skills have required fields${COLORS.reset}`);
            return { success: true, skillCount: skills.length };
          } else {
            console.log(`${COLORS.red}❌ FAIL: Some skills missing required fields${COLORS.reset}`);
            return { success: false };
          }
        } else {
          console.log(`${COLORS.red}❌ FAIL: Response data is not an array${COLORS.reset}`);
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
 * Test: Get All Skills without Authentication
 */
async function testGetAllSkillsNoAuth() {
  console.log('\n🧪 Testing: Get All Skills without Authentication');
  console.log('='.repeat(50));

  try {
    console.log('📝 Attempting to fetch skills without authentication...');
    const getResponse = await makeRequest('GET', `${BASE_URL}/skills`);

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
  console.log('🚀 Starting Get All Skills Tests');
  console.log('=====================================');

  const results = [];

  // Test successful get all skills
  const getAllResult = await testGetAllSkills();
  results.push({ test: 'Get All Skills - Success', ...getAllResult });

  // Test no authentication
  const noAuthResult = await testGetAllSkillsNoAuth();
  results.push({ test: 'Get All Skills - No Auth', ...noAuthResult });

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

module.exports = { testGetAllSkills, testGetAllSkillsNoAuth };