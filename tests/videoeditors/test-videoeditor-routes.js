#!/usr/bin/env node

/**
 * Video Editor Routes Test
 * Tests for video editor-specific endpoints
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  randomEmail,
  randomUsername,
} = require('../test-utils');

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

let passedTests = 0;
let failedTests = 0;
let editorToken = null;
let editorId = null;

/**
 * Create test files for upload testing
 */
function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create test image file (simple PNG)
  const imagePath = path.join(testDir, 'test-profile.png');
  if (!fs.existsSync(imagePath)) {
    // Create a minimal PNG file (1x1 pixel)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(imagePath, pngData);
  }

  // Create test PDF file
  const pdfPath = path.join(testDir, 'test-id.pdf');
  if (!fs.existsSync(pdfPath)) {
    const pdfContent = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x31, 0x20, 0x30,
      0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x0A, 0x2F, 0x54, 0x79, 0x70,
      0x65, 0x20, 0x2F, 0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x0A, 0x2F,
      0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x0A,
      0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x32, 0x20,
      0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x0A, 0x2F, 0x54, 0x79,
      0x70, 0x65, 0x20, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x0A, 0x2F, 0x4B,
      0x69, 0x64, 0x73, 0x20, 0x5B, 0x33, 0x20, 0x30, 0x20, 0x52, 0x5D, 0x0A,
      0x2F, 0x43, 0x6F, 0x75, 0x6E, 0x74, 0x20, 0x31, 0x0A, 0x3E, 0x3E, 0x0A,
      0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x33, 0x20, 0x30, 0x20, 0x6F,
      0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x0A, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x20,
      0x2F, 0x50, 0x61, 0x67, 0x65, 0x0A, 0x2F, 0x50, 0x61, 0x72, 0x65, 0x6E,
      0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x0A, 0x2F, 0x4D, 0x65, 0x64,
      0x69, 0x61, 0x42, 0x6F, 0x78, 0x20, 0x5B, 0x30, 0x20, 0x30, 0x20, 0x36,
      0x31, 0x32, 0x20, 0x37, 0x39, 0x32, 0x5D, 0x0A, 0x2F, 0x43, 0x6F, 0x6E,
      0x74, 0x65, 0x6E, 0x74, 0x73, 0x20, 0x34, 0x20, 0x30, 0x20, 0x52, 0x0A,
      0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x34, 0x20,
      0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x0A, 0x2F, 0x4C, 0x65,
      0x6E, 0x67, 0x74, 0x68, 0x20, 0x34, 0x34, 0x0A, 0x3E, 0x3E, 0x0A, 0x73,
      0x74, 0x72, 0x65, 0x61, 0x6D, 0x0A, 0x42, 0x54, 0x0A, 0x37, 0x32, 0x20,
      0x35, 0x30, 0x20, 0x54, 0x44, 0x0A, 0x28, 0x54, 0x65, 0x73, 0x74, 0x20,
      0x49, 0x44, 0x20, 0x44, 0x6F, 0x63, 0x75, 0x6D, 0x65, 0x6E, 0x74, 0x29,
      0x54, 0x6A, 0x0A, 0x45, 0x54, 0x0A, 0x65, 0x6E, 0x64, 0x73, 0x74, 0x72,
      0x65, 0x61, 0x6D, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x78,
      0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x35, 0x0A, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35,
      0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31,
      0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x32, 0x30, 0x20, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x33, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x30, 0x20, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C,
      0x65, 0x72, 0x0A, 0x3C, 0x3C, 0x0A, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20,
      0x35, 0x0A, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20,
      0x52, 0x0A, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72,
      0x65, 0x66, 0x0A, 0x31, 0x30, 0x30, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46
    ]);
    fs.writeFileSync(pdfPath, pdfContent);
  }

  return { imagePath, pdfPath };
}

/**
 * Setup: Create a test video editor
 */
async function setupTestVideoEditor() {
  printSection('SETUP: Creating Test Video Editor');
  
  try {
    // Create test files
    const { imagePath, pdfPath } = createTestFiles();
    
    const email = randomEmail('editor-test');
    
    // Create FormData for multipart request
    const formData = new FormData();
    
    // Add JSON data
    const videoEditorData = {
      full_name: 'Test Video Editor',
      email: email,
      password: 'Password123!',
      skill_tags: JSON.stringify(['video_editing', 'color_grading']),
      superpowers: JSON.stringify(['fast turnaround', 'high quality']),
      portfolio_links: JSON.stringify(['https://vimeo.com/test1', 'https://youtube.com/test2']),
      rate_amount: 100,
      phone_number: '+1234567890',
      id_type: 'passport',
      short_description: 'Professional test video editor',
      availability: 'full-time',
      languages: JSON.stringify(['English', 'Spanish']),
      experience_level: 'intermediate',
    };
    
    // Add JSON fields
    Object.keys(videoEditorData).forEach(key => {
      const value = videoEditorData[key];
      formData.append(key, value);
    });
    
    // Append files
    formData.append('profile_photo', fs.createReadStream(imagePath), {
      filename: 'test-profile.png',
      contentType: 'image/png',
    });
    
    formData.append('id_document', fs.createReadStream(pdfPath), {
      filename: 'test-id.pdf',
      contentType: 'application/pdf',
    });
    
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videoeditor`, null, formData);
    
    if (response.statusCode === 201 && response.body.data) {
      editorToken = response.body.data.token;
      editorId = response.body.data.user.user_id;
      console.log(`✓ Test video editor created: ${email}`);
      console.log(`  User ID: ${editorId}`);
      return true;
    } else {
      console.log('✗ Failed to create test video editor');
      console.log(`  Status: ${response.statusCode}`);
      console.log(`  Response:`, JSON.stringify(response.body, null, 2));
      return false;
    }
  } catch (error) {
    console.log('✗ Setup failed:', error.message);
    return false;
  }
}

/**
 * Test get video editor profile
 */
async function testGetVideoEditorProfile() {
  printSection('GET VIDEO EDITOR PROFILE TESTS');
  
  // Test 1: Get own video editor profile
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/profile`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get own video editor profile',
      passed,
      passed ? 'Video editor profile retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get own video editor profile', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get video editor profile without authentication
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/videoeditors/profile`);
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Get video editor profile without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get video editor profile without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Test update video editor profile
 */
async function testUpdateVideoEditorProfile() {
  printSection('UPDATE VIDEO EDITOR PROFILE TESTS');
  
  // Test 1: Update video editor-specific fields
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/videoeditors/profile`,
      {
        profile_title: 'Updated Video Editor Title',
        rate_amount: 120,
        experience_level: 'expert',
        skills: ['video_editing', 'color_grading', 'motion_graphics'],
        short_description: 'Updated description for video editor',
      },
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Update video editor profile with valid data',
      passed,
      passed ? 'Video editor profile updated' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update video editor profile with valid data', false, error.message);
    failedTests++;
  }
  
  // Test 2: Update with invalid hourly rate
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/videoeditors/profile`,
      {
        hourly_rate: -30, // Negative rate
      },
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Update video editor profile with invalid rate',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update video editor profile with invalid rate', false, error.message);
    failedTests++;
  }
}

/**
 * Test video editor discovery/search
 */
async function testVideoEditorDiscovery() {
  printSection('VIDEO EDITOR DISCOVERY TESTS');
  
  // Test 1: Get all video editors (discovery)
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/getvideoeditors`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get all video editors',
      passed,
      passed ? `Found ${response.body.count || 0} video editors` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get all video editors', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get top-rated video editors
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/top-rated`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get top-rated video editors',
      passed,
      passed ? `Found ${response.body.data?.length || 0} top-rated editors` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get top-rated video editors', false, error.message);
    failedTests++;
  }
  
  // Test 3: Get available editors
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/available`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get available editors',
      passed,
      passed ? `Found ${response.body.data?.length || 0} available editors` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get available editors', false, error.message);
    failedTests++;
  }
  
  // Test 4: Get video editor by username
  try {
    // First get the username from the profile
    const profileResponse = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/profile`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    if (profileResponse.statusCode === 200 && profileResponse.body.data?.user?.username) {
      const username = profileResponse.body.data.user.username;
      const response = await makeRequest(
        'GET',
        `${CONFIG.apiVersion}/videoeditors/username/${username}`,
        null,
        { Authorization: `Bearer ${editorToken}` }
      );
      
      const passed = response.statusCode === 200 && response.body.success === true;
      printTestResult(
        'Get video editor by username',
        passed,
        passed ? 'Video editor found by username' : `Expected 200, got ${response.statusCode}`,
        response.body
      );
      
      passed ? passedTests++ : failedTests++;
    } else {
      printTestResult('Get video editor by username', false, 'Could not get username from profile');
      failedTests++;
    }
  } catch (error) {
    printTestResult('Get video editor by username', false, error.message);
    failedTests++;
  }
}

/**
 * Test delete video editor account
 */
async function testDeleteVideoEditorAccount() {
  printSection('DELETE VIDEO EDITOR ACCOUNT TESTS');
  
  // Test 1: Delete account without authentication
  try {
    const response = await makeRequest('DELETE', `${CONFIG.apiVersion}/users/me`);
    
    const passed = response.statusCode === 401;
    printTestResult(
      'Delete account without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Delete account without authentication', false, error.message);
    failedTests++;
  }
  
  // Note: We won't test actual account deletion to avoid breaking the test user
  // for other tests. In a real scenario, you'd create a separate user for deletion tests.
}

/**
 * Test get video editor by ID
 */
async function testGetVideoEditorById() {
  printSection('GET VIDEO EDITOR BY ID TESTS');
  
  // Test 1: Get video editor by ID
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/${editorId}`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get video editor by ID',
      passed,
      passed ? 'Video editor found by ID' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get video editor by ID', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get non-existent video editor
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/99999`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 404;
    printTestResult(
      'Get non-existent video editor',
      passed,
      passed ? 'Non-existent editor returns 404' : `Expected 404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get non-existent video editor', false, error.message);
    failedTests++;
  }
}

/**
 * Test video editor statistics
 */
async function testVideoEditorStatistics() {
  printSection('VIDEO EDITOR STATISTICS TESTS');
  
  // Test 1: Get video editor statistics
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/profile/stats`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get video editor statistics',
      passed,
      passed ? 'Statistics retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get video editor statistics', false, error.message);
    failedTests++;
  }
}

/**
 * Run all video editor tests
 */
async function runTests() {
  console.log('\n✂️ Starting Video Editor Route Tests...\n');
  console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);
  
  const setupSuccess = await setupTestVideoEditor();
  if (!setupSuccess) {
    console.log('\n❌ Setup failed. Cannot run tests.\n');
    process.exit(1);
  }
  
  await testGetVideoEditorProfile();
  await testUpdateVideoEditorProfile();
  await testVideoEditorDiscovery();
  await testDeleteVideoEditorAccount();
  await testGetVideoEditorById();
  await testVideoEditorStatistics();
  
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

module.exports = { 
  runTests,
  testVideoEditorRoutes: runTests // Alias for consistency with other test files
};
