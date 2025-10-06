#!/usr/bin/env node

/**
 * Project Task Routes Test - Insert/Create Project
 * Tests for project task creation endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  randomEmail,
  randomUsername,
} = require('./test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Test project task creation
 */
async function testProjectTaskInsert() {
  printSection('PROJECT TASK INSERT TESTS');

  // First, register and login a client to get token
  let clientToken = null;
  let clientUser = null;

  try {
    // Register client
    const clientEmail = randomEmail('client');
    const registerResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
      full_name: 'Test Client',
      email: clientEmail,
      password: 'Password123!',
      company_name: 'Test Company Inc',
      industry: 'film',
      company_size: '11-50',
      country: 'USA',
      state: 'California',
      city: 'Los Angeles',
      phone_number: '+1234567890',
      address: '123 Test St'
    });

    const registerPassed = registerResponse.statusCode === 201;
    printTestResult(
      'Client registration for project test',
      registerPassed,
      registerPassed ? `Client registered: ${clientEmail}` : `Expected 201, got ${registerResponse.statusCode}`,
      registerPassed ? null : registerResponse.body
    );

    if (registerPassed) passedTests++;
    else failedTests++;

    // Login to get token
    const loginResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: clientEmail,
      password: 'Password123!'
    });

    const loginPassed = loginResponse.statusCode === 200 && loginResponse.body && loginResponse.body.data && loginResponse.body.data.token;
    printTestResult(
      'Client login for project test',
      loginPassed,
      loginPassed ? 'Login successful' : `Expected 200 with token, got ${loginResponse.statusCode}`,
      loginPassed ? null : loginResponse.body
    );

    if (loginPassed) {
      passedTests++;
      clientToken = loginResponse.body.data.token;
      clientUser = loginResponse.body.data.user;
    } else {
      failedTests++;
    }

  } catch (error) {
    console.error('Setup failed:', error);
    failedTests++;
    return;
  }

  if (!clientToken || !clientUser) {
    console.log('Cannot proceed with tests - client setup failed');
    return;
  }

  // Test 1: Valid project creation
  try {
    const projectData = {
      client_id: clientUser.user_id,
      project_title: "Test Video Project",
      project_category: "Wedding Video",
      deadline: "2025-12-31",
      project_description: "A beautiful wedding video project",
      budget: 5000,
      skills_required: ["Video Editing", "Color Grading"],
      reference_links: ["https://example.com/reference1", "https://example.com/reference2"],
      additional_notes: "Please deliver in 4K resolution",
      projects_type: "wedding",
      project_format: "mp4",
      audio_voiceover: "male",
      audio_description: "Wedding ceremony footage",
      video_length: 300, // 5 minutes
      preferred_video_style: "cinematic",
      url: `test-wedding-video-${Date.now()}`,
      meta_title: "Wedding Video Project",
      meta_description: "Professional wedding video editing service",
      is_active: 1,
      created_by: clientUser.user_id
    };

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/projectsTask/insertprojects_task`, projectData, {
      'Authorization': `Bearer ${clientToken}`
    });

    const passed = response.statusCode === 201 && response.body.data && response.body.data.projects_task_id;
    printTestResult(
      'Valid project task creation',
      passed,
      passed ? `Project created with ID: ${response.body.data.projects_task_id}` : `Expected 201 with data, got ${response.statusCode}`,
      passed ? { project_id: response.body.data.projects_task_id, title: response.body.data.project_title } : response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult('Valid project task creation', false, `Error: ${error.message}`);
    failedTests++;
  }

  // Test 2: Project creation without authentication
  try {
    const projectData = {
      client_id: clientUser.user_id,
      project_title: "Test Project",
      project_category: "Test Category",
      deadline: "2025-12-31",
      project_description: "Test description",
      skills_required: ["Skill 1"],
      reference_links: ["https://example.com"],
      additional_notes: "Test notes",
      projects_type: "test",
      project_format: "mp4",
      audio_voiceover: "male",
      audio_description: "Test audio",
      video_length: 60,
      preferred_video_style: "test",
      url: `test-project-no-auth-${Date.now()}`,
      meta_title: "Test Title",
      meta_description: "Test Description",
      created_by: clientUser.user_id
    };

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/projectsTask/insertprojects_task`, projectData);

    const passed = response.statusCode === 404 && response.body.message === 'Authentication token missing';
    printTestResult(
      'Project creation without authentication',
      passed,
      passed ? 'Correctly rejected unauthorized request' : `Expected 401, got ${response.statusCode}`,
      passed ? null : response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult('Project creation without authentication', false, `Error: ${error.message}`);
    failedTests++;
  }

  // Test 3: Project creation with duplicate URL
  try {
    const baseUrl = `duplicate-url-test-${Date.now()}`;

    // First create a project
    const projectData = {
      client_id: clientUser.user_id,
      project_title: "Original Project",
      project_category: "Test Category",
      deadline: "2025-12-31",
      project_description: "Original description",
      budget: 1000,
      skills_required: ["Skill 1"],
      reference_links: ["https://example.com"],
      additional_notes: "Original notes",
      projects_type: "test",
      project_format: "mp4",
      audio_voiceover: "male",
      audio_description: "Original audio",
      video_length: 60,
      preferred_video_style: "test",
      url: baseUrl,
      meta_title: "Original Title",
      meta_description: "Original Description",
      is_active: 1,
      created_by: clientUser.user_id
    };

    const firstResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projectsTask/insertprojects_task`, projectData, {
      'Authorization': `Bearer ${clientToken}`
    });

    if (firstResponse.statusCode === 201) {
      // Try to create another with same URL
      const duplicateData = {
        ...projectData,
        project_title: "Duplicate Project"
      };

      const response = await makeRequest('POST', `${CONFIG.apiVersion}/projectsTask/insertprojects_task`, duplicateData, {
        'Authorization': `Bearer ${clientToken}`
      });

      const passed = response.statusCode === 409;
      printTestResult(
        'Project creation with duplicate URL',
        passed,
        passed ? 'Correctly rejected duplicate URL' : `Expected 409, got ${response.statusCode}`,
        passed ? null : response.body
      );

      if (passed) passedTests++;
      else failedTests++;
    } else {
      printTestResult('Project creation with duplicate URL', false, 'Failed to create first project for duplicate test');
      failedTests++;
    }

  } catch (error) {
    printTestResult('Project creation with duplicate URL', false, `Error: ${error.message}`);
    failedTests++;
  }

  // Test 4: Project creation with invalid data
  try {
    const invalidProjectData = {
      client_id: clientUser.user_id,
      project_title: "", // Empty title
      deadline: "invalid-date"
    };

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/projectsTask/insertprojects_task`, invalidProjectData, {
      'Authorization': `Bearer ${clientToken}`
    });

    const passed = response.statusCode === 400;
    printTestResult(
      'Project creation with invalid data',
      passed,
      passed ? 'Correctly rejected invalid data' : `Expected 400, got ${response.statusCode}`,
      passed ? null : response.body
    );

    if (passed) passedTests++;
    else failedTests++;

  } catch (error) {
    printTestResult('Project creation with invalid data', false, `Error: ${error.message}`);
    failedTests++;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 PROJECT TASK INSERT TESTS');
  console.log('=====================================\n');

  try {
    await testProjectTaskInsert();
  } catch (error) {
    console.error('Test suite failed:', error);
    failedTests++;
  }

  printSummary(passedTests, failedTests);
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testProjectTaskInsert };