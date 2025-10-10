#!/usr/bin/env node

/**
 * Applied Projects Routes Test
 * Tests for applied projects endpoints
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  getToken,
  authHeader,
  randomEmail,
  randomUsername,
} = require('./test-utils');

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

let passedTests = 0;
let failedTests = 0;
let clientToken = null;
let editorToken = null;
let adminToken = null;
let testClientId = null;
let testEditorId = null;
let testProjectId = null;
let testApplicationId = null;

/**
 * Clean up test data
 */
async function cleanupTestData() {
  try {
    // Login as admin to clean up
    const adminResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'superadmin@mmv.com',
      password: 'SuperAdmin123!'
    });

    if (adminResponse.statusCode === 200 && adminResponse.body.data) {
      const adminToken = adminResponse.body.data.token;

      // Try to delete test users (this might not work if the API doesn't exist)
      // For now, just continue
      console.log('✓ Cleanup attempted');
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Find existing test client
 */
async function findExistingTestClient() {
  try {
    // Try to login with various test client patterns
    const testCredentials = [
      { email: 'client-test@test.com', password: 'Password123!' },
      { email: 'testclient@test.com', password: 'Password123!' },
      { email: 'client@test.com', password: 'Password123!' },
      // Try some recent test emails that might exist
      { email: 'client-test-1760074022311-0u6v7ypam@test.com', password: 'Password123!' }
    ];

    for (const creds of testCredentials) {
      try {
        const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, creds);

        if (response.statusCode === 200 && response.body.data) {
          return {
            token: response.body.data.token,
            id: response.body.data.user.user_id
          };
        }
      } catch (error) {
        // Continue to next credential
      }
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}
function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');

  // Ensure test directory exists
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create a simple test image (1x1 pixel PNG)
  const profilePicture = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5c, 0xdd, 0xdb, 0x8d, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);

  const profilePath = path.join(testDir, 'test-profile.png');
  fs.writeFileSync(profilePath, profilePicture);

  // Create a simple test PDF for ID document
  const idDocument = Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/ProcSet [/PDF /Text]
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test ID Document) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000373 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
459
%%EOF`);

  const idPath = path.join(testDir, 'test-id.pdf');
  fs.writeFileSync(idPath, idDocument);

  return { profilePath, idPath };
}

/**
 * Setup: Create test users and project
 */
async function setupTestData() {
  printSection('SETUP: Creating Test Data');

  // Create test files
  const testFiles = createTestFiles();

  try {
    // Clean up any existing test data first
    await cleanupTestData();

    // Create test client
    const clientEmail = randomEmail('client-test');
    const clientResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
      full_name: 'Test Client ' + Date.now(),
      email: clientEmail,
      password: 'Password123!',
      username: randomUsername('client'),
      company_name: 'Test Client Company ' + Date.now(),
      industry: 'film',
      company_size: '1-10',
      country: 'USA',
      state: 'California',
      city: 'Los Angeles',
      phone_number: '1234567890',
      address: '123 Test Street'
    });

    if (clientResponse.statusCode === 201 && clientResponse.body.data) {
      clientToken = clientResponse.body.data.token;
      testClientId = clientResponse.body.data.user.user_id;
      storeToken('testclient', clientToken);
      console.log(`✓ Test client created: ${clientEmail} (ID: ${testClientId})`);
    } else {
      console.log(`✗ Client creation failed: ${clientResponse.statusCode} - ${JSON.stringify(clientResponse.body)}`);
      // Try to find existing test client
      const existingClient = await findExistingTestClient();
      if (existingClient) {
        clientToken = existingClient.token;
        testClientId = existingClient.id;
        console.log(`✓ Using existing test client (ID: ${testClientId})`);
      }
    }

    // Create test editor
    const editorEmail = randomEmail('editor-test');
    const formData = new FormData();
    formData.append('full_name', 'Test Editor ' + Date.now());
    formData.append('email', editorEmail);
    formData.append('password', 'Password123!');
    formData.append('username', randomUsername('editor'));
    formData.append('skill_tags', JSON.stringify(['editing', 'video']));
    formData.append('superpowers', JSON.stringify(['color grading', 'motion graphics']));
    formData.append('portfolio_links', JSON.stringify(['https://example.com']));
    formData.append('rate_amount', '50');
    formData.append('phone_number', '1234567890');
    formData.append('id_type', 'passport');
    formData.append('id_number', '123456789');
    formData.append('short_description', 'Professional video editor with 5 years experience');
    formData.append('availability', 'full-time');
    formData.append('languages', JSON.stringify(['English', 'Spanish']));
    formData.append('experience_level', 'intermediate');
    formData.append('profile_photo', fs.createReadStream(testFiles.profilePath));
    formData.append('id_document', fs.createReadStream(testFiles.idPath));

    const editorResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videoeditor`, null, formData);

    if (editorResponse.statusCode === 201 && editorResponse.body.data) {
      editorToken = editorResponse.body.data.token;
      testEditorId = editorResponse.body.data.user.user_id;
      storeToken('testeditor', editorToken);
      console.log(`✓ Test editor created: ${editorEmail} (ID: ${testEditorId})`);
    }

    // Login as admin for admin tests
    const adminResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'superadmin@mmv.com',
      password: 'SuperAdmin123!'
    });

    if (adminResponse.statusCode === 200 && adminResponse.body.data) {
      adminToken = adminResponse.body.data.token;
      storeToken('testadmin', adminToken);
      console.log('✓ Admin login successful');
    }

    // Create a test project for the client
    if (clientToken && testClientId) {
      const projectResponse = await makeRequest('POST', `${CONFIG.apiVersion}/projectsTask/insertprojects_task`, {
        client_id: testClientId,
        project_title: 'Test Project for Applications',
        project_category: 'Video Editing',
        deadline: '2025-12-31',
        project_description: 'This is a test project for testing applications',
        budget: 1000,
        skills_required: ['editing', 'video'],
        reference_links: ['https://example.com'],
        additional_notes: 'Test project notes',
        projects_type: 'commercial',
        project_format: 'mp4',
        audio_voiceover: 'yes',
        audio_description: 'English narration needed',
        video_length: 60,
        preferred_video_style: 'modern',
        url: `test-project-${Date.now()}`,
        meta_title: 'Test Project',
        meta_description: 'A test project for applied projects testing',
        is_active: 1,
        created_by: testClientId
      }, { Authorization: `Bearer ${clientToken}` });

      if (projectResponse.statusCode === 201 && projectResponse.body.data) {
        testProjectId = projectResponse.body.data.projects_task_id;
        console.log(`✓ Test project created: ID ${testProjectId}`);
      }
    }

    return !!(clientToken && editorToken && adminToken && testProjectId);
  } catch (error) {
    console.log('✗ Setup failed:', error.message);
    return false;
  }
}

/**
 * Test editor apply to project
 */
async function testApplyToProject() {
  printSection('APPLY TO PROJECT TESTS');

  if (!testProjectId || !testEditorId) {
    console.log('⚠️ Skipping apply tests - missing test data');
    return;
  }

  // Test 1: Apply to project with valid data
  try {
    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/applications/projects/apply`,
      {
        projects_task_id: testProjectId,
        user_id: testEditorId,
        description: 'I am interested in this project and have relevant experience.'
      },
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Apply to project with valid data',
      passed,
      passed ? 'Application submitted successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    if (passed && response.body.data) {
      testApplicationId = response.body.data.applied_projects_id;
    }

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Apply to project with valid data', false, error.message);
    failedTests++;
  }

  // Test 2: Apply to same project again (should return already applied)
  try {
    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/applications/projects/apply`,
      {
        projects_task_id: testProjectId,
        user_id: testEditorId,
        description: 'Trying to apply again'
      },
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 200 && response.body.alreadyApplied === true;
    printTestResult(
      'Apply to same project again',
      passed,
      passed ? 'Correctly identified already applied' : `Expected alreadyApplied: true, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Apply to same project again', false, error.message);
    failedTests++;
  }

  // Test 3: Apply without authentication
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/applications/projects/apply`, {
      projects_task_id: testProjectId,
      user_id: testEditorId,
      description: 'Unauthorized application'
    });

    const passed = response.statusCode === 401 || response.statusCode === 403;
    printTestResult(
      'Apply without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/403, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Apply without authentication', false, error.message);
    failedTests++;
  }

  // Test 4: Apply with invalid data
  try {
    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/applications/projects/apply`,
      {
        user_id: testEditorId,
        description: 'Missing project ID'
      },
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Apply with invalid data',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Apply with invalid data', false, error.message);
    failedTests++;
  }
}

/**
 * Test get my applications
 */
async function testGetMyApplications() {
  printSection('GET MY APPLICATIONS TESTS');

  if (!testEditorId) {
    console.log('⚠️ Skipping get applications tests - missing test data');
    return;
  }

  // Test 1: Get my applications with valid data
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/my-applications`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 200 && response.body.data;
    printTestResult(
      'Get my applications with valid data',
      passed,
      passed ? `Retrieved ${response.body.data.length} applications` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get my applications with valid data', false, error.message);
    failedTests++;
  }

  // Test 2: Get my applications without authentication
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/applications/my-applications`);

    const passed = response.statusCode === 401 || response.statusCode === 403;
    printTestResult(
      'Get my applications without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/403, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get my applications without authentication', false, error.message);
    failedTests++;
  }

}

/**
 * Test get application by project
 */
async function testGetApplicationByProject() {
  printSection('GET APPLICATION BY PROJECT TESTS');

  if (!testEditorId || !testProjectId) {
    console.log('⚠️ Skipping get application by project tests - missing test data');
    return;
  }

  // Test 1: Get application by project with valid data
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/my-applications/project/${testProjectId}`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 200 && response.body.data;
    printTestResult(
      'Get application by project with valid data',
      passed,
      passed ? 'Application retrieved successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get application by project with valid data', false, error.message);
    failedTests++;
  }

  // Test 2: Get application for non-existent project
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/my-applications/project/99999`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 404;
    printTestResult(
      'Get application for non-existent project',
      passed,
      passed ? 'Not found error returned' : `Expected 404, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get application for non-existent project', false, error.message);
    failedTests++;
  }
}

/**
 * Test client get project applications
 */
async function testGetProjectApplications() {
  printSection('GET PROJECT APPLICATIONS TESTS');

  if (!testProjectId) {
    console.log('⚠️ Skipping get project applications tests - missing test data');
    return;
  }

  // Test 1: Client get applications for their project
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/projects/${testProjectId}/applications`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );

    const passed = response.statusCode === 200 && response.body.data;
    printTestResult(
      'Client get applications for their project',
      passed,
      passed ? `Retrieved ${response.body.data.length} applications` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Client get applications for their project', false, error.message);
    failedTests++;
  }

  // Test 2: Client try to access another client's project
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/projects/99999/applications`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );

    // Should return empty array or handle gracefully
    const passed = response.statusCode === 200 || response.statusCode === 404;
    printTestResult(
      'Client access non-existent project applications',
      passed,
      passed ? 'Handled gracefully' : `Unexpected status: ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Client access non-existent project applications', false, error.message);
    failedTests++;
  }

  // Test 3: Non-client try to access applications
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/projects/${testProjectId}/applications`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 403;
    printTestResult(
      'Non-client try to access applications',
      passed,
      passed ? 'Access denied' : `Expected 403, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Non-client try to access applications', false, error.message);
    failedTests++;
  }
}

/**
 * Test update application status
 */
async function testUpdateApplicationStatus() {
  printSection('UPDATE APPLICATION STATUS TESTS');

  if (!testApplicationId) {
    console.log('⚠️ Skipping update status tests - missing test application');
    return;
  }

  // Test 1: Client update application status to approved
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/applications/update-status`,
      {
        applied_projects_id: testApplicationId,
        status: 1 // 1 = ongoing/approved
      },
      { Authorization: `Bearer ${clientToken}` }
    );

    const passed = response.statusCode === 200 && response.body.data;
    printTestResult(
      'Client update application status to approved',
      passed,
      passed ? 'Status updated successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Client update application status to approved', false, error.message);
    failedTests++;
  }

  // Test 2: Non-client try to update status
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/applications/update-status`,
      {
        applied_projects_id: testApplicationId,
        status: 2
      },
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 403;
    printTestResult(
      'Non-client try to update status',
      passed,
      passed ? 'Access denied' : `Expected 403, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Non-client try to update status', false, error.message);
    failedTests++;
  }

  // Test 3: Update with invalid status
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/applications/update-status`,
      {
        applied_projects_id: testApplicationId,
        status: 999
      },
      { Authorization: `Bearer ${clientToken}` }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Update with invalid status',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update with invalid status', false, error.message);
    failedTests++;
  }
}

/**
 * Test withdraw application
 */
async function testWithdrawApplication() {
  printSection('WITHDRAW APPLICATION TESTS');

  if (!testApplicationId) {
    console.log('⚠️ Skipping withdraw tests - missing test application');
    return;
  }

  // Test 1: Editor withdraw their application
  try {
    const response = await makeRequest(
      'DELETE',
      `${CONFIG.apiVersion}/applications/my-applications/withdraw`,
      {
        applied_projects_id: testApplicationId
      },
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 200;
    printTestResult(
      'Editor withdraw their application',
      passed,
      passed ? 'Application withdrawn successfully' : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Editor withdraw their application', false, error.message);
    failedTests++;
  }

  // Test 2: Non-editor try to withdraw
  try {
    const response = await makeRequest(
      'DELETE',
      `${CONFIG.apiVersion}/applications/my-applications/withdraw`,
      {
        applied_projects_id: testApplicationId
      },
      { Authorization: `Bearer ${clientToken}` }
    );

    const passed = response.statusCode === 403;
    printTestResult(
      'Non-editor try to withdraw',
      passed,
      passed ? 'Access denied' : `Expected 403, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Non-editor try to withdraw', false, error.message);
    failedTests++;
  }
}

/**
 * Test get application count
 */
async function testGetApplicationCount() {
  printSection('GET APPLICATION COUNT TESTS');

  if (!testProjectId) {
    console.log('⚠️ Skipping count tests - missing test project');
    return;
  }

  // Test 1: Client get application count for their project
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/projects/${testProjectId}/application-count`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );

    const passed = response.statusCode === 200 && typeof response.body.count === 'number';
    printTestResult(
      'Client get application count for their project',
      passed,
      passed ? `Count: ${response.body.count}` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Client get application count for their project', false, error.message);
    failedTests++;
  }

  // Test 2: Admin get application count
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/projects/${testProjectId}/application-count`,
      null,
      { Authorization: `Bearer ${adminToken}` }
    );

    const passed = response.statusCode === 200 && typeof response.body.count === 'number';
    printTestResult(
      'Admin get application count',
      passed,
      passed ? `Count: ${response.body.count}` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Admin get application count', false, error.message);
    failedTests++;
  }
}

/**
 * Test get applications by status
 */
async function testGetApplicationsByStatus() {
  printSection('GET APPLICATIONS BY STATUS TESTS');

  // Test 1: Get pending applications
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/status/0`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );

    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get applications by status (pending)',
      passed,
      passed ? `Retrieved ${response.body.data.length} applications` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get applications by status (pending)', false, error.message);
    failedTests++;
  }

  // Test 2: Get applications with invalid status
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/status/999`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Get applications with invalid status',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get applications with invalid status', false, error.message);
    failedTests++;
  }
}

/**
 * Test get applied count
 */
async function testGetAppliedCount() {
  printSection('GET APPLIED COUNT TESTS');

  if (!testEditorId) {
    console.log('⚠️ Skipping applied count tests - missing test data');
    return;
  }

  // Test 1: Get applied count for editor
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/count`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 200 && response.body.data;
    printTestResult(
      'Get applied count for editor',
      passed,
      passed ? `Count data retrieved` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get applied count for editor', false, error.message);
    failedTests++;
  }

  // Test 2: Get applied count without authentication
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/applications/count`);

    const passed = response.statusCode === 401 || response.statusCode === 403;
    printTestResult(
      'Get applied count without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/403, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get applied count without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Test get ongoing projects
 */
async function testGetOngoingProjects() {
  printSection('GET ONGOING PROJECTS TESTS');

  if (!testEditorId) {
    console.log('⚠️ Skipping ongoing projects tests - missing test data');
    return;
  }

  // Test 1: Get ongoing projects for user
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/ongoing`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 200 && response.body.data;
    printTestResult(
      'Get ongoing projects for user',
      passed,
      passed ? `Retrieved ${response.body.data.length} projects` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get ongoing projects for user', false, error.message);
    failedTests++;
  }
}

/**
 * Test get projects by filter
 */
async function testGetProjectsByFilter() {
  printSection('GET PROJECTS BY FILTER TESTS');

  if (!testEditorId) {
    console.log('⚠️ Skipping filter tests - missing test data');
    return;
  }

  // Test 1: Get new projects
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/filter/new`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 200 && response.body.data;
    printTestResult(
      'Get projects by filter (new)',
      passed,
      passed ? `Retrieved ${response.body.data.length} projects` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get projects by filter (new)', false, error.message);
    failedTests++;
  }

  // Test 2: Get projects with invalid filter
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/filter/invalid`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Get projects with invalid filter',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get projects with invalid filter', false, error.message);
    failedTests++;
  }
}

/**
 * Test admin get completed projects count
 */
async function testGetCompletedProjectsCount() {
  printSection('GET COMPLETED PROJECTS COUNT TESTS');

  // Test 1: Admin get completed projects count
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/projects/completed-count`,
      null,
      { Authorization: `Bearer ${adminToken}` }
    );

    const passed = response.statusCode === 200 && response.body.data;
    printTestResult(
      'Admin get completed projects count',
      passed,
      passed ? `Count: ${response.body.data.completed_projects}` : `Expected 200, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Admin get completed projects count', false, error.message);
    failedTests++;
  }

  // Test 2: Non-admin try to access completed count
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/applications/projects/completed-count`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );

    const passed = response.statusCode === 403;
    printTestResult(
      'Non-admin try to access completed count',
      passed,
      passed ? 'Access denied' : `Expected 403, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Non-admin try to access completed count', false, error.message);
    failedTests++;
  }
}

/**
 * Run all applied projects tests
 */
async function runTests() {
  console.log('\n📋 Starting Applied Projects Route Tests...\n');
  console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);

  const setupSuccess = await setupTestData();
  if (!setupSuccess) {
    console.log('\n❌ Setup failed. Cannot run tests.\n');
    process.exit(1);
  }

  await testApplyToProject();
  await testGetMyApplications();
  await testGetApplicationByProject();
  await testGetProjectApplications();
  await testUpdateApplicationStatus();
  await testWithdrawApplication();
  await testGetApplicationCount();
  await testGetApplicationsByStatus();
  await testGetAppliedCount();
  await testGetOngoingProjects();
  await testGetProjectsByFilter();
  await testGetCompletedProjectsCount();

  printSummary(passedTests, failedTests, passedTests + failedTests);

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };