#!/usr/bin/env node

/**
 * Project Task Submit API Test
 * Tests the POST /projects-tasks/:id/submit endpoint
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

// Enable verbose output for debugging
CONFIG.verbose = true;
CONFIG.showFullResponse = true;

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get videographer token
 */
async function loginAsVideographer() {
  try {
    console.log('🔐 Logging in as videographer...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.videographer@example.com',
      password: 'TestPass123!'
    });

    console.log('Login response:', response.statusCode, response.body);

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('videographer', response.body.data.token);
      console.log('✅ Videographer token stored');
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
 * Test project submission
 */
async function testSubmitProject() {
  printSection('Testing Project Submission');

  // First, create a test project to submit
  const createProjectResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks`, {
    client_id: 2,
    project_title: "Test Submission Project",
    project_category: "Video Editing",
    deadline: "2024-12-31",
    project_description: "A test project for submission",
    budget: 1000.00,
    tags: JSON.stringify(["test", "submission"]),
    skills_required: ["Video Editing"],
    reference_links: ["https://example.com"],
    additional_notes: "Test project",
    projects_type: "Video Editing",
    project_format: "MP4",
    audio_voiceover: "English",
    audio_description: "Test",
    video_length: 60,
    preferred_video_style: "Professional",
    url: "test-submission-project-" + Date.now(),
    meta_title: "Test Submission",
    meta_description: "Test project for submission",
    is_active: 1,
    created_by: 1
  }, {
    'Authorization': `Bearer ${TOKENS.videographer}` // Use videographer token since they can create projects too
  });

  let testProjectId = null;
  if (createProjectResponse.statusCode === 201 && createProjectResponse.body?.data?.projects_task_id) {
    testProjectId = createProjectResponse.body.data.projects_task_id;
    console.log(`✅ Created test project with ID: ${testProjectId}`);
  } else {
    console.log('❌ Failed to create test project, using fallback ID 1');
    testProjectId = 1; // fallback
  }

  // Test 1: Submit project without authentication
  const test1 = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submit`, {
    user_id: 86, // videographer user ID
    submitted_files: 'https://example.com/file.mp4',
    additional_notes: 'Test submission'
  });

  const passed1 = test1.statusCode === 401;
  printTestResult('Submit project without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Submit project with videographer auth
  const test2 = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submit`, {
    user_id: 86, // videographer user ID
    submitted_files: 'https://example.com/file.mp4',
    additional_notes: 'Test submission with auth'
  }, {
    'Authorization': `Bearer ${TOKENS.videographer}`
  });

  const passed2 = test2.statusCode === 201 && test2.body?.success === true;
  printTestResult('Submit project with videographer auth', passed2, `Status: ${test2.statusCode}, Success: ${test2.body?.success}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Submit project with missing required fields
  const test3 = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submit`, {
    user_id: 86
    // missing submitted_files
  }, {
    'Authorization': `Bearer ${TOKENS.videographer}`
  });

  const passed3 = test3.statusCode === 400;
  printTestResult('Submit project with missing fields', passed3, `Status: ${test3.statusCode}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Submit project with invalid project ID
  const test4 = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/abc/submit`, {
    user_id: 86,
    submitted_files: 'https://example.com/file.mp4'
  }, {
    'Authorization': `Bearer ${TOKENS.videographer}`
  });

  const passed4 = test4.statusCode === 400 && test4.body?.error?.includes('must be a number');
  printTestResult('Submit project with invalid ID', passed4, `Status: ${test4.statusCode}, Error: ${test4.body?.error}`, test4);
  if (passed4) passedTests++; else failedTests++;

  // Test 5: Submit duplicate project (already submitted)
  const test5 = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submit`, {
    user_id: 86,
    submitted_files: 'https://example.com/file2.mp4'
  }, {
    'Authorization': `Bearer ${TOKENS.videographer}`
  });

  const passed5 = test5.statusCode === 409 && test5.body?.message?.includes('Already Submitted');
  printTestResult('Submit duplicate project', passed5, `Status: ${test5.statusCode}, Message: ${test5.body?.message}`, test5);
  if (passed5) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Project Task Submit API Tests\n');

  // Login first
  const loginSuccess = await loginAsVideographer();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('');

  // Run tests
  await testSubmitProject();

  // Print summary
  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };