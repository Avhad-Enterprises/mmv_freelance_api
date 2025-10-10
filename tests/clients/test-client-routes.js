#!/usr/bin/env node

/**
 * Client Routes Test
 * Tests for client-specific endpoints
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
let clientToken = null;
let clientId = null;

/**
 * Setup: Create a test client
 */
async function setupTestClient() {
  printSection('SETUP: Creating Test Client');
  
  try {
    const email = randomEmail('client-test');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
      first_name: 'Test',
      last_name: 'Client',
      email: email,
      password: 'Password123!',
      username: randomUsername('testclient'),
      company_name: 'Test Client Company',
      industry: 'technology',
    });
    
    if (response.statusCode === 201 && response.body.data) {
      clientToken = response.body.data.token;
      clientId = response.body.data.user.user_id;
      console.log(`✓ Test client created: ${email}`);
      console.log(`  User ID: ${clientId}`);
      return true;
    } else {
      console.log('✗ Failed to create test client');
      return false;
    }
  } catch (error) {
    console.log('✗ Setup failed:', error.message);
    return false;
  }
}

/**
 * Test get client profile
 */
async function testGetClientProfile() {
  printSection('GET CLIENT PROFILE TESTS');
  
  // Test 1: Get own client profile
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/clients/profile`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get own client profile',
      passed,
      passed ? 'Client profile retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get own client profile', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get client profile without authentication
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/clients/profile`);
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Get client profile without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get client profile without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Test update client profile
 */
async function testUpdateClientProfile() {
  printSection('UPDATE CLIENT PROFILE TESTS');
  
  // Test 1: Update client-specific fields
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/clients/profile`,
      {
        company_name: 'Updated Company Name',
        industry: 'entertainment',
        company_size: '51-200',
        website: 'https://updatedcompany.com',
      },
      { Authorization: `Bearer ${clientToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Update client profile with valid data',
      passed,
      passed ? 'Client profile updated' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update client profile with valid data', false, error.message);
    failedTests++;
  }
  
  // Test 2: Update with invalid URL
  try {
    const response = await makeRequest(
      'PATCH',
      `${CONFIG.apiVersion}/clients/profile`,
      {
        website: 'not-a-valid-url',
      },
      { Authorization: `Bearer ${clientToken}` }
    );
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Update client profile with invalid URL',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Update client profile with invalid URL', false, error.message);
    failedTests++;
  }
}

/**
 * Test search clients
 */
async function testSearchClients() {
  printSection('SEARCH CLIENTS TESTS');
  
  // Test 1: Search clients by industry
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/clients/search/industry/technology`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Search clients by industry',
      passed,
      passed ? `Found ${response.body.data?.length || 0} clients` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Search clients by industry', false, error.message);
    failedTests++;
  }
  
  // Test 2: Search clients by company name
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/clients/search/company/Test`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Search clients by company name',
      passed,
      passed ? `Found ${response.body.data?.length || 0} clients` : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Search clients by company name', false, error.message);
    failedTests++;
  }
  
  // Test 3: Search without authentication
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/clients/search/industry/technology`
    );
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Search clients without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Search clients without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Test get client by ID (admin functionality)
 */
async function testGetClientById() {
  printSection('GET CLIENT BY ID TESTS');
  
  // Note: This requires ADMIN role, so we'll test with current client token
  // which should fail with 403 (forbidden) rather than 404
  
  // Test 1: Get client by ID without admin role
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/clients/1`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );
    
    const passed = response.statusCode === 403 || response.statusCode === 401;
    printTestResult(
      'Get client by ID without admin role',
      passed,
      passed ? 'Access denied as expected' : `Expected 403/401, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get client by ID without admin role', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get client by ID without authentication
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/clients/1`
    );
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Get client by ID without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get client by ID without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Test client statistics
 */
async function testClientStatistics() {
  printSection('CLIENT STATISTICS TESTS');
  
  // Test 1: Get client statistics
  try {
    const response = await makeRequest(
      'GET',
      `${CONFIG.apiVersion}/clients/profile/stats`,
      null,
      { Authorization: `Bearer ${clientToken}` }
    );
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Get client statistics',
      passed,
      passed ? 'Statistics retrieved' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get client statistics', false, error.message);
    failedTests++;
  }
  
  // Test 2: Get statistics without authentication
  try {
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/clients/profile/stats`);
    
    const passed = response.statusCode === 401 || response.statusCode === 404;
    printTestResult(
      'Get statistics without authentication',
      passed,
      passed ? 'Unauthorized access rejected' : `Expected 401/404, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Get statistics without authentication', false, error.message);
    failedTests++;
  }
}

/**
 * Run all client tests
 */
async function runTests() {
  console.log('\n👔 Starting Client Route Tests...\n');
  console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);
  
  const setupSuccess = await setupTestClient();
  if (!setupSuccess) {
    console.log('\n❌ Setup failed. Cannot run tests.\n');
    process.exit(1);
  }
  
  await testGetClientProfile();
  await testUpdateClientProfile();
  await testSearchClients();
  await testGetClientById();
  await testClientStatistics();
  
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
