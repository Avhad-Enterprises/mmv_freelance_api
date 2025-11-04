#!/usr/bin/env node

/**
 * Project Task Insert API Test
 * Tests the POST /projects-tasks endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  TOKENS,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get admin token
 */
async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    console.log('Login response:', response.statusCode, response.body);

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('admin', response.body.data.token);
      console.log('✅ Admin token stored');
      return true;
    }
    console.log('❌ Login failed');
    return false;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

/**
 * Test project task insertion
 */
async function testInsertProjectTask() {
  printSection('PROJECT TASK INSERT TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 5; // Updated for 5 tests now
    return;
  }

  const testData = {
    client_id: 2, // Client profile ID for super admin
    project_title: "Test Video Editing Project",
    project_category: "Video Editing",
    deadline: "2024-12-31",
    project_description: "A test project for video editing services",
    budget: 5000.00,
    tags: JSON.stringify(["video", "editing", "test"]), // JSON string as expected by validation
    skills_required: ["Adobe Premiere", "After Effects"],
    reference_links: ["https://example.com/reference1", "https://example.com/reference2"],
    additional_notes: "Please deliver high quality work",
    projects_type: "Video Editing",
    project_format: "MP4",
    audio_voiceover: "English",
    audio_description: "Narration needed",
    video_length: 300, // 5 minutes
    preferred_video_style: "Professional",
    url: "test-video-editing-project-" + Date.now(), // Make URL unique
    meta_title: "Test Video Editing Project",
    meta_description: "Professional video editing services needed",
    is_active: 1,
    created_by: 1 // Super admin user ID
  };

  try {
    // Test 1: Valid project task insertion (requires CLIENT role, admin has SUPER_ADMIN so should work)
    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/projects-tasks`,
      testData,
      { Authorization: `Bearer ${TOKENS.admin}` } // Use stored token
    );

    const passed = response.statusCode === 201 && response.body?.data?.projects_task_id;
    printTestResult(
      'Valid project task insertion',
      passed,
      passed ? 'Project task created successfully' : `Expected 201 with project data, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Valid project task insertion',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 1.1: Project with bidding enabled
  try {
    const biddingEnabledData = {
      ...testData,
      project_title: "Test Bidding Enabled Project",
      url: "test-bidding-enabled-project-" + Date.now(),
      bidding_enabled: true
    };

    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/projects-tasks`,
      biddingEnabledData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 201 && 
                   response.body?.data?.projects_task_id && 
                   response.body?.data?.bidding_enabled === true;
    printTestResult(
      'Project with bidding enabled',
      passed,
      passed ? 'Project created with bidding enabled' : `Expected 201 with bidding_enabled=true, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Project with bidding enabled',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 1.2: Project with bidding disabled
  try {
    const biddingDisabledData = {
      ...testData,
      project_title: "Test Bidding Disabled Project",
      url: "test-bidding-disabled-project-" + Date.now(),
      bidding_enabled: false
    };

    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/projects-tasks`,
      biddingDisabledData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 201 && 
                   response.body?.data?.projects_task_id && 
                   response.body?.data?.bidding_enabled === false;
    printTestResult(
      'Project with bidding disabled',
      passed,
      passed ? 'Project created with bidding disabled' : `Expected 201 with bidding_enabled=false, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Project with bidding disabled',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 1.3: Project without bidding_enabled (should default to false)
  try {
    const defaultBiddingData = {
      ...testData,
      project_title: "Test Default Bidding Project",
      url: "test-default-bidding-project-" + Date.now()
      // bidding_enabled not specified
    };

    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/projects-tasks`,
      defaultBiddingData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 201 && 
                   response.body?.data?.projects_task_id && 
                   response.body?.data?.bidding_enabled === false;
    printTestResult(
      'Project with default bidding (false)',
      passed,
      passed ? 'Project created with default bidding_enabled=false' : `Expected 201 with bidding_enabled=false, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Project with default bidding (false)',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Missing required fields
  try {
    const invalidData = {
      // Missing required fields like client_id, project_title, etc.
      project_description: "Incomplete data"
    };

    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/projects-tasks`,
      invalidData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400; // Should get validation error for missing required fields
    printTestResult(
      'Invalid data validation',
      passed,
      passed ? 'Properly validated missing required fields' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Invalid data validation',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Testing Project Task Insert API\n');

  await testInsertProjectTask();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});

module.exports = {
  runTests
};