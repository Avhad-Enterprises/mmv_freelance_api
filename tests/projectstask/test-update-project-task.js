#!/usr/bin/env node

/**
 * Project Task Update API Test
 * Tests the PUT /projects-tasks endpoint
 */

const {
  CONFIG,
  TOKENS,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  authHeader,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get admin token
 */
async function loginAsAdmin() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('admin', response.body.data.token);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Test updating project task
 */
async function testUpdateProjectTask() {
  printSection('PROJECT TASK UPDATE TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 5; // Updated for 5 tests now
    return;
  }

  // First create a project task to test updating it
  const testData = {
    client_id: 2,
    project_title: "Test Video Editing Project for Update",
    project_category: "Video Editing",
    deadline: "2024-12-31",
    project_description: "A test project for video editing services to test update",
    budget: 5000.00,
    tags: JSON.stringify(["video", "editing", "test"]),
    skills_required: ["Adobe Premiere", "After Effects"],
    reference_links: ["https://example.com/reference1", "https://example.com/reference2"],
    additional_notes: "Please deliver high quality work",
    projects_type: "Video Editing",
    project_format: "MP4",
    audio_voiceover: "English",
    audio_description: "Narration needed",
    video_length: 300,
    preferred_video_style: "Professional",
    url: "test-video-editing-project-update-" + Date.now(),
    meta_title: "Test Video Editing Project",
    meta_description: "Professional video editing services needed",
    is_active: 1,
    created_by: 1
  };

  let createdProjectId = null;

  try {
    const createResponse = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/projects-tasks`,
      testData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    if (createResponse.statusCode === 201 && createResponse.body?.data?.projects_task_id) {
      createdProjectId = createResponse.body.data.projects_task_id;
      console.log(`✅ Created test project with ID: ${createdProjectId}`);
    } else {
      console.log('❌ Failed to create test project for update test');
      failedTests += 3;
      return;
    }
  } catch (error) {
    console.log('❌ Error creating test project:', error.message);
    failedTests += 3;
    return;
  }

  // Test 1: Valid update
  try {
    const updateData = {
      project_title: "Updated Test Video Editing Project",
      budget: 6000.00,
      additional_notes: "Updated requirements"
    };

    const response = await makeRequest(
      'PUT',
      `${CONFIG.apiVersion}/projects-tasks/${createdProjectId}`,
      updateData,
      { Authorization: `Bearer ${TOKENS.admin}` } // Use stored token
    );

    const passed = response.statusCode === 200 && response.body?.message;
    printTestResult(
      'Valid project task update',
      passed,
      passed ? 'Project task updated successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Valid project task update',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 1.1: Update bidding_enabled to true
  try {
    const updateData = {
      bidding_enabled: true
    };

    const response = await makeRequest(
      'PUT',
      `${CONFIG.apiVersion}/projects-tasks/${createdProjectId}`,
      updateData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && response.body?.data?.bidding_enabled === true;
    printTestResult(
      'Update bidding_enabled to true',
      passed,
      passed ? 'Bidding enabled successfully' : `Expected 200 with bidding_enabled=true, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Update bidding_enabled to true',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 1.2: Update bidding_enabled to false
  try {
    const updateData = {
      bidding_enabled: false
    };

    const response = await makeRequest(
      'PUT',
      `${CONFIG.apiVersion}/projects-tasks/${createdProjectId}`,
      updateData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && response.body?.data?.bidding_enabled === false;
    printTestResult(
      'Update bidding_enabled to false',
      passed,
      passed ? 'Bidding disabled successfully' : `Expected 200 with bidding_enabled=false, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Update bidding_enabled to false',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Update non-existing project
  try {
    const updateData = {
      projects_task_id: 99999,
      project_title: "Non-existing project"
    };

    const response = await makeRequest(
      'PUT',
      `${CONFIG.apiVersion}/projects-tasks`,
      updateData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 404; // Should get 404 for non-existent project
    printTestResult(
      'Update non-existing project',
      passed,
      passed ? 'Correctly returned 404 for non-existent project' : `Expected 404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Update non-existing project',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 3: Invalid ID format
  try {
    const updateData = {
      project_title: "Invalid ID update"
    };

    const response = await makeRequest(
      'PUT',
      `${CONFIG.apiVersion}/projects-tasks/abc`,
      updateData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400; // Should get validation error for invalid ID
    printTestResult(
      'Invalid ID format',
      passed,
      passed ? 'Properly handled invalid ID format' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Missing projects_task_id',
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
  console.log('🧪 Testing Project Task Update API\n');

  await testUpdateProjectTask();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests
};
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});