#!/usr/bin/env node

/**
 * Project Task Approve Submission API Test
 * Tests the PATCH /projects-tasks/submissions/:submissionId/approve endpoint
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
 * Login and get client token
 */
async function loginAsClient() {
  try {
    console.log('🔐 Logging in as client...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });

    console.log('Login response:', response.statusCode, response.body);

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('client', response.body.data.token);
      console.log('✅ Client token stored');
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
 * Test project submission approval
 */
async function testApproveSubmission() {
  printSection('Testing Project Submission Approval');

  // First, create a test project and submit it to get a valid submission ID
  let testSubmissionId = null;

  // Create test project
  const createProjectResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks`, {
    client_id: 2,
    project_title: "Test Approval Project",
    project_category: "Video Editing",
    deadline: "2024-12-31",
    project_description: "A test project for approval",
    budget: 1000.00,
    tags: JSON.stringify(["test", "approval"]),
    skills_required: ["Video Editing"],
    reference_links: ["https://example.com"],
    additional_notes: "Test project",
    projects_type: "Video Editing",
    project_format: "MP4",
    audio_voiceover: "English",
    audio_description: "Test",
    video_length: 60,
    preferred_video_style: "Professional",
    url: "test-approval-project-" + Date.now(),
    meta_title: "Test Approval",
    meta_description: "Test project for approval",
    is_active: 1,
    created_by: 1
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  let testProjectId = null;
  if (createProjectResponse.statusCode === 201 && createProjectResponse.body?.data?.projects_task_id) {
    testProjectId = createProjectResponse.body.data.projects_task_id;
    console.log(`✅ Created test project with ID: ${testProjectId}`);

    // Submit the project
    const submitResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submit`, {
      user_id: 86, // videographer user ID
      submitted_files: 'https://example.com/submission.mp4',
      additional_notes: 'Test submission for approval'
    }, {
      'Authorization': `Bearer ${TOKENS.client}` // Use client token for submission
    });

    if (submitResponse.statusCode === 201 && submitResponse.body?.data?.submission_id) {
      testSubmissionId = submitResponse.body.data.submission_id;
      console.log(`✅ Created test submission with ID: ${testSubmissionId}`);
    }
  }

  if (!testSubmissionId) {
    console.log('❌ Failed to create test submission, using fallback ID 1');
    testSubmissionId = 1; // fallback
  }

  // Test 1: Approve submission without authentication
  const test1 = await makeRequest('PATCH', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}/approve`, {
    status: 1
  });

  const passed1 = test1.statusCode === 401;
  printTestResult('Approve submission without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Approve submission with client auth (approve)
  const test2 = await makeRequest('PATCH', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}/approve`, {
    status: 1
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.success === true;
  printTestResult('Approve submission with client auth', passed2, `Status: ${test2.statusCode}, Success: ${test2.body?.success}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Reject submission with client auth (create another submission first)
  let rejectSubmissionId = testSubmissionId;
  if (testProjectId) {
    // Create another submission for rejection test
    const anotherSubmitResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submit`, {
      user_id: 87, // video editor user ID
      submitted_files: 'https://example.com/reject-submission.mp4',
      additional_notes: 'Test submission for rejection'
    }, {
      'Authorization': `Bearer ${TOKENS.client}`
    });

    if (anotherSubmitResponse.statusCode === 201 && anotherSubmitResponse.body?.data?.submission_id) {
      rejectSubmissionId = anotherSubmitResponse.body.data.submission_id;
      console.log(`✅ Created another test submission with ID: ${rejectSubmissionId} for rejection test`);
    }
  }

  const test3 = await makeRequest('PATCH', `${CONFIG.apiVersion}/projects-tasks/submissions/${rejectSubmissionId}/approve`, {
    status: 2 // reject
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed3 = test3.statusCode === 200 && test3.body?.success === true;
  printTestResult('Reject submission with client auth', passed3, `Status: ${test3.statusCode}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Approve submission with invalid status
  const test4 = await makeRequest('PATCH', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}/approve`, {
    status: 5 // invalid status
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed4 = test4.statusCode === 400;
  printTestResult('Approve submission with invalid status', passed4, `Status: ${test4.statusCode}`, test4);
  if (passed4) passedTests++; else failedTests++;

  // Test 5: Approve submission with missing status
  const test5 = await makeRequest('PATCH', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}/approve`, {
    // missing status
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed5 = test5.statusCode === 400 && test5.body?.error?.includes('status is required');
  printTestResult('Approve submission with missing status', passed5, `Status: ${test5.statusCode}, Error: ${test5.body?.error}`, test5);
  if (passed5) passedTests++; else failedTests++;

  // Test 6: Approve submission with invalid submission ID
  const test6 = await makeRequest('PATCH', `${CONFIG.apiVersion}/projects-tasks/submissions/abc/approve`, {
    status: 1
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed6 = test6.statusCode === 400 && test6.body?.error?.includes('must be a number');
  printTestResult('Approve submission with invalid ID', passed6, `Status: ${test6.statusCode}, Error: ${test6.body?.error}`, test6);
  if (passed6) passedTests++; else failedTests++;

  // Test 7: Approve non-existent submission
  const test7 = await makeRequest('PATCH', `${CONFIG.apiVersion}/projects-tasks/submissions/99999/approve`, {
    status: 1
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed7 = test7.statusCode === 404;
  printTestResult('Approve non-existent submission', passed7, `Status: ${test7.statusCode}`, test7);
  if (passed7) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Project Task Approve Submission API Tests\n');

  // Login first
  const loginSuccess = await loginAsClient();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('');

  // Run tests
  await testApproveSubmission();

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