#!/usr/bin/env node

/**
 * Complete Videographer Registration Test
 * Tests videographer registration with all fields including file uploads
 * This test simulates a real-world videographer registration scenario
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

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

let passedTests = 0;
let failedTests = 0;

/**
 * Create test files for upload
 */
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

  // Create a simple PDF document
  const pdfDocument = Buffer.from(`%PDF-1.4
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
(Videographer Portfolio) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
309
%%EOF`);

  const profilePath = path.join(testDir, 'videographer_profile.png');
  const idDocPath = path.join(testDir, 'videographer_id_document.pdf');

  fs.writeFileSync(profilePath, profilePicture);
  fs.writeFileSync(idDocPath, pdfDocument);

  return {
    profilePicture: profilePath,
    idDocument: idDocPath
  };
}

/**
 * Make multipart form request with file uploads
 */
async function makeMultipartRequest(url, data, files) {
  const form = new FormData();
  
  // Add text fields
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      form.append(key, data[key].toString());
    }
  });
  
  // Add files
  Object.keys(files).forEach(key => {
    if (files[key] && fs.existsSync(files[key])) {
      form.append(key, fs.createReadStream(files[key]));
    }
  });

  try {
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json',
      },
      validateStatus: () => true, // Don't throw on HTTP error status
    });

    return {
      statusCode: response.status,
      body: response.data,
      headers: response.headers
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

/**
 * Test complete videographer registration with all fields and files
 */
async function testCompleteVideographerRegistration() {
  printSection('COMPLETE VIDEOGRAPHER REGISTRATION TEST');
  
  const testFiles = createTestFiles();
  const email = randomEmail('complete-videographer');
  
  const videographerData = {
    // Step 1: Basic Information (Required)
    username: randomUsername('maria'),
    first_name: 'Maria',
    last_name: 'Rodriguez',
    email: email,
    password: 'Videographer123!',

    // Step 2: Skills & Location (Required)
    skills: JSON.stringify([
      'Cinematography',
      'Video Production',
      'Drone Operation',
      'Event Videography'
    ]),
    superpowers: JSON.stringify([
      'Cinematic Storytelling',
      'Drone Cinematography'
    ]),
    country: 'United States',
    city: 'Miami',
    latitude: 25.7617,
    longitude: -80.1918,
    portfolio_links: JSON.stringify([
      'https://vimeo.com/mariarodriguez',
      'https://youtube.com/mariavideography'
    ]),
    hourly_rate: 85,
    currency: 'USD',

    // Step 3: Verification & Documents (Required)
    phone_number: '+1555123456',
    id_type: 'passport',

    // Step 4: Professional Details (Required)
    short_description: 'Award-winning videographer with 10+ years of experience in capturing life\'s most precious moments.',
    availability: 'full_time',
    languages: JSON.stringify([
      'English',
      'Spanish'
    ]),
  };

  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      videographerData,
      {
        profile_picture: testFiles.profilePicture,
        id_document: testFiles.idDocument
      }
    );
    
    const passed = response.statusCode === 201 && response.body.success === true;
    
    printTestResult(
      'Complete videographer registration with files',
      passed,
      passed ? `Videographer registered: ${email}` : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    
    if (passed) {
      passedTests++;
      
      // Verify response structure
      const { data } = response.body;
      const userStructureValid = (
        data && 
        data.user && 
        data.user.user_id &&
        data.user.email === email &&
        data.user.user_type === 'VIDEOGRAPHER' &&
        data.token
      );
      
      printTestResult(
        'Response structure validation',
        userStructureValid,
        userStructureValid ? 'Response has correct structure' : 'Invalid response structure',
        { user: data?.user, hasToken: !!data?.token }
      );
      
      userStructureValid ? passedTests++ : failedTests++;
      
      return data; // Return for further tests
    } else {
      failedTests++;
      return null;
    }
  } catch (error) {
    printTestResult('Complete videographer registration with files', false, error.message);
    failedTests++;
    return null;
  }
}

/**
 * Test registration without optional files
 */
async function testMinimalVideographerRegistration() {
  printSection('MINIMAL VIDEOGRAPHER REGISTRATION TEST');
  
  const email = randomEmail('minimal-videographer');
  
  const minimalData = {
    first_name: 'James',
    last_name: 'Carter',
    email: email,
    password: 'MinimalVideographer123!',
    skills: JSON.stringify(['Video Production', 'Event Videography']),
    superpowers: JSON.stringify(['Quick Turnaround']),
    country: 'United States',
    city: 'Los Angeles',
    latitude: 34.0522,
    longitude: -118.2437,
    portfolio_links: JSON.stringify(['https://youtube.com/jamescarter']),
    hourly_rate: 45,
    phone_number: '+1555987654',
    id_type: 'passport',
    short_description: 'Freelance videographer specializing in event coverage.',
    availability: 'part_time',
    languages: JSON.stringify(['English'])
  };

  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      minimalData,
      {} // No files
    );
    
    const passed = response.statusCode === 201 && response.body.success === true;
    
    printTestResult(
      'Minimal videographer registration (no files)',
      passed,
      passed ? `Videographer registered: ${email}` : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Minimal videographer registration (no files)', false, error.message);
    failedTests++;
  }
}

/**
 * Test duplicate email registration
 */
async function testDuplicateEmailRegistration(existingEmail) {
  printSection('DUPLICATE EMAIL REGISTRATION TEST');
  
  const duplicateData = {
    first_name: 'Duplicate',
    last_name: 'Videographer',
    email: existingEmail, // Use existing email
    password: 'DuplicateVideographer123!',
    skills: JSON.stringify(['Video Production']),
    superpowers: JSON.stringify(['Quality Work']),
    country: 'United States',
    city: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    portfolio_links: JSON.stringify(['https://example.com']),
    hourly_rate: 50,
    phone_number: '+1555111111',
    id_type: 'passport',
    short_description: 'Duplicate videographer test.',
    availability: 'full_time',
    languages: JSON.stringify(['English'])
  };

  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      duplicateData,
      {}
    );
    
    const passed = response.statusCode === 409; // Conflict
    
    printTestResult(
      'Duplicate email registration',
      passed,
      passed ? 'Correctly rejected duplicate email' : `Expected 409, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Duplicate email registration', false, error.message);
    failedTests++;
  }
}

/**
 * Test invalid field formats
 */
async function testInvalidFieldFormats() {
  printSection('INVALID FIELD FORMAT TESTS');

  // Test invalid email format
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Test',
        last_name: 'Videographer',
        email: 'invalid-email-format',
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid email format',
      passed,
      passed ? 'Correctly rejected invalid email format' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Invalid email format', false, error.message);
    failedTests++;
  }

  // Test password too short
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Test',
        last_name: 'Videographer',
        email: randomEmail('short-password'),
        password: '123',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Password too short (minimum 6 characters)',
      passed,
      passed ? 'Correctly rejected short password' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Password too short (minimum 6 characters)', false, error.message);
    failedTests++;
  }

  // Test invalid experience level
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Test',
        last_name: 'Videographer',
        email: randomEmail('invalid-experience'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer',
        experience_level: 'invalid_level'
      },
      {}
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid experience level',
      passed,
      passed ? 'Correctly rejected invalid experience level' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Invalid experience level', false, error.message);
    failedTests++;
  }

  // Test invalid hourly rate (negative)
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Test',
        last_name: 'Videographer',
        email: randomEmail('negative-rate'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer',
        hourly_rate: -10
      },
      {}
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid hourly rate (negative)',
      passed,
      passed ? 'Correctly rejected negative hourly rate' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Invalid hourly rate (negative)', false, error.message);
    failedTests++;
  }

  // Test invalid hourly rate (too high)
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Test',
        last_name: 'Videographer',
        email: randomEmail('high-rate'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer',
        hourly_rate: 15000
      },
      {}
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid hourly rate (above 10000)',
      passed,
      passed ? 'Correctly rejected excessive hourly rate' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Invalid hourly rate (above 10000)', false, error.message);
    failedTests++;
  }
}

/**
 * Test missing required fields one by one
 */
async function testMissingRequiredFields() {
  printSection('MISSING REQUIRED FIELDS TESTS');

  const requiredFields = [
    'first_name', 'last_name', 'email', 'password', 'skills', 'superpowers',
    'country', 'city', 'latitude', 'longitude', 'portfolio_links', 'hourly_rate',
    'phone_number', 'id_type', 'short_description', 'availability', 'languages'
  ];

  for (const field of requiredFields) {
    try {
      const videographerData = {
        first_name: 'Test',
        last_name: 'Videographer',
        email: randomEmail('missing-field'),
        password: 'Videographer123!',
        skills: JSON.stringify(['Skill1']),
        superpowers: JSON.stringify(['Superpower1']),
        country: 'United States',
        city: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        portfolio_links: JSON.stringify(['https://example.com']),
        hourly_rate: 50,
        phone_number: '+1555111111',
        id_type: 'passport',
        short_description: 'Test description',
        availability: 'full_time',
        languages: JSON.stringify(['English'])
      };

      // Remove the required field
      delete videographerData[field];

      const response = await makeMultipartRequest(
        `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
        videographerData,
        {}
      );

      const passed = response.statusCode === 400;
      printTestResult(
        `Missing ${field} field`,
        passed,
        passed ? `Correctly rejected missing ${field}` : `Expected 400, got ${response.statusCode}`,
        response.body
      );
      passed ? passedTests++ : failedTests++;
    } catch (error) {
      printTestResult(`Missing ${field} field`, false, error.message);
      failedTests++;
    }
  }
}

/**
 * Test skills array parsing
 */
async function testSkillsArrayParsing() {
  printSection('SKILLS ARRAY PARSING TEST');
  
  const email = randomEmail('skills-test-vg');
  
  const skillsData = {
    first_name: 'Skills',
    last_name: 'Test',
    email: email,
    password: 'SkillsTest123!',
    skills: JSON.stringify(['Cinematography', 'Video Editing', 'Drone Operation']), // JSON array
    superpowers: JSON.stringify(['Superpower1']),
    country: 'United States',
    city: 'Test City',
    latitude: 40.7128,
    longitude: -74.0060,
    portfolio_links: JSON.stringify(['https://example.com']),
    hourly_rate: 50,
    phone_number: '+1555111111',
    id_type: 'passport',
    short_description: 'Test description',
    availability: 'full_time',
    languages: JSON.stringify(['English'])
  };

  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      skillsData,
      {}
    );
    
    const passed = response.statusCode === 201 && response.body.success === true;
    
    printTestResult(
      'Skills array parsing from string',
      passed,
      passed ? 'Successfully parsed comma-separated skills' : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Skills array parsing from string', false, error.message);
    failedTests++;
  }
}

/**
 * Test edge case values
 */
async function testEdgeCaseValues() {
  printSection('EDGE CASE VALUES TESTS');

  // Test extremely long first_name (300 characters)
  try {
    const longName = 'A'.repeat(300);
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: longName,
        last_name: 'Videographer',
        email: randomEmail('long-name'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400 || response.statusCode === 500;
    printTestResult(
      'Extremely long first_name (300 chars)',
      passed,
      passed ? 'System appropriately handled extremely long input' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Extremely long first_name (300 chars)', false, error.message);
    failedTests++;
  }

  // Test empty string values
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: '',
        last_name: 'Videographer',
        email: randomEmail('empty-firstname'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Empty string for first_name',
      passed,
      passed ? 'Correctly rejected empty first_name' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Empty string for first_name', false, error.message);
    failedTests++;
  }

  // Test whitespace-only values
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: '   ',
        last_name: 'Videographer',
        email: randomEmail('whitespace-firstname'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400 || response.statusCode === 201;
    printTestResult(
      'Whitespace-only first_name',
      passed,
      passed ? (response.statusCode === 400 ? 'Correctly rejected whitespace-only first_name' : 'System accepts whitespace-only names') : `Expected 400 or 201, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Whitespace-only first_name', false, error.message);
    failedTests++;
  }

  // Test special characters in names
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: "José-María",
        last_name: "O'Connor",
        email: randomEmail('special-chars'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 201 || response.statusCode === 400;
    printTestResult(
      'Special characters in names (José-María O\'Connor)',
      passed,
      passed ? 'Successfully handled special characters' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Special characters in names (José-María O\'Connor)', false, error.message);
    failedTests++;
  }

  // Test edge case hourly rate values
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Edge',
        last_name: 'Case',
        email: randomEmail('edge-rate'),
        password: 'Videographer123!',
        skills: JSON.stringify(['Skill1']),
        superpowers: JSON.stringify(['Superpower1']),
        country: 'United States',
        city: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        portfolio_links: JSON.stringify(['https://example.com']),
        hourly_rate: 1, // Minimum allowed
        phone_number: '+1555111111',
        id_type: 'passport',
        short_description: 'Test description',
        availability: 'full_time',
        languages: JSON.stringify(['English'])
      },
      {}
    );

    const passed = response.statusCode === 201;
    printTestResult(
      'Edge case hourly rate values (1 to 10000)',
      passed,
      passed ? 'Successfully handled edge case hourly rate values' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Edge case hourly rate values (1 to 10000)', false, error.message);
    failedTests++;
  }

  // Test extremely long profile title
  try {
    const longTitle = 'Professional Videographer with expertise in '.repeat(10);
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Long',
        last_name: 'Title',
        email: randomEmail('long-title'),
        password: 'Videographer123!',
        profile_title: longTitle
      },
      {}
    );

    const passed = response.statusCode === 201 || response.statusCode === 400 || response.statusCode === 500;
    printTestResult(
      'Extremely long profile title',
      passed,
      passed ? 'System handled long profile title appropriately' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Extremely long profile title', false, error.message);
    failedTests++;
  }
}

/**
 * Test invalid file uploads
 */
async function testInvalidFileUpload() {
  printSection('INVALID FILE UPLOAD TESTS');

  const testDir = path.join(__dirname, 'test-files');

  // Test invalid file type for profile picture
  try {
    const invalidFile = path.join(testDir, 'invalid-profile.txt');
    fs.writeFileSync(invalidFile, 'This is not an image file');

    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Invalid',
        last_name: 'File',
        email: randomEmail('invalid-file'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {
        profile_picture: invalidFile
      }
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Invalid file type upload (text file as profile picture)',
      passed,
      passed ? 'Correctly rejected invalid file' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;

    // Cleanup
    fs.unlinkSync(invalidFile);
  } catch (error) {
    printTestResult('Invalid file type upload (text file as profile picture)', false, error.message);
    failedTests++;
  }

  // Test oversized file upload
  try {
    const largeFile = path.join(testDir, 'large-profile.png');
    const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB
    fs.writeFileSync(largeFile, largeBuffer);

    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Large',
        last_name: 'File',
        email: randomEmail('large-file'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {
        profile_picture: largeFile
      }
    );

    const passed = response.statusCode === 400 || response.statusCode === 413;
    printTestResult(
      'Oversized file upload (15MB > 10MB limit)',
      passed,
      passed ? (response.statusCode === 413 ? 'Correctly rejected oversized file (413 Request Entity Too Large)' : 'Correctly rejected oversized file (400 Bad Request)') : `Expected 400 or 413, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;

    // Cleanup large file
    fs.unlinkSync(largeFile);
  } catch (error) {
    printTestResult('Oversized file upload (15MB > 10MB limit)', false, error.message);
    failedTests++;
  }

  // Test corrupted image file
  try {
    const corruptedFile = path.join(testDir, 'corrupted.png');
    const corruptedBuffer = Buffer.from('PNG_HEADER_CORRUPT_DATA_NOT_REAL_IMAGE');
    fs.writeFileSync(corruptedFile, corruptedBuffer);

    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Corrupted',
        last_name: 'File',
        email: randomEmail('corrupted-file'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {
        profile_picture: corruptedFile
      }
    );

    const passed = response.statusCode === 400 || response.statusCode === 201;
    printTestResult(
      'Corrupted image file upload',
      passed,
      passed ? 'Handled corrupted file appropriately' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;

    // Cleanup corrupted file
    fs.unlinkSync(corruptedFile);
  } catch (error) {
    printTestResult('Corrupted image file upload', false, error.message);
    failedTests++;
  }
}

/**
 * Test malicious inputs
 */
async function testMaliciousInputs() {
  printSection('MALICIOUS INPUT TESTS');

  // Test SQL injection attempt
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: "'; DROP TABLE users; --",
        last_name: 'Videographer',
        email: randomEmail('sql-injection'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400 || response.statusCode === 201;
    printTestResult(
      'SQL injection attempt in first_name',
      passed,
      passed ? 'Handled SQL injection attempt appropriately' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('SQL injection attempt in first_name', false, error.message);
    failedTests++;
  }

  // Test XSS attempt
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: '<script>alert("XSS")</script>',
        last_name: 'Videographer',
        email: randomEmail('xss-attempt'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400 || response.statusCode === 201;
    printTestResult(
      'XSS attempt in first_name',
      passed,
      passed ? 'Handled XSS attempt appropriately' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('XSS attempt in first_name', false, error.message);
    failedTests++;
  }

  // Test NoSQL injection attempt
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Test',
        last_name: 'Videographer',
        email: randomEmail('nosql-injection'),
        password: 'Videographer123!',
        profile_title: '{"$ne": null}'
      },
      {}
    );

    const passed = response.statusCode === 400 || response.statusCode === 201;
    printTestResult(
      'NoSQL injection attempt in profile_title',
      passed,
      passed ? 'Handled NoSQL injection attempt appropriately' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('NoSQL injection attempt in profile_title', false, error.message);
    failedTests++;
  }

  // Test JSON injection in skills array
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Test',
        last_name: 'Videographer',
        email: randomEmail('json-injection'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer',
        skills: '["skill1", {"malicious": "payload"}, "skill2"]'
      },
      {}
    );

    const passed = response.statusCode === 400 || response.statusCode === 201;
    printTestResult(
      'JSON injection attempt in skills array',
      passed,
      passed ? 'Handled JSON injection attempt appropriately' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('JSON injection attempt in skills array', false, error.message);
    failedTests++;
  }
}

/**
 * Test boundary conditions
 */
async function testBoundaryConditions() {
  printSection('BOUNDARY CONDITION TESTS');

  // Test minimum password length (6 characters)
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Min',
        last_name: 'Password',
        email: randomEmail('min-password'),
        password: '123456', // Exactly 6 characters
        skills: JSON.stringify(['Skill1']),
        superpowers: JSON.stringify(['Superpower1']),
        country: 'United States',
        city: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        portfolio_links: JSON.stringify(['https://example.com']),
        hourly_rate: 50,
        phone_number: '+1555111111',
        id_type: 'passport',
        short_description: 'Test description',
        availability: 'full_time',
        languages: JSON.stringify(['English'])
      },
      {}
    );

    const passed = response.statusCode === 201;
    printTestResult(
      'Minimum password length (6 characters)',
      passed,
      passed ? 'Accepted minimum valid password' : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Minimum password length (6 characters)', false, error.message);
    failedTests++;
  }

  // Test maximum length email address
  try {
    const timestamp = Date.now();
    const longLocalPart = `longemail${timestamp}`.substring(0, 50); // Reasonable local part length
    const longEmail = `${longLocalPart}@${'domain'.repeat(5)}.com`;
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Long',
        last_name: 'Email',
        email: longEmail,
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400 || response.statusCode === 201 || response.statusCode === 409;
    printTestResult(
      'Maximum length email address',
      passed,
      passed ? (response.statusCode === 409 ? 'Email conflict handled' : 'Handled long email appropriately') : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Maximum length email address', false, error.message);
    failedTests++;
  }

  // Test null values
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: null,
        last_name: 'Videographer',
        email: randomEmail('null-firstname'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer'
      },
      {}
    );

    const passed = response.statusCode === 400;
    printTestResult(
      'Null value for first_name',
      passed,
      passed ? 'Correctly rejected null first_name' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Null value for first_name', false, error.message);
    failedTests++;
  }

  // Test minimum hourly rate boundary
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Boundary',
        last_name: 'Rate',
        email: randomEmail('boundary-rate'),
        password: 'Videographer123!',
        skills: JSON.stringify(['Skill1']),
        superpowers: JSON.stringify(['Superpower1']),
        country: 'United States',
        city: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        portfolio_links: JSON.stringify(['https://example.com']),
        hourly_rate: 1, // Minimum allowed
        phone_number: '+1555111111',
        id_type: 'passport',
        short_description: 'Test description',
        availability: 'full_time',
        languages: JSON.stringify(['English'])
      },
      {}
    );

    const passed = response.statusCode === 201;
    printTestResult(
      'Minimum hourly rate boundary (1)',
      passed,
      passed ? 'Accepted minimum valid hourly rate' : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Minimum hourly rate boundary (1)', false, error.message);
    failedTests++;
  }

  // Test maximum hourly rate boundary
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Max',
        last_name: 'Rate',
        email: randomEmail('max-rate'),
        password: 'Videographer123!',
        skills: JSON.stringify(['Skill1']),
        superpowers: JSON.stringify(['Superpower1']),
        country: 'United States',
        city: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        portfolio_links: JSON.stringify(['https://example.com']),
        hourly_rate: 10000, // Maximum allowed
        phone_number: '+1555111111',
        id_type: 'passport',
        short_description: 'Test description',
        availability: 'full_time',
        languages: JSON.stringify(['English'])
      },
      {}
    );

    const passed = response.statusCode === 201;
    printTestResult(
      'Maximum hourly rate boundary (10000)',
      passed,
      passed ? 'Accepted maximum valid hourly rate' : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Maximum hourly rate boundary (10000)', false, error.message);
    failedTests++;
  }

  // Test invalid JSON in portfolio links
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/videographer`,
      {
        first_name: 'Invalid',
        last_name: 'JSON',
        email: randomEmail('invalid-json'),
        password: 'Videographer123!',
        profile_title: 'Test Videographer',
        portfolio_links: '{"invalid": "json", malformed'
      },
      {}
    );

    const passed = response.statusCode === 400 || response.statusCode === 500;
    printTestResult(
      'Invalid JSON in portfolio_links',
      passed,
      passed ? (response.statusCode === 500 ? 'Server appropriately handled malformed JSON (500)' : 'Handled invalid JSON appropriately (400)') : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Invalid JSON in portfolio_links', false, error.message);
    failedTests++;
  }
}

/**
 * Test login with registered videographer
 */
async function testVideographerLogin(email, password = 'Videographer123!') {
  printSection('VIDEOGRAPHER LOGIN TEST');
  
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: email,
      password: password,
    });
    
    const passed = response.statusCode === 200 && response.body.success === true;
    
    printTestResult(
      'Videographer login after registration',
      passed,
      passed ? 'Login successful' : `Expected 200, got ${response.statusCode}`,
      response.body
    );
    
    if (passed) {
      passedTests++;
      
      // Verify login response structure
      const { data } = response.body;
      const loginStructureValid = (
        data &&
        data.user &&
        data.user.roles &&
        data.user.roles.includes('VIDEOGRAPHER') &&
        data.token
      );
      
      printTestResult(
        'Login response structure',
        loginStructureValid,
        loginStructureValid ? 'Login response has correct structure' : 'Invalid login response structure',
        { roles: data?.user?.roles, hasToken: !!data?.token }
      );
      
      loginStructureValid ? passedTests++ : failedTests++;
    } else {
      failedTests++;
    }
  } catch (error) {
    printTestResult('Videographer login after registration', false, error.message);
    failedTests++;
  }
}

/**
 * Test profile data verification for videographer
 */
async function testVideographerProfileVerification(email, password = 'Videographer123!') {
  printSection('VIDEOGRAPHER PROFILE DATA VERIFICATION TEST');

  try {
    console.log(`🔍 Attempting to login with email: ${email}`);

    // First login to get token
    const loginResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: email,
      password: password
    });

    if (loginResponse.statusCode !== 200 || !loginResponse.body?.success) {
      console.log('❌ Login response:', JSON.stringify(loginResponse, null, 2));
      printTestResult('Profile Verification - Login', false, `Failed to login for profile verification: ${loginResponse.body?.message || 'Unknown error'}`);
      failedTests++;
      return;
    }

    const token = loginResponse.body.data.token;
    const loggedInUser = loginResponse.body.data.user;
    console.log('✅ Login successful');
    console.log('   Logged in user ID:', loggedInUser.user_id, 'Email:', loggedInUser.email);

    // Now fetch profile using /users/me endpoint
    console.log('🔍 Fetching profile with token...');
    const profileResponse = await fetch(`${CONFIG.baseUrl}${CONFIG.apiVersion}/users/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.log('❌ Profile fetch failed with text:', errorText);
        printTestResult('Profile Verification - Fetch Profile', false, `Failed to fetch profile: ${profileResponse.status} ${profileResponse.statusText}`);
        failedTests++;
        return;
    }

    const profileData = await profileResponse.json();
    console.log('✅ Profile fetched successfully');

    // The response structure is { success: true, data: { user, profile, userType } }
    const userData = profileData.data.user;
    const profileInfo = profileData.data.profile;

    // Verify that key user fields are not null
    const requiredUserFields = [
      'user_id', 'first_name', 'last_name', 'email', 'phone_number', 'city', 'country'
    ];

    let nullUserFields = [];
    requiredUserFields.forEach(field => {
      if (userData[field] === null || userData[field] === undefined) {
        nullUserFields.push(field);
      }
    });

    // Verify that key profile fields are not null
    const requiredProfileFields = [
      'profile_title', 'skills', 'hourly_rate', 'portfolio_links', 'short_description'
    ];

    let nullProfileFields = [];
    requiredProfileFields.forEach(field => {
      if (profileInfo[field] === null || profileInfo[field] === undefined) {
        nullProfileFields.push(field);
      }
    });

    const allNullFields = [...nullUserFields.map(f => `user.${f}`), ...nullProfileFields.map(f => `profile.${f}`)];

    if (allNullFields.length > 0) {
      printTestResult('Profile Verification - Data Persistence', false,
        `The following fields are null/undefined: ${allNullFields.join(', ')}`);
      console.log('📋 Profile Data:', JSON.stringify(profileData.data, null, 2));
      failedTests++;
    } else {
      printTestResult('Profile Verification - Data Persistence', true,
        'All profile fields contain data as expected');
      console.log('✅ Profile data verified successfully!');
      console.log('\n📋 ===== COMPLETE USER DATA FROM DATABASE =====');
      console.log('🔹 USER TABLE DATA:');
      Object.keys(userData).forEach(key => {
        console.log(`   ${key}: ${userData[key]}`);
      });
      console.log('\n🔹 FREELANCER PROFILE DATA:');
      Object.keys(profileInfo).forEach(key => {
        if (key !== 'videographer') {
          console.log(`   ${key}: ${typeof profileInfo[key] === 'object' ? JSON.stringify(profileInfo[key]) : profileInfo[key]}`);
        }
      });
      console.log('\n🔹 VIDEOGRAPHER SPECIFIC DATA:');
      if (profileInfo.videographer) {
        Object.keys(profileInfo.videographer).forEach(key => {
          console.log(`   ${key}: ${profileInfo.videographer[key]}`);
        });
      }
      console.log('\n🔹 USER TYPE:', profileData.data.userType);
      console.log('===============================================\n');
      passedTests++;
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error);
    printTestResult('Profile Verification', false, `Unexpected error: ${error.message}`);
    failedTests++;
  }
}

/**
 * Clean up test files
 */
function cleanupTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  if (fs.existsSync(testDir)) {
    const files = fs.readdirSync(testDir);
    files.forEach(file => {
      if (file.includes('videographer')) {
        fs.unlinkSync(path.join(testDir, file));
      }
    });
  }
}

/**
 * Run all videographer registration tests
 */
async function runCompleteVideographerTests() {
  console.log('📹 Starting Complete Videographer Registration Tests...\n');
  
  try {
    // Test complete registration with files
    const registrationData = await testCompleteVideographerRegistration();
    
    // Test minimal registration
    await testMinimalVideographerRegistration();
    
    // Test missing required fields
    await testMissingRequiredFields();

    // Test invalid field formats
    await testInvalidFieldFormats();

    // Test edge case values
    await testEdgeCaseValues();
    
    // Test duplicate email (if we have successful registration)
    if (registrationData && registrationData.user) {
      await testDuplicateEmailRegistration(registrationData.user.email);
      
      // Test login with registered user
      await testVideographerLogin(registrationData.user.email);

      // Test profile fetching to verify data persistence
      await testVideographerProfileVerification(registrationData.user.email);
    }
    
    // Test skills array parsing
    await testSkillsArrayParsing();

    // Test invalid file uploads
    await testInvalidFileUpload();

    // Test malicious inputs
    await testMaliciousInputs();

    // Test boundary conditions
    await testBoundaryConditions();
    
    // Print summary
    printSummary(passedTests, failedTests);
    
    // Cleanup
    cleanupTestFiles();
    
    return { passedTests, failedTests };
  } catch (error) {
    console.error('Test execution failed:', error);
    cleanupTestFiles();
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runCompleteVideographerTests().catch(error => {
    console.error('Test execution failed:', error);
    cleanupTestFiles();
    process.exit(1);
  });
}

module.exports = { runCompleteVideographerTests };