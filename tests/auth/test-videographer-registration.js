#!/usr/bin/env node

/**
 * Videographer Registration API Test
 *
 * This script tests the /auth/register/videographer endpoint with various scenarios
 * Based on: VideographerRegistrationDto and auth routes
 *
 * Usage: node tests/auth/test-videographer-registration.js
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
  endpoint: '/auth/register/videographer',
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
      0x2F, 0x52, 0x65, 0x73, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x73, 0x20, 0x3C,
      0x3C, 0x0A, 0x2F, 0x50, 0x72, 0x6F, 0x63, 0x53, 0x65, 0x74, 0x20, 0x5B,
      0x2F, 0x50, 0x44, 0x46, 0x20, 0x2F, 0x54, 0x65, 0x78, 0x74, 0x5D, 0x0A,
      0x3E, 0x3E, 0x0A, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A,
      0x0A, 0x34, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x0A,
      0x2F, 0x4C, 0x65, 0x6E, 0x67, 0x74, 0x68, 0x20, 0x34, 0x34, 0x0A, 0x3E,
      0x3E, 0x0A, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6D, 0x0A, 0x42, 0x54, 0x0A,
      0x37, 0x32, 0x20, 0x35, 0x30, 0x30, 0x20, 0x54, 0x44, 0x0A, 0x28, 0x54,
      0x65, 0x73, 0x74, 0x20, 0x49, 0x44, 0x20, 0x44, 0x6F, 0x63, 0x75, 0x6D,
      0x65, 0x6E, 0x74, 0x29, 0x20, 0x54, 0x6A, 0x0A, 0x45, 0x54, 0x0A, 0x65,
      0x6E, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6D, 0x0A, 0x65, 0x6E, 0x64,
      0x6F, 0x62, 0x6A, 0x0A, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x35,
      0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20,
      0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0A, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x20, 0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x32, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20,
      0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x33, 0x30, 0x20,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x20, 0x6E, 0x20, 0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72,
      0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20, 0x35, 0x2F, 0x52, 0x6F,
      0x6F, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, 0x73,
      0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x32, 0x30, 0x30,
      0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46
    ]);
    fs.writeFileSync(pdfPath, pdfContent);
  }

  return { imagePath, pdfPath };
}

/**
 * Test successful videographer registration
 */
async function testSuccessfulVideographerRegistration() {
  printSection('SUCCESSFUL VIDEOGRAPHER REGISTRATION TESTS');

  const { imagePath, pdfPath } = createTestFiles();

  // Test 1: Complete videographer registration with files
  try {
    const formData = new FormData();

    // Add JSON data
    const videographerData = {
      full_name: 'John Videographer',
      email: randomEmail('videographer-test'),
      password: 'Password123!',
      skill_tags: JSON.stringify(['cinematography', 'drone', 'editing']),
      superpowers: JSON.stringify(['color grading', 'motion graphics']),
      country: 'United States',
      city: 'Los Angeles',
      state: 'California',
      portfolio_links: JSON.stringify(['https://vimeo.com/portfolio', 'https://youtube.com/channel']),
      rate_amount: 150,
      currency: 'USD',
      availability: 'full-time',
      experience_years: 5,
      bio: 'Professional videographer with 5 years of experience',
      phone_number: '+1-555-0123',
      id_type: 'passport',
      id_number: 'P123456789',
      short_description: 'Expert videographer specializing in commercial shoots',
      languages: JSON.stringify(['English', 'Spanish']),
      equipment_owned: JSON.stringify(['Sony A7S III', 'DJI Mavic 3', 'Rode NTG5']),
      experience_level: 'expert',
      role: 'Lead Videographer',
      base_skills: JSON.stringify(['camera operation', 'lighting', 'sound']),
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    // Add JSON fields
    Object.keys(videographerData).forEach(key => {
      const value = videographerData[key];
      formData.append(key, typeof value === 'boolean' ? value.toString() : value);
    });

    // Add files
    formData.append('profile_photo', fs.createReadStream(imagePath), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    formData.append('id_document', fs.createReadStream(pdfPath), {
      filename: 'id_doc.pdf',
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
      'Complete videographer registration with files',
      passed,
      passed ? 'Videographer registered successfully' : `Expected 201, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Complete videographer registration with files', false, error.message);
    failedTests++;
  }

  // Test 2: Minimal videographer registration (required fields only)
  try {
    const formData = new FormData();

    const minimalData = {
      full_name: 'Jane Videographer',
      email: randomEmail('videographer-minimal'),
      password: 'Password123!',
      skill_tags: JSON.stringify(['cinematography']),
      superpowers: JSON.stringify(['editing']),
      country: 'United States',
      city: 'New York',
      portfolio_links: JSON.stringify(['https://portfolio.com']),
      phone_number: '+1-555-0124',
      id_type: 'passport',
      short_description: 'Freelance videographer',
      languages: JSON.stringify(['English']),
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    Object.keys(minimalData).forEach(key => {
      const value = minimalData[key];
      formData.append(key, typeof value === 'boolean' ? value.toString() : value);
    });

    // Add profile photo (required for videographers)
    formData.append('profile_photo', fs.createReadStream(imagePath), {
      filename: 'profile.png',
      contentType: 'image/png'
    });

    // Add ID document (required for videographers)
    formData.append('id_document', fs.createReadStream(pdfPath), {
      filename: 'id_doc.pdf',
      contentType: 'application/pdf'
    });

    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );

    console.log(`DEBUG: Minimal registration response status: ${response.statusCode}`);
    console.log(`DEBUG: Minimal registration response body:`, JSON.stringify(response.body, null, 2));

    const passed = response.statusCode === 201 && response.body.success === true;
    printTestResult(
      'Minimal videographer registration',
      passed,
      passed ? 'Videographer registered with minimal data' : `Expected 201, got ${response.statusCode}`,
      response.body
    );

    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Minimal videographer registration', false, error.message);
    failedTests++;
  }
}

/**
 * Test videographer registration validation
 */
async function testVideographerRegistrationValidation() {
  printSection('VIDEOGRAPHER REGISTRATION VALIDATION TESTS');

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
      full_name: 'Invalid Videographer',
      email: 'invalid-email',
      password: 'Password123!',
      skill_tags: JSON.stringify(['cinematography']),
      superpowers: JSON.stringify(['editing']),
      country: 'United States',
      city: 'Los Angeles',
      portfolio_links: JSON.stringify(['https://portfolio.com'])
    };

    Object.keys(invalidData).forEach(key => {
      const value = invalidData[key];
      formData.append(key, typeof value === 'boolean' ? value.toString() : value);
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
}

/**
 * Test duplicate videographer registration
 */
async function testDuplicateVideographerRegistration() {
  printSection('DUPLICATE VIDEOGRAPHER REGISTRATION TESTS');

  const { imagePath, pdfPath } = createTestFiles();

  try {
    const formData = new FormData();

    const duplicateEmail = randomEmail('duplicate-videographer');

    const videographerData = {
      full_name: 'Duplicate Videographer',
      email: duplicateEmail,
      password: 'Password123!',
      skill_tags: JSON.stringify(['cinematography']),
      superpowers: JSON.stringify(['editing']),
      country: 'United States',
      city: 'Los Angeles',
      portfolio_links: JSON.stringify(['https://portfolio.com']),
      phone_number: '+1-555-0125',
      id_type: 'passport',
      short_description: 'Duplicate test videographer',
      languages: JSON.stringify(['English']),
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    Object.keys(videographerData).forEach(key => {
      const value = videographerData[key];
      formData.append(key, typeof value === 'boolean' ? value.toString() : value);
    });

    // Add required files
    formData.append('profile_photo', fs.createReadStream(imagePath), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    formData.append('id_document', fs.createReadStream(pdfPath), {
      filename: 'id_doc.pdf',
      contentType: 'application/pdf'
    });

    // First registration
    const response = await makeRequest(
      'POST',
      TEST_CONFIG.apiVersion + TEST_CONFIG.endpoint,
      null,
      formData
    );

    console.log(`DEBUG: First registration status: ${response.statusCode}`);
    console.log(`DEBUG: First registration body:`, JSON.stringify(response.body, null, 2));

    if (response.statusCode === 201) {
      // Second registration with same email
      const formData2 = new FormData();

      const duplicateData = {
        full_name: 'Second Videographer',
        email: duplicateEmail, // Same email
        password: 'Password123!',
        skill_tags: JSON.stringify(['drone']),
        superpowers: JSON.stringify(['color grading']),
        country: 'United States',
        city: 'New York',
        portfolio_links: JSON.stringify(['https://portfolio2.com']),
        phone_number: '+1-555-0126',
        id_type: 'driving_license',
        short_description: 'Second duplicate test videographer',
        languages: JSON.stringify(['English', 'French']),
        terms_accepted: true,
        privacy_policy_accepted: true
      };

      Object.keys(duplicateData).forEach(key => {
        const value = duplicateData[key];
        formData2.append(key, typeof value === 'boolean' ? value.toString() : value);
      });

      // Add required files for second registration
      formData2.append('profile_photo', fs.createReadStream(imagePath), {
        filename: 'profile2.png',
        contentType: 'image/png'
      });
      formData2.append('id_document', fs.createReadStream(pdfPath), {
        filename: 'id_doc2.pdf',
        contentType: 'application/pdf'
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
 * Main test runner
 */
async function runTests() {
  console.log('🎥 Starting Videographer Registration API Tests...\n');
  console.log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`Endpoint: ${TEST_CONFIG.endpoint}\n`);

  try {
    await testSuccessfulVideographerRegistration();
    await testVideographerRegistrationValidation();
    await testDuplicateVideographerRegistration();

    printSummary(passedTests, failedTests);
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testSuccessfulVideographerRegistration,
  testVideographerRegistrationValidation,
  testDuplicateVideographerRegistration
};