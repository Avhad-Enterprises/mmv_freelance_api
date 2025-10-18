#!/usr/bin/env node

/**
 * Client Registration API Test
 *
 * This script tests the /auth/register/client endpoint with various scenarios
 * Based on: ClientRegistrationDto and auth routes
 *
 * Usage: node tests/auth/test-client-registration.js
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  randomEmail,
} = require('../test-utils');

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

let passedTests = 0;
let failedTests = 0;

// Test configuration
const TEST_CONFIG = {
  baseUrl: CONFIG.baseUrl,
  apiVersion: CONFIG.apiVersion,
  endpoint: '/auth/register/client',
  timeout: 15000,
  showFullResponse: false,
};

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
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // Width: 1
      0x00, 0x00, 0x00, 0x01, // Height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB), Compression: 0, Filter: 0, Interlace: 0
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Image data
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    fs.writeFileSync(imagePath, pngData);
  }

  // Create test PDF file
  const pdfPath = path.join(testDir, 'test-document.pdf');
  if (!fs.existsSync(pdfPath)) {
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000150 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
200
%%EOF`;
    fs.writeFileSync(pdfPath, pdfContent);
  }

  return { imagePath, pdfPath };
}

/**
 * Test successful client registration
 */
async function testSuccessfulClientRegistration() {
  printSection('SUCCESSFUL CLIENT REGISTRATION TESTS');

  const { imagePath, pdfPath } = createTestFiles();

  // Test 1: Complete client registration with files
  try {
    const formData = new FormData();

    // Add JSON data
    const clientData = {
      full_name: 'John Smith',
      email: randomEmail('client-test'),
      password: 'Password123!',
      company_name: 'Test Company Inc',
      company_website: 'https://testcompany.com',
      social_links: JSON.stringify({ linkedin: 'https://linkedin.com/company/test' }),
      company_description: 'A test company for API testing',
      industry: 'film',
      company_size: '11-50',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      phone_number: '+1-555-0123',
      zip_code: '90210',
      work_arrangement: 'remote',
      project_frequency: 'occasional',
      hiring_preferences: 'individuals',
      project_title: 'Test Project',
      project_description: 'A test project description',
      project_category: 'commercial',
      project_budget: 5000,
      project_timeline: '2-3 months',
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    // Add JSON fields
    Object.keys(clientData).forEach(key => {
      const value = clientData[key];
      // Convert boolean values to strings for FormData
      const formValue = typeof value === 'boolean' ? value.toString() : value;
      formData.append(key, formValue);
    });

    // Add files
    formData.append('profile_picture', fs.createReadStream(imagePath), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    formData.append('business_document', fs.createReadStream(pdfPath), {
      filename: 'business_doc.pdf',
      contentType: 'application/pdf'
    });

    console.log(`DEBUG: Requesting URL: ${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiVersion}${TEST_CONFIG.endpoint}`);
    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );
    
    console.log(`DEBUG: Response status: ${response.statusCode}`);
    console.log(`DEBUG: Response body:`, JSON.stringify(response.body, null, 2));

    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Complete client registration with files',
      passed,
      passed ? 'Client registered successfully' : `Expected 201, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Complete client registration with files', false, error.message);
    failedTests++;
  }

  // Test 2: Minimal client registration (required fields only)
  try {
    const formData = new FormData();

    const minimalData = {
      full_name: 'Jane Doe',
      email: randomEmail('client-minimal'),
      password: 'Password123!',
      company_name: 'Minimal Company',
      industry: 'corporate',
      company_size: '1-10',
      country: 'United States',
      state: 'New York',
      city: 'New York',
      phone_number: '+1-555-0124',
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    Object.keys(minimalData).forEach(key => {
      const value = minimalData[key];
      // Convert boolean values to strings for FormData
      const formValue = typeof value === 'boolean' ? value.toString() : value;
      formData.append(key, formValue);
    });

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );

    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Minimal client registration',
      passed,
      passed ? 'Client registered with minimal data' : `Expected 201, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Minimal client registration', false, error.message);
    failedTests++;
  }
}

/**
 * Test client registration validation errors
 */
async function testClientRegistrationValidation() {
  printSection('CLIENT REGISTRATION VALIDATION TESTS');

  // Test 1: Missing required fields
  try {
    const formData = new FormData();
    formData.append('email', randomEmail('invalid'));

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Missing required fields',
      passed,
      passed ? 'Validation error returned' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Missing required fields', false, error.message);
    failedTests++;
  }

  // Test 2: Invalid email format
  try {
    const formData = new FormData();

    const invalidData = {
      full_name: 'Invalid User',
      email: 'invalid-email',
      password: 'Password123!',
      company_name: 'Test Company',
      industry: 'film',
      company_size: '1-10',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      phone_number: '+1-555-0123',
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    Object.keys(invalidData).forEach(key => {
      const value = invalidData[key];
      // Convert boolean values to strings for FormData
      const formValue = typeof value === 'boolean' ? value.toString() : value;
      formData.append(key, formValue);
    });

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid email format',
      passed,
      passed ? 'Validation error for invalid email' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Invalid email format', false, error.message);
    failedTests++;
  }

  // Test 3: Invalid industry value
  try {
    const formData = new FormData();

    const invalidData = {
      full_name: 'Invalid User',
      email: randomEmail('invalid-industry'),
      password: 'Password123!',
      company_name: 'Test Company',
      industry: 'invalid_industry',
      company_size: '1-10',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      phone_number: '+1-555-0123',
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    Object.keys(invalidData).forEach(key => {
      const value = invalidData[key];
      // Convert boolean values to strings for FormData
      const formValue = typeof value === 'boolean' ? value.toString() : value;
      formData.append(key, formValue);
    });

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid industry value',
      passed,
      passed ? 'Validation error for invalid industry' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Invalid industry value', false, error.message);
    failedTests++;
  }

  // Test 4: Terms not accepted
  try {
    const formData = new FormData();

    const invalidData = {
      full_name: 'Terms User',
      email: randomEmail('no-terms'),
      password: 'Password123!',
      company_name: 'Test Company',
      industry: 'film',
      company_size: '1-10',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      phone_number: '+1-555-0123',
      terms_accepted: false,
      privacy_policy_accepted: true
    };

    Object.keys(invalidData).forEach(key => {
      const value = invalidData[key];
      // Convert boolean values to strings for FormData
      const formValue = typeof value === 'boolean' ? value.toString() : value;
      formData.append(key, formValue);
    });

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Terms not accepted',
      passed,
      passed ? 'Validation error for terms not accepted' : `Expected 400, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Terms not accepted', false, error.message);
    failedTests++;
  }
}

/**
 * Test duplicate email registration
 */
async function testDuplicateRegistration() {
  printSection('DUPLICATE REGISTRATION TESTS');

  const duplicateEmail = randomEmail('duplicate');

  // First registration
  try {
    const formData = new FormData();

    const clientData = {
      full_name: 'First User',
      email: duplicateEmail,
      password: 'Password123!',
      company_name: 'First Company',
      industry: 'film',
      company_size: '1-10',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      phone_number: '+1-555-0123',
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    Object.keys(clientData).forEach(key => {
      const value = clientData[key];
      // Convert boolean values to strings for FormData
      const formValue = typeof value === 'boolean' ? value.toString() : value;
      formData.append(key, formValue);
    });

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );

    if (response.statusCode === 201) {
      // Now try to register with the same email
      const formData2 = new FormData();

      const duplicateData = {
        full_name: 'Second User',
        email: duplicateEmail, // Same email
        password: 'Password123!',
        company_name: 'Second Company',
        industry: 'corporate',
        company_size: '1-10',
        country: 'United States',
        state: 'New York',
        city: 'New York',
        phone_number: '+1-555-0124',
        terms_accepted: true,
        privacy_policy_accepted: true
      };

      Object.keys(duplicateData).forEach(key => {
        const value = duplicateData[key];
        // Convert boolean values to strings for FormData
        const formValue = typeof value === 'boolean' ? value.toString() : value;
        formData2.append(key, formValue);
      });

      const response2 = await makeRequest(
        'POST',
        TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
        null,
        formData2
      );

      const passed = response2.statusCode === 409 || response2.statusCode === 400;
      printTestResult(
        'Duplicate email registration',
        passed,
        passed ? 'Duplicate email rejected' : `Expected 409/400, got ${response2.statusCode}`,
        response2.body
      );

      passed ? passedTests++ : failedTests++;
    } else {
      printTestResult('Duplicate email registration', false, 'First registration failed');
      failedTests++;
    }
  } catch (error) {
    printTestResult('Duplicate email registration', false, error.message);
    failedTests++;
  }
}

/**
 * Run all client registration tests
 */
async function runTests() {
  console.log('\n🏢 Starting Client Registration API Tests...\n');
  console.log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`Endpoint: ${TEST_CONFIG.endpoint}\n`);

  await testSuccessfulClientRegistration();
  await testClientRegistrationValidation();
  await testDuplicateRegistration();

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
  testClientRegistration: runTests
};