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
 * Test: Update Robots (POST /api/v1/robots/update)
 */
async function testUpdateRobots() {
  console.log('\n🧪 Testing: Update Robots (POST /api/v1/robots/update)');
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

    // Test updating robots content
    console.log('📝 Updating robots.txt content...');
    const robotsData = {
      content: 'User-agent: *\nDisallow: /admin/\nDisallow: /api/\nAllow: /\n\nUser-agent: Googlebot\nAllow: /',
      updated_by: 1
    };

    const updateResponse = await makeRequest('POST', `${BASE_URL}/robots/update`, robotsData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${updateResponse.statusCode}`);
    console.log(`📊 Response Data: ${JSON.stringify(updateResponse.body, null, 2)}`);

    if (updateResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Robots content updated successfully${COLORS.reset}`);

      // Validate response structure
      if (updateResponse.body && updateResponse.body.message) {
        console.log(`${COLORS.green}✅ PASS: Response contains success message${COLORS.reset}`);
        return { success: true, data: updateResponse.body };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response missing success message${COLORS.reset}`);
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
 * Test: Update Robots without Authentication
 */
async function testUpdateRobotsNoAuth() {
  console.log('\n🧪 Testing: Update Robots without Authentication');
  console.log('='.repeat(50));

  try {
    const robotsData = {
      content: 'User-agent: *\nDisallow: /',
      updated_by: 1
    };

    console.log('📝 Attempting to update robots without authentication...');
    const response = await makeRequest('POST', `${BASE_URL}/robots/update`, robotsData, {
      'Content-Type': 'application/json'
    });

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

/**
 * Test: Update Robots with Invalid Data
 */
async function testUpdateRobotsInvalidData() {
  console.log('\n🧪 Testing: Update Robots with Invalid Data');
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

    // Test with missing content
    console.log('📝 Attempting to update robots with missing content...');
    const invalidData = {
      updated_by: 1
      // missing content field
    };

    const response = await makeRequest('POST', `${BASE_URL}/robots/update`, invalidData, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    console.log(`📊 Response Status: ${response.statusCode}`);

    if (response.statusCode === 400) {
      console.log(`${COLORS.green}✅ PASS: Correctly rejected invalid data (missing content)${COLORS.reset}`);
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
 * Test: Update and Verify Public Robots.txt
 */
async function testUpdateAndVerifyPublic() {
  console.log('\n🧪 Testing: Update and Verify Public Robots.txt');
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

    // Update robots content
    const testContent = 'User-agent: *\nDisallow: /test/\nAllow: /public/';
    console.log('📝 Updating robots.txt with test content...');
    const updateResponse = await makeRequest('POST', `${BASE_URL}/robots/update`, {
      content: testContent,
      updated_by: 1
    }, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    if (updateResponse.statusCode !== 200) {
      throw new Error(`Update failed: ${updateResponse.statusCode}`);
    }

    console.log('✅ Robots content updated');

    // Now verify the public endpoint returns the updated content
    console.log('📝 Verifying public robots.txt endpoint...');
    const publicResponse = await makeRequest('GET', `${CONFIG.baseUrl}/robots.txt`);

    if (publicResponse.statusCode === 200) {
      if (publicResponse.body === testContent) {
        console.log(`${COLORS.green}✅ PASS: Public robots.txt matches updated content${COLORS.reset}`);
        return { success: true };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Public robots.txt content doesn't match${COLORS.reset}`);
        console.log(`Expected: ${testContent}`);
        console.log(`Got: ${publicResponse.body}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Public robots.txt endpoint failed${COLORS.reset}`);
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
    testUpdateRobots(),
    testUpdateRobotsNoAuth(),
    testUpdateRobotsInvalidData(),
    testUpdateAndVerifyPublic()
  ]).then((results) => {
    const allPassed = results.every(result => result.success);
    console.log('\n📊 Test Results:');
    console.log(`Update Robots: ${results[0].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Update Robots (No Auth): ${results[1].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Update Robots (Invalid Data): ${results[2].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Update and Verify Public: ${results[3].success ? 'PASSED' : 'FAILED'}`);
    console.log(`Overall: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
    process.exit(allPassed ? 0 : 1);
  });
}

module.exports = {
  testUpdateRobots,
  testUpdateRobotsNoAuth,
  testUpdateRobotsInvalidData,
  testUpdateAndVerifyPublic
};