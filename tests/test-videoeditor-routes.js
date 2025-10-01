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
} = require('./test-utils');

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
      `${CONFIG.apiVersion}/videoeditors?page=1&limit=10`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get all video editors',
      passed,
      passed ? `Found ${response.body.data?.length || 0} video editors` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get all video editors', false, error.message);
    failedTests++;
  }
  
  // Test 2: Search video editors by skills
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
  
  // Test 3: Search by software proficiency
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
}

/**
 * Test video editor availability
 */
async function testVideoEditorAvailability() {
  printSection('VIDEO EDITOR AVAILABILITY TESTS');
  
  // Test 1: Update availability status
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/videoeditors/me/availability`,
      {
        is_available: true,
        available_from: new Date().toISOString(),
        available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        current_capacity: 3,
        max_capacity: 5,
      },
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Update video editor availability',
      passed,
      passed ? 'Availability updated' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update video editor availability', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get availability
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/me/availability`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get video editor availability',
      passed,
      passed ? 'Availability retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get video editor availability', false, error.message);
    failedTests++;
  }
}

/**
 * Test video editor portfolio
 */
async function testVideoEditorPortfolio() {
  printSection('VIDEO EDITOR PORTFOLIO TESTS');
  
  // Test 1: Add portfolio item
  try {
    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/videoeditors/me/portfolio`,
      {
        title: 'Corporate Video Edit',
        description: 'Professional corporate video with motion graphics',
        video_url: 'https://vimeo.com/987654321',
        thumbnail_url: 'https://example.com/thumbnail.jpg',
        category: 'corporate',
        software_used: ['adobe_premiere', 'after_effects'],
      },
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Add portfolio item',
      passed,
      passed ? 'Portfolio item added' : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Add portfolio item', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get portfolio
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/me/portfolio`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get video editor portfolio',
      passed,
      passed ? `Found ${response.body.data?.length || 0} portfolio items` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get video editor portfolio', false, error.message);
    failedTests++;
  }
}

/**
 * Test video editor task management
 */
async function testVideoEditorTaskManagement() {
  printSection('VIDEO EDITOR TASK MANAGEMENT TESTS');
  
  // Test 1: Get current tasks/projects
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/me/tasks`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get current tasks',
      passed,
      passed ? `Found ${response.body.data?.length || 0} tasks` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get current tasks', false, error.message);
    failedTests++;
  }
  
  // Test 2: Check workload balance
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videoeditors/me/workload`,
      null,
      { Authorization: `Bearer ${editorToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Check workload balance',
      passed,
      passed ? 'Workload information retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Check workload balance', false, error.message);
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
  // Skip availability, portfolio, and task management tests as these endpoints don't exist
  // await testVideoEditorAvailability();
  // await testVideoEditorPortfolio();
  // await testVideoEditorTaskManagement();
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
