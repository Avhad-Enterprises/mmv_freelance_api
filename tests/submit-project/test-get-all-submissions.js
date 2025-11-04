#!/usr/bin/env node

/**
 * Get All Submissions API Test
 * Tests the GET /projects-tasks/submissions endpoint
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
      return response.body.data.user.user_id;
    }
    return null;
  } catch (error) {
    return null;
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
 * Create test submissions with different statuses
 */
async function createTestSubmissions(videographerUserId) {
  try {
    const timestamp = Date.now();
    
    // Create project 1
    const project1Response = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks`, {
      client_id: 2,
      project_title: "Test All Submissions 1 " + timestamp,
      project_category: "Video Editing",
      deadline: "2024-12-31",
      project_description: "Test project 1",
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
      url: "test-all-submissions-1-" + timestamp,
      meta_title: "Test",
      meta_description: "Test",
      is_active: 1,
      created_by: 1
    }, {
      'Authorization': `Bearer ${TOKENS.admin}`
    });

    if (project1Response.statusCode !== 201) {
      return null;
    }

    const project1Id = project1Response.body.data.projects_task_id;
    console.log(`✅ Created test project 1 with ID: ${project1Id}`);

    // Create submission 1 (pending)
    const submit1Response = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks/${project1Id}/submit`, {
      user_id: videographerUserId,
      submitted_files: 'https://example.com/submission1.mp4',
      additional_notes: 'Pending submission'
    }, {
      'Authorization': `Bearer ${TOKENS.videographer}`
    });

    let submission1Id = null;
    if (submit1Response.statusCode === 201) {
      submission1Id = submit1Response.body.data.submission_id;
      console.log(`✅ Created pending submission with ID: ${submission1Id}`);
    }

    // Create project 2
    const project2Response = await makeRequest('POST', `${CONFIG.apiVersion}/projects-tasks`, {
      client_id: 2,
      project_title: "Test All Submissions 2 " + timestamp,
      project_category: "Video Editing",
      deadline: "2024-12-31",
      project_description: "Test project 2",
      budget: 2000.00,
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
      url: "test-all-submissions-2-" + timestamp,
      meta_title: "Test",
      meta_description: "Test",
      is_active: 1,
      created_by: 1
    }, {
      'Authorization': `Bearer ${TOKENS.admin}`
    });

    if (project2Response.statusCode !== 201) {
      return { project1Id, submission1Id };
    }

    const project2Id = project2Response.body.data.projects_task_id;
    console.log(`✅ Created test project 2 with ID: ${project2Id}`);

    return { project1Id, project2Id, submission1Id };
  } catch (error) {
    console.log('❌ Error creating test data:', error.message);
    return null;
  }
}

/**
 * Test get all submissions
 */
async function testGetAllSubmissions() {
  printSection('Testing Get All Submissions');

  // Login
  const adminLoginSuccess = await loginAsAdmin();
  const videographerUserId = await loginAsVideographer();
  const clientLoginSuccess = await loginAsClient();

  if (!adminLoginSuccess || !videographerUserId || !clientLoginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    failedTests += 8;
    return;
  }

  // Create test data
  const testData = await createTestSubmissions(videographerUserId);
  if (!testData) {
    console.log('❌ Cannot proceed without test data');
    failedTests += 8;
    return;
  }

  // Test 1: Get all submissions without authentication
  const test1 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions`);

  const passed1 = test1.statusCode === 401;
  printTestResult('Get all submissions without auth', passed1, `Status: ${test1.statusCode}`, test1);
  if (passed1) passedTests++; else failedTests++;

  // Test 2: Get all submissions with admin auth
  const test2 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed2 = test2.statusCode === 200 && test2.body?.success === true && Array.isArray(test2.body?.data);
  printTestResult('Get all submissions with admin auth', passed2, `Status: ${test2.statusCode}, Count: ${test2.body?.count}`, test2);
  if (passed2) passedTests++; else failedTests++;

  // Test 3: Get all submissions - client should NOT have access
  const test3 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.client}`
  });

  const passed3 = test3.statusCode === 403;
  printTestResult('Get all submissions with client auth (forbidden)', passed3, `Status: ${test3.statusCode}`, test3);
  if (passed3) passedTests++; else failedTests++;

  // Test 4: Filter submissions by status (pending = 0)
  const test4 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions?status=0`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed4 = test4.statusCode === 200 && test4.body?.success === true;
  printTestResult('Filter submissions by status=0', passed4, `Status: ${test4.statusCode}, Count: ${test4.body?.count}`, test4);
  if (passed4) passedTests++; else failedTests++;

  // Test 5: Filter submissions by project ID
  const test5 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions?projects_task_id=${testData.project1Id}`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed5 = test5.statusCode === 200 && test5.body?.success === true;
  printTestResult('Filter submissions by project_id', passed5, `Status: ${test5.statusCode}, Count: ${test5.body?.count}`, test5);
  if (passed5) passedTests++; else failedTests++;

  // Test 6: Filter submissions by user ID
  const test6 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions?user_id=${videographerUserId}`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed6 = test6.statusCode === 200 && test6.body?.success === true && test6.body?.count >= 1;
  printTestResult('Filter submissions by user_id', passed6, `Status: ${test6.statusCode}, Count: ${test6.body?.count}`, test6);
  if (passed6) passedTests++; else failedTests++;

  // Test 7: Multiple filters combined
  const test7 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions?status=0&user_id=${videographerUserId}`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed7 = test7.statusCode === 200 && test7.body?.success === true;
  printTestResult('Filter submissions with multiple params', passed7, `Status: ${test7.statusCode}, Count: ${test7.body?.count}`, test7);
  if (passed7) passedTests++; else failedTests++;

  // Test 8: Verify submission data includes all related info
  const test8 = await makeRequest('GET', `${CONFIG.apiVersion}/projects-tasks/submissions`, null, {
    'Authorization': `Bearer ${TOKENS.admin}`
  });

  const passed8 = test8.statusCode === 200 && 
                  test8.body?.data?.length > 0 &&
                  test8.body?.data[0]?.freelancer_first_name !== undefined &&
                  test8.body?.data[0]?.project_title !== undefined &&
                  test8.body?.data[0]?.client_first_name !== undefined;
  printTestResult('Submissions include freelancer, project, and client info', passed8, `Has all info: ${passed8}`, test8);
  if (passed8) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Get All Submissions API Tests\n');

  // Run tests
  await testGetAllSubmissions();

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
