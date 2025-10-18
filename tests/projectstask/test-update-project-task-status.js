#!/usr/bin/env node

/**
 * Project Task Update Status API Test
 * Tests the PATCH /projects-tasks/ endpoint
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
 * Test updating project task status
 */
async function testUpdateProjectTaskStatus() {
  printSection('PROJECT TASK UPDATE STATUS TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 3;
    return;
  }

  // First create a project task to test updating its status
  const testData = {
    client_id: 2,
    project_title: "Test Video Editing Project for Status Update",
    project_category: "Video Editing",
    deadline: "2024-12-31",
    project_description: "A test project for video editing services to test status update",
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
    url: "test-video-editing-project-status-update-" + Date.now(),
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
      console.log('❌ Failed to create test project for status update test');
      failedTests += 3;
      return;
    }
  } catch (error) {
    console.log('❌ Error creating test project:', error.message);
    failedTests += 3;
    return;
  }

  // Test 1: Valid status update
  try {
    const statusUpdateData = {
      status: 1, // 1: assigned
      user_id: 1 // User performing the update
    };

    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/projects-tasks/${createdProjectId}/status`,
      statusUpdateData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && response.body?.message;
    printTestResult(
      'Valid status update',
      passed,
      passed ? 'Status updated successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Valid status update',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Missing required fields
  try {
    const invalidData = {
      // Missing status
      user_id: 1
    };

    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/projects-tasks/${createdProjectId}/status`,
      invalidData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400; // Should get validation error
    printTestResult(
      'Missing required fields',
      passed,
      passed ? 'Properly validated missing required fields' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Missing required fields',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 3: Invalid status value
  try {
    const invalidStatusData = {
      status: 999, // Invalid status
      user_id: 1
    };

    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/projects-tasks/${createdProjectId}/status`,
      invalidStatusData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400; // Should get validation error
    printTestResult(
      'Invalid status value',
      passed,
      passed ? 'Properly validated invalid status' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Invalid status value',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 4: Missing authentication
  try {
    const statusUpdateData = {
      status: 2, // 2: completed
      user_id: 1
    };

    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/projects-tasks/${createdProjectId}/status`,
      statusUpdateData,
      {} // No auth header
    );

    const passed = response.statusCode === 401; // Should get 401 for missing auth
    printTestResult(
      'Missing authentication',
      passed,
      passed ? 'Correctly returned 401 for missing authentication' : `Expected 401, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Missing authentication',
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
  console.log('🧪 Testing Project Task Update Status API\n');

  await testUpdateProjectTaskStatus();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});