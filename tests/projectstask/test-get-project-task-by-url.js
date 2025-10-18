#!/usr/bin/env node

/**
 * Project Task Get By URL API Test
 * Tests the GET /projectsTask/getprojectstaskbyurl/:url endpoint
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
      email: 'avhadenterprisespc5@gmail.com',
      password: 'SuperAdmin123!'
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
 * Test getting project task by URL
 */
async function testGetProjectTaskByUrl() {
  printSection('PROJECT TASK GET BY URL TESTS');

  // First login to get token
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Failed to login as admin');
    failedTests += 3;
    return;
  }

  // First create a project task to test getting it by URL
  const testData = {
    client_id: 2,
    project_title: "Test Video Editing Project for Get By URL",
    project_category: "Video Editing",
    deadline: "2024-12-31",
    project_description: "A test project for video editing services to test get by URL",
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
    url: "test-video-editing-project-get-by-url-" + Date.now(),
    meta_title: "Test Video Editing Project",
    meta_description: "Professional video editing services needed",
    is_active: 1,
    created_by: 1
  };

  let createdProjectUrl = null;

  try {
    const createResponse = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/projectsTask/insertprojects_task`,
      testData,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    if (createResponse.statusCode === 201 && createResponse.body?.data?.url) {
      createdProjectUrl = createResponse.body.data.url;
      console.log(`✅ Created test project with URL: ${createdProjectUrl}`);
    } else {
      console.log('❌ Failed to create test project for get by URL test');
      failedTests += 3;
      return;
    }
  } catch (error) {
    console.log('❌ Error creating test project:', error.message);
    failedTests += 3;
    return;
  }

  // Test 1: Get existing project task by URL
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getprojectstaskbyurl/${createdProjectUrl}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 200 && response.body?.data;
    printTestResult(
      'Get existing project task by URL',
      passed,
      passed ? 'Project task retrieved successfully' : `Expected 200 with data, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get existing project task by URL',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 2: Get non-existing project task by URL
  try {
    const nonExistentUrl = 'non-existing-project-url-12345';

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getprojectstaskbyurl/${nonExistentUrl}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 404; // Should get 404 for non-existent project
    printTestResult(
      'Get non-existing project task by URL',
      passed,
      passed ? 'Correctly returned 404 for non-existent project' : `Expected 404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Get non-existing project task by URL',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 3: Invalid URL format
  try {
    const invalidUrl = 'invalid url with spaces';

    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getprojectstaskbyurl/${invalidUrl}`,
      null,
      { Authorization: `Bearer ${TOKENS.admin}` }
    );

    const passed = response.statusCode === 400 || response.statusCode === 404; // Should get validation error
    printTestResult(
      'Invalid URL format',
      passed,
      passed ? 'Properly handled invalid URL format' : `Expected 400/404, got ${response.statusCode}`,
      response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult(
      'Invalid URL format',
      false,
      `Request failed: ${error.message}`,
      null
    );
    failedTests++;
  }

  // Test 4: Missing authentication
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/projectsTask/getprojectstaskbyurl/${createdProjectUrl}`,
      null,
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
  console.log('🧪 Testing Project Task Get By URL API\n');

  await testGetProjectTaskByUrl();

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});