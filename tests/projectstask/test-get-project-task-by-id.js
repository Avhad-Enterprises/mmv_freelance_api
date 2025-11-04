#!/usr/bin/env node

/**
 * Project Task Get By ID API Test
 * Tests the GET /projects-tasks/:id endpoint
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
 * Test getting project task by ID
 */
async function testGetProjectTaskById() {
  printSection('PROJECT TASK GET BY ID TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 3;
    return;
  }

  // First create a project task to test getting it
  const testData = {
    client_id: 2, // Client profile ID for super admin
    project_title: "Test Video Editing Project for Get By ID",
    project_category: "Video Editing",
    deadline: "2024-12-31",
    project_description: "A test project for video editing services to test get by ID",
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
    url: "test-video-editing-project-get-by-id-" + Date.now(),
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
      console.log('❌ Failed to create test project for get by ID test');
      failedTests += 3;
      return;
    }
  } catch (error) {
    console.log('❌ Error creating test project:', error.message);
    failedTests += 3;
    return;
  }

  // Test 1: Get existing project task
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/${createdProjectId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && 
                   response.body?.projects && 
                   typeof response.body.projects.bidding_enabled === 'boolean';
    printTestResult(
      'Get existing project task with bidding_enabled',
      passed,
      passed ? 'Project task retrieved successfully with bidding_enabled field' : `Expected 200 with projects data including bidding_enabled, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get existing project task',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Get non-existing project task
  try {
    const nonExistentId = 99999;

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/${nonExistentId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 404; // Should get 404 for non-existent project
    printTestResult(
      'Get non-existing project task',
      passed,
      passed ? 'Correctly returned 404 for non-existent project' : `Expected 404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get non-existing project task',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 3: Invalid ID format
  try {
    const invalidId = 'abc';

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projects-tasks/${invalidId}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400 || response.statusCode === 404; // Should get validation error
    printTestResult(
      'Invalid ID format',
      passed,
      passed ? 'Properly handled invalid ID format' : `Expected 400/404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Invalid ID format',
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
  console.log('🧪 Testing Project Task Get By ID API\n');

  await testGetProjectTaskById();

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