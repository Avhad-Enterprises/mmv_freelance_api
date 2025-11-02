#!/usr/bin/env node

/**
 * Get Submissions by Freelancer API Test
 * Tests the GET /projects-tasks/submissions/freelancer/:userId endpoint
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
 * Login functions
 */
async function loginAsAdmin() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestAdmin123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('admin', response.body.data.token);
      return response.body.data.user.user_id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function loginAsVideographer() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.videographer@example.com',
      password: 'TestPass123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('videographer', response.body.data.token);
      return response.body.data.user.user_id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Create test submissions for freelancer
 */
async function createTestSubmissionsForFreelancer(freelancerUserId) {
  try {
    const timestamp = Date.now();
    
    // Create project
    const createProjectResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks`, {
      client_id: 2,
      project_title: "Test Freelancer Submissions " + timestamp,
      project_category: "Video Editing",
      deadline: "2024-12-31",
      project_description: "Test project",
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
      url: "test-freelancer-submissions-" + timestamp,
      meta_title: "Test",
      meta_description: "Test",
      is_active: 1,
      created_by: 1
    }, {
      'Authorization': `Bearer ${TOKENS.admin}`
    });

    if (createProjectResponse.statusCode !== 201) {
      return null;
    }

    const projectId = createProjectResponse.body.data.projects_task_id;
    console.log(`✅ Created test project with ID: ${projectId}`);

    // Create submission
    const submitResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${projectId}/submit`, {
      user_id: freelancerUserId,
      submitted_files: 'https://example.com/freelancer-submission.mp4',
      additional_notes: 'Test submission by freelancer'
    }, {
      'Authorization': `Bearer ${TOKENS.videographer}`
    });

    if (submitResponse.statusCode === 201) {
      console.log(`✅ Created submission for freelancer`);
      return freelancerUserId;
    }

    return null;
  } catch (error) {
    console.log('❌ Error creating test data:', error.message);
    return null;
  }
}

/**
 * Test get submissions by freelancer
 */
async function testGetSubmissionsByFreelancer() {
  printSection('Testing Get Submissions by Freelancer');

  // Login and get user IDs
  const adminUserId = await loginAsAdmin();
  const videographerUserId = await loginAsVideographer();

  if (!adminUserId || !videographerUserId) {
    console.log('❌ Cannot proceed without authentication');
    failedTests += 7;
    return;
  }

  console.log(`📌 Videographer User ID: ${videographerUserId}`);

  // Create test submissions
  const testUserId = await createTestSubmissionsForFreelancer(videographerUserId);
  if (!testUserId) {
    console.log('❌ Cannot proceed without test submissions');
    failedTests += 7;
    return;
  }

  // Test 1: Get submissions without authentication
  const test1 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/freelancer/${testUserId}`);

  const passed1 = test1.statusCode === 401;
  printTestResult('Get freelancer submissions without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Get submissions with videographer auth (own submissions)
  const test2 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/freelancer/${testUserId}`, null, {
    'Authorization': `Bearer ${TOKENS.videographer}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.success === true && Array.isArray(test2.body?.data);
  printTestResult('Get own submissions with videographer auth', passed2, `Status: ${test2.statusCode}, Count: ${test2.body?.count}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Get submissions with admin auth
  const test3 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/freelancer/${testUserId}`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed3 = test3.statusCode === 200 && test3.body?.success === true;
  printTestResult('Get freelancer submissions with admin auth', passed3, `Status: ${test3.statusCode}, Success: ${test3.body?.success}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Verify submissions count
  const test4 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/freelancer/${testUserId}`, null, {
    'Authorization': `Bearer ${TOKENS.videographer}`
  });

  const passed4 = test4.statusCode === 200 && test4.body?.count >= 1;
  printTestResult('Submissions count is correct', passed4, `Count: ${test4.body?.count}`, test4);
  if (passed4) passedTests++; else failedTests++;

  // Test 5: Get submissions with invalid user ID
  const test5 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/freelancer/abc`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed5 = test5.statusCode === 400 && test5.body?.error?.includes('must be a number');
  printTestResult('Get submissions with invalid user ID', passed5, `Status: ${test5.statusCode}`, test5);
  if (passed5) passedTests++; else failedTests++;

  // Test 6: Get submissions for user with no submissions
  const test6 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/freelancer/99999`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed6 = test6.statusCode === 200 && test6.body?.count === 0;
  printTestResult('Get submissions for user with no submissions returns empty array', passed6, `Status: ${test6.statusCode}, Count: ${test6.body?.count}`, test6);
  if (passed6) passedTests++; else failedTests++;

  // Test 7: Verify submission data includes project and client info
  const test7 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions/freelancer/${testUserId}`, null, {
    'Authorization': `Bearer ${TOKENS.videographer}`
  });

  const passed7 = test7.statusCode === 200 && 
                  test7.body?.data?.length > 0 &&
                  test7.body?.data[0]?.project_title !== undefined &&
                  test7.body?.data[0]?.client_first_name !== undefined;
  printTestResult('Submissions include project and client info', passed7, `Has project info: ${test7.body?.data?.[0]?.project_title !== undefined}`, test7);
  if (passed7) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Get Submissions by Freelancer API Tests\n');

  // Run tests
  await testGetSubmissionsByFreelancer();

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
