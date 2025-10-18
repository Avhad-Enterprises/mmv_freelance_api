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
 * Test: Get Public Robots.txt (GET /robots.txt)
 */
async function testGetPublicRobots() {
  console.log('\n🧪 Testing: Get Public Robots.txt (GET /robots.txt)');
  console.log('='.repeat(50));

  try {
    // Test public robots.txt endpoint (no auth required)
    console.log('📝 Fetching public robots.txt...');
    const response = await makeRequest('GET', `${CONFIG.baseUrl}/robots.txt`);

    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📊 Response Content: ${response.body}`);

    if (response.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Public robots.txt fetched successfully${COLORS.reset}`);

      // Validate response is plain text
      if (typeof response.body === 'string') {
        console.log(`${COLORS.green}✅ PASS: Response is plain text${COLORS.reset}`);
        return { success: true, content: response.body };
      } else {
        console.log(`${COLORS.red}❌ FAIL: Response should be plain text${COLORS.reset}`);
        return { success: false };
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200, got ${response.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

// Run the test
if (require.main === module) {
  testGetPublicRobots().then((result) => {
    console.log('\n📊 Test Result:', result.success ? 'PASSED' : 'FAILED');
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { testGetPublicRobots };