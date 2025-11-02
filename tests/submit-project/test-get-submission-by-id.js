#!/usr/bin/env node

/**
 * Get Submission by ID API Test
 * Tests the GET /projects-tasks/submissions/:submissionId endpoint
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
 * Login and get tokens
 */
async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

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

async function loginAsVideographer() {
  try {
    console.log('🔐 Logging in as videographer...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.videographer@example.com',
      password: 'TestPass123!'
    });

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

async function loginAsClient() {
  try {
    console.log('🔐 Logging in as client...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });

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
 * Create a test submission
 */
async function createTestSubmission() {
  try {
    // First create a project
    const timestamp = Date.now();
    const createProjectResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks`, {
      client_id: 2,
      project_title: "Test Get Submission Project " + timestamp,
      project_category: "Video Editing",
      deadline: "2024-12-31",
      project_description: "Test project for get submission",
      budget: 1000.00,
      tags: JSON.stringify(["test"]),
      skills_required: ["Video Editing"],
      reference_links: ["https://example.com"],
      additional_notes: "Test",
      projects_type: "Video Editing",
      project_format: "MP4",
      audio_voiceover: "English",
      audio_description: "Test",
      video_length: 60,
      preferred_video_style: "Professional",
      url: "test-get-submission-" + timestamp,
      meta_title: "Test",
      meta_description: "Test",
      is_active: 1,
      created_by: 1
    }, {
      'Authorization': `Bearer ${TOKENS.admin}`
    });

    if (createProjectResponse.statusCode !== 201) {
      console.log('❌ Failed to create test project');
      return null;
    }

    const projectId = createProjectResponse.body.data.projects_task_id;
    console.log(`✅ Created test project with ID: ${projectId}`);

    // Submit the project
    const submitResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${projectId}/submit`, {
      user_id: 86,
      submitted_files: 'https://example.com/test-file.mp4',
      additional_notes: 'Test submission'
    }, {
      'Authorization': `Bearer ${TOKENS.videographer}`
    });

    if (submitResponse.statusCode === 201 && submitResponse.body?.data?.submission_id) {
      const submissionId = submitResponse.body.data.submission_id;
      console.log(`✅ Created test submission with ID: ${submissionId}`);
      return submissionId;
    }

    console.log('❌ Failed to create test submission');
    return null;
  } catch (error) {
    console.log('❌ Error creating test submission:', error.message);
    return null;
  }
}

/**
 * Test get submission by ID
 */
async function testGetSubmissionById() {
  printSection('Testing Get Submission by ID');

  // Create a test submission
  const testSubmissionId = await createTestSubmission();
  if (!testSubmissionId) {
    console.log('❌ Cannot proceed without test submission');
    failedTests += 5;
    return;
  }

  // Test 1: Get submission without authentication
  const test1 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}`);

  const passed1 = test1.statusCode === 401;
  printTestResult('Get submission without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Get submission with admin auth
  const test2 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.success === true && test2.body?.data?.submission_id === testSubmissionId;
  printTestResult('Get submission with admin auth', passed2, `Status: ${test2.statusCode}, Success: ${test2.body?.success}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Get submission with videographer auth (who created it)
  const test3 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}`, null, {
    'Authorization': `Bearer ${TOKENS.videographer}`
  });

  const passed3 = test3.statusCode === 200 && test3.body?.success === true;
  printTestResult('Get submission with videographer auth', passed3, `Status: ${test3.statusCode}, Success: ${test3.body?.success}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Get submission with client auth
  const test4 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}`, null, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed4 = test4.statusCode === 200 && test4.body?.success === true;
  printTestResult('Get submission with client auth', passed4, `Status: ${test4.statusCode}, Success: ${test4.body?.success}`, test4);
  if (passed4) passedTests++; else failedTests++;

  // Test 5: Get submission with invalid ID
  const test5 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/abc`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed5 = test5.statusCode === 400 && test5.body?.error?.includes('must be a number');
  printTestResult('Get submission with invalid ID', passed5, `Status: ${test5.statusCode}, Error: ${test5.body?.error}`, test5);
  if (passed5) passedTests++; else failedTests++;

  // Test 6: Get non-existent submission
  const test6 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/99999`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed6 = test6.statusCode === 404 && test6.body?.error?.includes('not found');
  printTestResult('Get non-existent submission', passed6, `Status: ${test6.statusCode}, Error: ${test6.body?.error}`, test6);
  if (passed6) passedTests++; else failedTests++;

  // Test 7: Verify submission data includes freelancer info
  const test7 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/${testSubmissionId}`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed7 = test7.statusCode === 200 && 
                  test7.body?.data?.freelancer_first_name !== undefined &&
                  test7.body?.data?.project_title !== undefined;
  printTestResult('Submission includes freelancer and project info', passed7, `Has freelancer info: ${test7.body?.data?.freelancer_first_name !== undefined}`, test7);
  if (passed7) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Get Submission by ID API Tests\n');

  // Login
  const adminLoginSuccess = await loginAsAdmin();
  const videographerLoginSuccess = await loginAsVideographer();
  const clientLoginSuccess = await loginAsClient();

  if (!adminLoginSuccess || !videographerLoginSuccess || !clientLoginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('');

  // Run tests
  await testGetSubmissionById();

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
