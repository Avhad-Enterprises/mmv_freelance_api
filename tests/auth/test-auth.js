#!/usr/bin/env node

/**
 * Auth Routes Test
 * Tests for authentication endpoints (registration and login)
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
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Test client registration
 */
async function testClientRegistration() {
  printSection('CLIENT REGISTRATION TESTS');
  
  // Test 1: Valid client registration
  try {
    const email = randomEmail('client');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
      first_name: 'John',
      last_name: 'Doe',
      email: email,
      password: 'Password123!',
      username: randomUsername('client'),
      company_name: 'Test Company Inc',
      industry: 'technology',
      website: 'https://testcompany.com',
    });
    
    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Valid client registration',
      passed,
      passed ? `Client registered: ${email}` : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    
    if (passed) {
      passedTests++;
      // Store token if returned
      if (response.body.data && response.body.data.token) {
        storeToken('client', response.body.data.token);
      }
    } else {
      failedTests++;
    }
  } catch (error) {
    printTestResult('Valid client registration', false, error.message);
    failedTests++;
  }
  
  // Test 2: Missing required fields
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
      first_name: 'John',
      email: randomEmail('client'),
      password: 'Password123!',
      // Missing: last_name, company_name
    });
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Client registration with missing fields',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Client registration with missing fields', false, error.message);
    failedTests++;
  }
  
  // Test 3: Invalid email format
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
      first_name: 'John',
      last_name: 'Doe',
      email: 'invalid-email',
      password: 'Password123!',
      username: randomUsername('client'),
      company_name: 'Test Company',
    });
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Client registration with invalid email',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Client registration with invalid email', false, error.message);
    failedTests++;
  }
  
  // Test 4: Duplicate email
  try {
    const email = randomEmail('duplicate');
    
    // First registration
    await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
      first_name: 'John',
      last_name: 'Doe',
      email: email,
      password: 'Password123!',
      username: randomUsername('client1'),
      company_name: 'Test Company 1',
    });
    
    // Duplicate registration
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
      first_name: 'Jane',
      last_name: 'Smith',
      email: email, // Same email
      password: 'Password123!',
      username: randomUsername('client2'),
      company_name: 'Test Company 2',
    });
    
    const passed = response.statusCode === 409 || response.statusCode === 400;
    printTestResult(
      'Client registration with duplicate email',
      passed,
      passed ? 'Duplicate email rejected' : `Expected 409/400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Client registration with duplicate email', false, error.message);
    failedTests++;
  }
}

/**
 * Test videographer registration
 */
async function testVideographerRegistration() {
  printSection('VIDEOGRAPHER REGISTRATION TESTS');
  
  // Test 1: Valid videographer registration
  try {
    const email = randomEmail('videographer');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, {
      first_name: 'Mike',
      last_name: 'Camera',
      email: email,
      password: 'Password123!',
      username: randomUsername('videographer'),
      profile_title: 'Professional Videographer',
      hourly_rate: 150,
      experience_level: 'expert',
      skills: ['cinematography', 'drone_operation', 'lighting'],
    });
    
    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Valid videographer registration',
      passed,
      passed ? `Videographer registered: ${email}` : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    
    if (passed) {
      passedTests++;
      if (response.body.data && response.body.data.token) {
        storeToken('videographer', response.body.data.token);
      }
    } else {
      failedTests++;
    }
  } catch (error) {
    printTestResult('Valid videographer registration', false, error.message);
    failedTests++;
  }
  
  // Test 2: Missing freelancer-specific fields
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, {
      first_name: 'Mike',
      last_name: 'Camera',
      email: randomEmail('videographer'),
      password: 'Password123!',
      // Missing: profile_title, hourly_rate
    });
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Videographer registration with missing fields',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Videographer registration with missing fields', false, error.message);
    failedTests++;
  }
}

/**
 * Test video editor registration
 */
async function testVideoEditorRegistration() {
  printSection('VIDEO EDITOR REGISTRATION TESTS');
  
  // Test 1: Valid video editor registration
  try {
    const email = randomEmail('editor');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videoeditor`, {
      first_name: 'Sarah',
      last_name: 'Editor',
      email: email,
      password: 'Password123!',
      username: randomUsername('editor'),
      profile_title: 'Professional Video Editor',
      hourly_rate: 100,
      experience_level: 'intermediate',
      skills: ['adobe_premiere', 'color_grading', 'motion_graphics'],
      software_proficiency: ['adobe_premiere', 'after_effects', 'davinci_resolve'],
    });
    
    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Valid video editor registration',
      passed,
      passed ? `Video editor registered: ${email}` : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    
    if (passed) {
      passedTests++;
      if (response.body.data && response.body.data.token) {
        storeToken('videoeditor', response.body.data.token);
      }
    } else {
      failedTests++;
    }
  } catch (error) {
    printTestResult('Valid video editor registration', false, error.message);
    failedTests++;
  }
}

/**
 * Test login
 */
async function testLogin() {
  printSection('LOGIN TESTS');
  
  // First create a test user
  const testEmail = randomEmail('login-test');
  const testPassword = 'Password123!';
  
  await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
    first_name: 'Login',
    last_name: 'Test',
    email: testEmail,
    password: testPassword,
    username: randomUsername('login'),
    company_name: 'Login Test Company',
  });
  
  // Test 1: Valid login
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });
    
    const passed = response.statusCode === 200 && response.body.success === true;
    printTestResult(
      'Valid login',
      passed,
      passed ? 'Login successful' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Valid login', false, error.message);
    failedTests++;
  }
  
  // Test 2: Invalid password
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: testEmail,
      password: 'WrongPassword123!',
    });
    
    const passed = response.statusCode === 401;
    printTestResult(
      'Login with invalid password',
      passed,
      passed ? 'Invalid password rejected' : `Expected 401, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Login with invalid password', false, error.message);
    failedTests++;
  }
  
  // Test 3: Non-existent user
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'nonexistent@test.com',
      password: 'Password123!',
    });
    
    const passed = response.statusCode === 404 || response.statusCode === 401;
    printTestResult(
      'Login with non-existent email',
      passed,
      passed ? 'User not found' : `Expected 404/401, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Login with non-existent email', false, error.message);
    failedTests++;
  }
  
  // Test 4: Missing credentials
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: testEmail,
      // Missing password
    });
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Login with missing password',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Login with missing password', false, error.message);
    failedTests++;
  }
}

/**
 * Run all auth tests
 */
async function runTests() {
  console.log('\n🔐 Starting Auth Route Tests...\n');
  console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);
  
  await testClientRegistration();
  await testVideographerRegistration();
  await testVideoEditorRegistration();
  await testLogin();
  
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
