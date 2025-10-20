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
} = require('../test-utils');

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

let passedTests = 0;
let failedTests = 0;
let clientToken = null;
let clientId = null;

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

  // Create test PDF file (minimal PDF)
  const pdfPath = path.join(testDir, 'test-id.pdf');
  if (!fs.existsSync(pdfPath)) {
    // Create a minimal PDF file
    const pdfData = Buffer.from([
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
      0x35, 0x30, 0x30, 0x20, 0x54, 0x44, 0x0A, 0x28, 0x48, 0x65, 0x6C, 0x6C,
      0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x29, 0x20, 0x54, 0x6A, 0x0A,
      0x45, 0x54, 0x0A, 0x65, 0x6E, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6D, 0x0A,
      0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x78, 0x72, 0x65, 0x66, 0x0A,
      0x30, 0x20, 0x34, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0A,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x30, 0x20, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x37, 0x39, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x20, 0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x31, 0x37, 0x38, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20,
      0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A, 0x3C, 0x3C, 0x0A,
      0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20, 0x34, 0x0A, 0x2F, 0x52, 0x6F, 0x6F,
      0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x0A, 0x3E, 0x3E, 0x0A, 0x73,
      0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x32, 0x33, 0x35,
      0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46
    ]);
    fs.writeFileSync(pdfPath, pdfData);
  }

  return { imagePath, pdfPath };
}

/**
 * Setup: Login as existing test client
 */
async function setupTestClient() {
  printSection('SETUP: Logging in as Test Client');
  
  try {
    // Login with existing test client
    const loginResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });
    
    if (loginResponse.statusCode === 200 && loginResponse.body.data) {
      clientToken = loginResponse.body.data.token;
      clientId = loginResponse.body.data.user.user_id;
      console.log(`✓ Logged in as test client: test.client@example.com`);
      console.log(`  User ID: ${clientId}`);
      return true;
    } else {
      console.log('✗ Failed to login as test client');
      console.log(`  Status: ${loginResponse.statusCode}`);
      console.log(`  Response:`, JSON.stringify(loginResponse.body, null, 2));
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
