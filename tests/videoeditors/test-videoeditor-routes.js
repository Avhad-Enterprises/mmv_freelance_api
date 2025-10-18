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

let passedTests = 0;
let failedTests = 0;
let editorToken = null;
let editorId = null;

/**
 * Setup: Create a test video editor
 */
async function setupTestVideoEditor() {
  printSection('SETUP: Creating Test Video Editor');
  
  try {
    const email = randomEmail('editor-test');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videoeditor`, {
      first_name: 'Test',
      last_name: 'Editor',
      email: email,
      password: 'Password123!',
      username: randomUsername('testeditor'),
      profile_title: 'Professional Test Video Editor',
      hourly_rate: 100,
      experience_level: 'intermediate',
      skills: ['video_editing', 'color_grading'],
      software_proficiency: ['adobe_premiere', 'davinci_resolve'],
    });
    
    if (response.statusCode === 201 && response.body.data) {
      editorToken = response.body.data.token;
      editorId = response.body.data.user.user_id;
      console.log(`✓ Test video editor created: ${email}`);
      console.log(`  User ID: ${editorId}`);
      return true;
    } else {
      console.log('✗ Failed to create test video editor');
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
        hourly_rate: 120,
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
  
  // Test 4: Search video editors by skills
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/search/skill/color_grading`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Search video editors by skills',
      passed,
      passed ? `Found ${response.body.data?.length || 0} video editors` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Search video editors by skills', false, error.message);
    failedTests++;
  }
  
  // Test 5: Search by software proficiency
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/search/software/adobe_premiere`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Search video editors by software',
      passed,
      passed ? `Found ${response.body.data?.length || 0} editors with Adobe Premiere` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Search video editors by software', false, error.message);
    failedTests++;
  }
  
  // Test 6: Search by hourly rate
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/search/rate?min=50&max=200`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Search video editors by rate',
      passed,
      passed ? `Found ${response.body.data?.length || 0} editors in rate range` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Search video editors by rate', false, error.message);
    failedTests++;
  }
  
  // Test 7: Search by experience level
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/search/experience/intermediate`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Search video editors by experience',
      passed,
      passed ? `Found ${response.body.data?.length || 0} intermediate editors` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Search video editors by experience', false, error.message);
    failedTests++;
  }
  
  // Test 8: Get video editor by username
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
    const response = await makeRequest('DELETE', `${CONFIG.apiVersion}/videoeditors/profile`);
    
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
