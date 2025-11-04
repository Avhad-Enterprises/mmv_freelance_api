#!/usr/bin/env node

/**
 * Get Submissions by Project API Test
 * Tests the GET /projects-tasks/:projectId/submissions endpoint
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
      return true;
    }
    return false;
  } catch (error) {
    return false;
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
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function loginAsClient() {
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('client', response.body.data.token);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Create test project with submissions
 */
async function createTestProjectWithSubmissions() {
  try {
    const timestamp = Date.now();
    
    // Create project
    const createProjectResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks`, {
      client_id: 2,
      project_title: "Test Project Submissions " + timestamp,
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
      url: "test-project-submissions-" + timestamp,
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

    // Create first submission
    const submit1Response = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${projectId}/submit`, {
      user_id: 86,
      submitted_files: 'https://example.com/submission1.mp4',
      additional_notes: 'First submission'
    }, {
      'Authorization': `Bearer ${TOKENS.videographer}`
    });

    if (submit1Response.statusCode === 201) {
      console.log(`✅ Created first submission`);
    }

    return projectId;
  } catch (error) {
    console.log('❌ Error creating test data:', error.message);
    return null;
  }
}

/**
 * Test get submissions by project
 */
async function testGetSubmissionsByProject() {
  printSection('Testing Get Submissions by Project');

  // Create test project with submissions
  const testProjectId = await createTestProjectWithSubmissions();
  if (!testProjectId) {
    console.log('❌ Cannot proceed without test project');
    failedTests += 6;
    return;
  }

  // Test 1: Get submissions without authentication
  const test1 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submissions`);

  const passed1 = test1.statusCode === 401;
  printTestResult('Get submissions without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Get submissions with admin auth
  const test2 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.success === true && Array.isArray(test2.body?.data);
  printTestResult('Get submissions with admin auth', passed2, `Status: ${test2.statusCode}, Is Array: ${Array.isArray(test2.body?.data)}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Get submissions with client auth
  const test3 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed3 = test3.statusCode === 200 && test3.body?.success === true;
  printTestResult('Get submissions with client auth', passed3, `Status: ${test3.statusCode}, Success: ${test3.body?.success}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Verify submissions count
  const test4 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed4 = test4.statusCode === 200 && test4.body?.count >= 1;
  printTestResult('Submissions count is correct', passed4, `Count: ${test4.body?.count}`, test4);
  if (passed4) passedTests++; else failedTests++;

  // Test 5: Get submissions with invalid project ID
  const test5 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/abc/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed5 = test5.statusCode === 400 && test5.body?.error?.includes('must be a number');
  printTestResult('Get submissions with invalid project ID', passed5, `Status: ${test5.statusCode}`, test5);
  if (passed5) passedTests++; else failedTests++;

  // Test 6: Get submissions for non-existent project
  const test6 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/99999/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed6 = test6.statusCode === 200 && test6.body?.count === 0;
  printTestResult('Get submissions for non-existent project returns empty array', passed6, `Status: ${test6.statusCode}, Count: ${test6.body?.count}`, test6);
  if (passed6) passedTests++; else failedTests++;

  // Test 7: Verify submission data includes freelancer info
  const test7 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/${testProjectId}/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed7 = test7.statusCode === 200 && 
                  test7.body?.data?.length > 0 &&
                  test7.body?.data[0]?.freelancer_first_name !== undefined;
  printTestResult('Submissions include freelancer info', passed7, `Has freelancer info: ${test7.body?.data?.[0]?.freelancer_first_name !== undefined}`, test7);
  if (passed7) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Get Submissions by Project API Tests\n');

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
  await testGetSubmissionsByProject();

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
