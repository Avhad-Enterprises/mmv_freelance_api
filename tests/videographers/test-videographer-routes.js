#!/usr/bin/env node

/**
 * Videographer Routes Test
 * Tests for videographer-specific endpoints
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
let videographerToken = null;
let videographerId = null;

/**
 * Setup: Create a test videographer
 */
async function setupTestVideographer() {
  printSection('SETUP: Creating Test Videographer');
  
  try {
    const email = randomEmail('videographer-test');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, {
      first_name: 'Test',
      last_name: 'Videographer',
      email: email,
      password: 'Password123!',
      username: randomUsername('testvideo'),
      profile_title: 'Professional Test Videographer',
      hourly_rate: 150,
      experience_level: 'expert',
      skills: ['cinematography', 'drone_operation'],
    });
    
    if (response.statusCode === 201 && response.body.data) {
      videographerToken = response.body.data.token;
      videographerId = response.body.data.user.user_id;
      console.log(`✓ Test videographer created: ${email}`);
      console.log(`  User ID: ${videographerId}`);
      return true;
    } else {
      console.log('✗ Failed to create test videographer');
      return false;
    }
  } catch (error) {
    console.log('✗ Setup failed:', error.message);
    return false;
  }
}

/**
 * Test get videographer profile
 */
async function testGetVideographerProfile() {
  printSection('GET VIDEOGRAPHER PROFILE TESTS');
  
  // Test 1: Get own videographer profile
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videographers/profile`,
      null,
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get own videographer profile',
      passed,
      passed ? 'Videographer profile retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get own videographer profile', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get videographer profile without authentication
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/videographers/profile`);
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Get videographer profile without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get videographer profile without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Test update videographer profile
 */
async function testUpdateVideographerProfile() {
  printSection('UPDATE VIDEOGRAPHER PROFILE TESTS');
  
  // Test 1: Update videographer-specific fields
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/videographers/profile`,
      {
        profile_title: 'Updated Videographer Title',
        hourly_rate: 200,
        experience_level: 'expert',
        skills: ['cinematography', 'drone_operation', 'lighting'],
        short_description: 'Updated description for videographer',
      },
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Update videographer profile with valid data',
      passed,
      passed ? 'Videographer profile updated' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update videographer profile with valid data', false, error.message);
    failedTests++;
  }
  
  // Test 2: Update with invalid hourly rate
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/videographers/profile`,
      {
        hourly_rate: -50, // Negative rate
      },
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Update videographer profile with invalid rate',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update videographer profile with invalid rate', false, error.message);
    failedTests++;
  }
}

/**
 * Test videographer discovery/search
 */
async function testVideographerDiscovery() {
  printSection('VIDEOGRAPHER DISCOVERY TESTS');
  
  // Test 1: Get all videographers (discovery)
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videographers?page=1&limit=10`,
      null,
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get all videographers',
      passed,
      passed ? `Found ${response.body.data?.length || 0} videographers` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get all videographers', false, error.message);
    failedTests++;
  }
  
  // Test 2: Search videographers by skills
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videographers/search/skill/cinematography`,
      null,
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Search videographers by skills',
      passed,
      passed ? `Found ${response.body.data?.length || 0} videographers` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Search videographers by skills', false, error.message);
    failedTests++;
  }
}

/**
 * Test videographer availability
 */
async function testVideographerAvailability() {
  printSection('VIDEOGRAPHER AVAILABILITY TESTS');
  
  // Test 1: Update availability status
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/videographers/me/availability`,
      {
        is_available: true,
        available_from: new Date().toISOString(),
        available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      },
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Update videographer availability',
      passed,
      passed ? 'Availability updated' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update videographer availability', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get availability
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videographers/me/availability`,
      null,
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get videographer availability',
      passed,
      passed ? 'Availability retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get videographer availability', false, error.message);
    failedTests++;
  }
}

/**
 * Test videographer portfolio
 */
async function testVideographerPortfolio() {
  printSection('VIDEOGRAPHER PORTFOLIO TESTS');
  
  // Test 1: Add portfolio item
  try {
    const response = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/videographers/me/portfolio`,
      {
        title: 'Wedding Video Project',
        description: 'Beautiful wedding video shot in Hawaii',
        video_url: 'https://vimeo.com/123456789',
        thumbnail_url: 'https://example.com/thumbnail.jpg',
        category: 'wedding',
      },
      { Authorization: `Bearer ${videographerToken}` }
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
      `${CONFIG.apiVersion}/videographers/me/portfolio`,
      null,
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get videographer portfolio',
      passed,
      passed ? `Found ${response.body.data?.length || 0} portfolio items` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get videographer portfolio', false, error.message);
    failedTests++;
  }
}

/**
 * Test videographer statistics
 */
async function testVideographerStatistics() {
  printSection('VIDEOGRAPHER STATISTICS TESTS');
  
  // Test 1: Get videographer statistics
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/videographers/profile/stats`,
      null,
      { Authorization: `Bearer ${videographerToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get videographer statistics',
      passed,
      passed ? 'Statistics retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get videographer statistics', false, error.message);
    failedTests++;
  }
}

/**
 * Run all videographer tests
 */
async function runTests() {
  console.log('\n🎥 Starting Videographer Route Tests...\n');
  console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);
  
  const setupSuccess = await setupTestVideographer();
  if (!setupSuccess) {
    console.log('\n❌ Setup failed. Cannot run tests.\n');
    process.exit(1);
  }
  
  await testGetVideographerProfile();
  await testUpdateVideographerProfile();
  await testVideographerDiscovery();
  await testVideographerStatistics();
  
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
