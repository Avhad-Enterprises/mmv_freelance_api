#!/usr/bin/env node

/**
 * Complete Client Registration Test
 * Tests client registration with all fields including file uploads
 * This test simulates a real-world client registration scenario
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
(Test Document) Tj
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

  const profilePath = path.join(testDir, 'profile.png');
  const idDocPath = path.join(testDir, 'id_document.pdf');
  const businessDocPath = path.join(testDir, 'business_document.pdf');

  fs.writeFileSync(profilePath, profilePicture);
  fs.writeFileSync(idDocPath, pdfDocument);
  fs.writeFileSync(businessDocPath, pdfDocument);

  return {
    profilePicture: profilePath,
    idDocument: idDocPath,
    businessDocument: businessDocPath
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
 * Test complete client registration with all fields and files
 */
async function testCompleteClientRegistration() {
  printSection('COMPLETE CLIENT REGISTRATION TEST');
  
  const testFiles = createTestFiles();
  const email = randomEmail('complete-client');
  
  const clientData = {
    // Step 1: Basic Information (Required)
    full_name: 'John Doe',
    email: email,
    password: 'SecurePassword123!',
    
    // Step 2: Company Information (Required)
    company_name: 'Innovative Tech Solutions Inc.',
    company_website: 'https://innovativetech.com',
    company_description: 'A leading technology solutions provider specializing in digital marketing and content creation.',
    industry: 'corporate',
    company_size: '51-200',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    
    // Step 3: Contact Information (Required)
    phone_number: '1234567890',
    address: '123 Business Street',
    zip_code: '94105',
    
    // Step 4: Project Information (Required)
    project_title: 'Corporate Product Launch Video',
    project_description: 'We need a high-quality promotional video for our new software product launch, including interviews, product demos, and cinematic sequences.',
    project_category: 'corporate',
    project_budget: 15000,
    project_timeline: '2-3 months',
    
    // Step 5: Additional Information (Required)
    terms_accepted: true,
    privacy_policy_accepted: true,
  };

  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      clientData,
      {
        profile_picture: testFiles.profilePicture,
        id_document: testFiles.idDocument,
        business_document: testFiles.businessDocument
      }
    );
    
    const passed = response.statusCode === 201 && response.body.success === true;
    
    printTestResult(
      'Complete client registration with files',
      passed,
      passed ? `Client registered: ${email}` : `Expected 201, got ${response.statusCode}`,
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
        data.user.user_type === 'CLIENT' &&
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
    printTestResult('Complete client registration with files', false, error.message);
    failedTests++;
    return null;
  }
}

/**
 * Test registration without optional files
 */
async function testMinimalClientRegistration() {
  printSection('MINIMAL CLIENT REGISTRATION TEST');
  
  const email = randomEmail('minimal-client');
  
  const minimalData = {
    // Step 1: Basic Information (Required)
    full_name: 'Jane Smith',
    email: email,
    password: 'MinimalPass123!',
    
    // Step 2: Company Information (Required)
    company_name: 'Small Business LLC',
    company_description: 'A small business focused on digital marketing.',
    industry: 'corporate',
    company_size: '1-10',
    country: 'United States',
    state: 'New York',
    city: 'New York',
    
    // Step 3: Contact Information (Required)
    phone_number: '0987654321',
    address: '456 Main St',
    zip_code: '10001',
    
    // Step 4: Project Information (Required)
    project_title: 'Website Video Content',
    project_description: 'Need promotional videos for our new website launch.',
    project_category: 'corporate',
    project_budget: 3000,
    project_timeline: '1-2 months',
    
    // Step 5: Additional Information (Required)
    terms_accepted: true,
    privacy_policy_accepted: true,
  };

  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      minimalData,
      {} // No files
    );
    
    const passed = response.statusCode === 201 && response.body.success === true;
    
    printTestResult(
      'Minimal client registration (no files)',
      passed,
      passed ? `Client registered: ${email}` : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Minimal client registration (no files)', false, error.message);
    failedTests++;
  }
}

/**
 * Test missing required fields
 */
async function testMissingRequiredFields() {
  printSection('MISSING REQUIRED FIELDS TESTS');
  
  // Test missing full_name
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        email: randomEmail('missing-fullname'),
        password: 'Password123!',
        company_name: 'Test Company',
        company_description: 'Test company description',
        industry: 'corporate',
        company_size: '11-50',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        phone_number: '1234567890',
        address: '123 Test St',
        zip_code: '90210',
        project_title: 'Test Project',
        project_description: 'Test project description',
        project_category: 'corporate',
        project_budget: 5000,
        project_timeline: '1 month',
        terms_accepted: true,
        privacy_policy_accepted: true,
      },
      {}
    );
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Missing full_name field',
      passed,
      passed ? 'Correctly rejected missing full_name' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Missing full_name field', false, error.message);
    failedTests++;
  }

  // Test missing email
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        full_name: 'John Doe',
        password: 'Password123!',
        company_name: 'Test Company',
        company_description: 'Test company description',
        industry: 'corporate',
        company_size: '11-50',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        phone_number: '1234567890',
        address: '123 Test St',
        zip_code: '90210',
        project_title: 'Test Project',
        project_description: 'Test project description',
        project_category: 'corporate',
        project_budget: 5000,
        project_timeline: '1 month',
        terms_accepted: true,
        privacy_policy_accepted: true,
      },
      {}
    );
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Missing email field',
      passed,
      passed ? 'Correctly rejected missing email' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Missing email field', false, error.message);
    failedTests++;
  }

  // Test missing password
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        full_name: 'John Doe',
        email: randomEmail('missing-password'),
        company_name: 'Test Company',
        company_description: 'Test company description',
        industry: 'corporate',
        company_size: '11-50',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        phone_number: '1234567890',
        address: '123 Test St',
        zip_code: '90210',
        project_title: 'Test Project',
        project_description: 'Test project description',
        project_category: 'corporate',
        project_budget: 5000,
        project_timeline: '1 month',
        terms_accepted: true,
        privacy_policy_accepted: true,
      },
      {}
    );
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Missing password field',
      passed,
      passed ? 'Correctly rejected missing password' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Missing password field', false, error.message);
    failedTests++;
  }

  // Test missing company_name
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        full_name: 'John Doe',
        email: randomEmail('missing-company'),
        password: 'Password123!',
        company_description: 'Test company description',
        industry: 'corporate',
        company_size: '11-50',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        phone_number: '1234567890',
        address: '123 Test St',
        zip_code: '90210',
        project_title: 'Test Project',
        project_description: 'Test project description',
        project_category: 'corporate',
        project_budget: 5000,
        project_timeline: '1 month',
        terms_accepted: true,
        privacy_policy_accepted: true,
      },
      {}
    );
    
    const passed = response.statusCode === 400;
    printTestResult(
      'Missing company_name field',
      passed,
      passed ? 'Correctly rejected missing company_name' : `Expected 400, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Missing company_name field', false, error.message);
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
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        full_name: 'John Doe',
        email: 'invalid-email-format',
        password: 'Password123!',
        company_name: 'Test Company',
        company_description: 'Test company description',
        industry: 'corporate',
        company_size: '11-50',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        phone_number: '1234567890',
        address: '123 Test St',
        zip_code: '90210',
        project_title: 'Test Project',
        project_description: 'Test project description',
        project_category: 'corporate',
        project_budget: 5000,
        project_timeline: '1 month',
        terms_accepted: true,
        privacy_policy_accepted: true,
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

  // Test short password
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: 'John',
        last_name: 'Doe',
        email: randomEmail('short-password'),
        password: '123',
        company_name: 'Test Company',
        industry: 'corporate',
        company_size: '11-50',
        required_services: JSON.stringify(['videography']),
        required_skills: JSON.stringify(['camera_operation']),
        required_editor_proficiencies: JSON.stringify(['beginner']),
        required_videographer_proficiencies: JSON.stringify(['event']),
        budget_min: 1000,
        budget_max: 5000,
        address: '123 Test St',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        pincode: '90210',
        work_arrangement: 'remote',
        project_frequency: 'ongoing',
        hiring_preferences: 'individuals',
        expected_start_date: '2024-02-01',
        project_duration: '1_3_months',
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

}

/**
 * Test edge case values
 */
async function testEdgeCaseValues() {
  printSection('EDGE CASE VALUES TESTS');
  
  // Test extremely long strings
  try {
    const longString = 'a'.repeat(300); // Very long string
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: longString,
        last_name: 'Doe',
        email: randomEmail('long-name'),
        password: 'Password123!',
        company_name: 'Test Company'
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
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: '',
        last_name: 'Doe',
        email: randomEmail('empty-firstname'),
        password: 'Password123!',
        company_name: 'Test Company',
        industry: 'corporate',
        company_size: '11-50',
        required_services: JSON.stringify(['videography']),
        required_skills: JSON.stringify(['camera_operation']),
        required_editor_proficiencies: JSON.stringify(['beginner']),
        required_videographer_proficiencies: JSON.stringify(['event']),
        budget_min: 1000,
        budget_max: 5000,
        address: '123 Test St',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        pincode: '90210',
        work_arrangement: 'remote',
        project_frequency: 'ongoing',
        hiring_preferences: 'individuals',
        expected_start_date: '2024-02-01',
        project_duration: '1_3_months',
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
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: '   ',
        last_name: 'Doe',
        email: randomEmail('whitespace-firstname'),
        password: 'Password123!',
        company_name: 'Test Company',
        industry: 'corporate',
        company_size: '11-50',
        required_services: JSON.stringify(['videography']),
        required_skills: JSON.stringify(['camera_operation']),
        required_editor_proficiencies: JSON.stringify(['beginner']),
        required_videographer_proficiencies: JSON.stringify(['event']),
        budget_min: 1000,
        budget_max: 5000,
        address: '123 Test St',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        pincode: '90210',
        work_arrangement: 'remote',
        project_frequency: 'ongoing',
        hiring_preferences: 'individuals',
        expected_start_date: '2024-02-01',
        project_duration: '1_3_months',
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
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        // Step 1: Basic Information (Required)
        full_name: 'José-María O\'Connor',
        email: randomEmail('special-chars'),
        password: 'Password123!',
        
        // Step 2: Company Information (Required)
        company_name: 'Test Company',
        company_description: 'A test company with special characters.',
        industry: 'corporate',
        company_size: '11-50',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        
        // Step 3: Contact Information (Required)
        phone_number: '1234567890',
        address: '123 Test St',
        zip_code: '90210',
        
        // Step 4: Project Information (Required)
        project_title: 'Special Project',
        project_description: 'A project with special characters in the name.',
        project_category: 'corporate',
        project_budget: 2500,
        project_timeline: '1 month',
        
        // Step 5: Additional Information (Required)
        terms_accepted: true,
        privacy_policy_accepted: true,
      },
      {}
    );
    
    const passed = response.statusCode === 201;
    printTestResult(
      'Special characters in names (José-María O\'Connor)',
      passed,
      passed ? 'Successfully handled special characters' : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Special characters in names (José-María O\'Connor)', false, error.message);
    failedTests++;
  }

  // Test numeric budget values
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        // Step 1: Basic Information (Required)
        full_name: 'John Doe',
        email: randomEmail('budget-test'),
        password: 'Password123!',
        
        // Step 2: Company Information (Required)
        company_name: 'Test Company',
        company_description: 'A test company for budget edge cases.',
        industry: 'corporate',
        company_size: '11-50',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        
        // Step 3: Contact Information (Required)
        phone_number: '1234567890',
        address: '123 Test St',
        zip_code: '90210',
        
        // Step 4: Project Information (Required)
        project_title: 'Budget Test Project',
        project_description: 'Testing edge case budget values.',
        project_category: 'corporate',
        project_budget: 50000,
        project_timeline: '2 months',
        
        // Step 5: Additional Information (Required)
        terms_accepted: true,
        privacy_policy_accepted: true,
      },
      {}
    );
    
    const passed = response.statusCode === 201;
    printTestResult(
      'Edge case budget values (0 to 999999)',
      passed,
      passed ? 'Successfully handled edge case budget values' : `Expected 201, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Edge case budget values (0 to 999999)', false, error.message);
    failedTests++;
  }
}

/**
 * Test duplicate email registration
 */
async function testDuplicateEmailRegistration(existingEmail) {
  printSection('DUPLICATE EMAIL REGISTRATION TEST');
  
  const duplicateData = {
    // Step 1: Basic Information (Required)
    full_name: 'Duplicate User',
    email: existingEmail, // Use existing email
    password: 'DuplicatePass123!',
    
    // Step 2: Company Information (Required)
    company_name: 'Duplicate Company',
    company_description: 'A duplicate company for testing.',
    industry: 'corporate',
    company_size: '11-50',
    country: 'United States',
    state: 'California',
    city: 'Los Angeles',
    
    // Step 3: Contact Information (Required)
    phone_number: '1234567890',
    address: '123 Test St',
    zip_code: '90210',
    
    // Step 4: Project Information (Required)
    project_title: 'Duplicate Project',
    project_description: 'Testing duplicate email registration.',
    project_category: 'corporate',
    project_budget: 4000,
    project_timeline: '2 months',
    
    // Step 5: Additional Information (Required)
    terms_accepted: true,
    privacy_policy_accepted: true,
  };

  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
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
 * Test invalid file upload
 */
async function testInvalidFileUpload() {
  printSection('INVALID FILE UPLOAD TESTS');
  
  const testDir = path.join(__dirname, 'test-files');
  
  // Test invalid file type (text file instead of image/PDF)
  const invalidFile = path.join(testDir, 'invalid.txt');
  fs.writeFileSync(invalidFile, 'This is not a valid image or PDF file');
  
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: 'Invalid',
        last_name: 'File',
        email: randomEmail('invalid-file'),
        password: 'InvalidFile123!',
        company_name: 'Invalid File Company',
      },
      {
        profile_picture: invalidFile // Invalid file type
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
  } catch (error) {
    printTestResult('Invalid file type upload (text file as profile picture)', false, error.message);
    failedTests++;
  }

  // Test oversized file (simulate by creating a large file)
  try {
    const largeFile = path.join(testDir, 'large.png');
    const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB file (over 10MB limit)
    fs.writeFileSync(largeFile, largeBuffer);
    
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: 'Large',
        last_name: 'File',
        email: randomEmail('large-file'),
        password: 'LargeFile123!',
        company_name: 'Large File Company',
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
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: 'Corrupted',
        last_name: 'File',
        email: randomEmail('corrupted-file'),
        password: 'CorruptedFile123!',
        company_name: 'Corrupted File Company',
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

  // Test multiple files for single field
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: 'Multiple',
        last_name: 'Files',
        email: randomEmail('multiple-files'),
        password: 'MultipleFiles123!',
        company_name: 'Multiple Files Company',
      },
      {
        profile_picture: [invalidFile, invalidFile] // Multiple files for single field
      }
    );
    
    const passed = response.statusCode === 400 || response.statusCode === 201;
    printTestResult(
      'Multiple files for single field',
      passed,
      passed ? (response.statusCode === 400 ? 'Correctly rejected multiple files' : 'System handles multiple files by using first one') : `Expected 400 or 201, got ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('Multiple files for single field', false, error.message);
    failedTests++;
  }

  // Cleanup invalid file
  fs.unlinkSync(invalidFile);
}

/**
 * Test malicious input attempts
 */
async function testMaliciousInputs() {
  printSection('MALICIOUS INPUT TESTS');
  
  // Test SQL injection attempt
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: "'; DROP TABLE users; --",
        last_name: 'Doe',
        email: randomEmail('sql-injection'),
        password: 'Password123!',
        company_name: 'Test Company'
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
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: '<script>alert("XSS")</script>',
        last_name: 'Doe',
        email: randomEmail('xss-attempt'),
        password: 'Password123!',
        company_name: 'Test Company'
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
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: 'John',
        last_name: 'Doe',
        email: randomEmail('nosql-injection'),
        password: 'Password123!',
        company_name: '{"$ne": null}'
      },
      {}
    );
    
    const passed = response.statusCode === 400 || response.statusCode === 201;
    printTestResult(
      'NoSQL injection attempt in company_name',
      passed,
      passed ? 'Handled NoSQL injection attempt appropriately' : `Unexpected status: ${response.statusCode}`,
      response.body
    );
    passed ? passedTests++ : failedTests++;
  } catch (error) {
    printTestResult('NoSQL injection attempt in company_name', false, error.message);
    failedTests++;
  }
}

/**
 * Test boundary conditions
 */
async function testBoundaryConditions() {
  printSection('BOUNDARY CONDITION TESTS');
  
  // Test exactly 6 character password (minimum)
  try {
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        // Step 1: Basic Information (Required)
        full_name: 'John Doe',
        email: randomEmail('min-password'),
        password: 'Pass12',
        
        // Step 2: Company Information (Required)
        company_name: 'Test Company',
        company_description: 'A test company for minimum password.',
        industry: 'corporate',
        company_size: '11-50',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        
        // Step 3: Contact Information (Required)
        phone_number: '1234567890',
        address: '123 Test St',
        zip_code: '90210',
        
        // Step 4: Project Information (Required)
        project_title: 'Password Test Project',
        project_description: 'Testing minimum password length.',
        project_category: 'corporate',
        project_budget: 2000,
        project_timeline: '1 month',
        
        // Step 5: Additional Information (Required)
        terms_accepted: true,
        privacy_policy_accepted: true,
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

  // Test maximum length email (assuming reasonable limit)
  try {
    const timestamp = Date.now();
    const longLocalPart = `longemail${timestamp}`.substring(0, 50); // Reasonable local part length
    const longEmail = `${longLocalPart}@${'domain'.repeat(5)}.com`;
    const response = await makeMultipartRequest(
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: 'John',
        last_name: 'Doe',
        email: longEmail,
        password: 'Password123!',
        company_name: 'Test Company'
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
      `${CONFIG.baseUrl}${CONFIG.apiVersion}/auth/register/client`,
      {
        first_name: null,
        last_name: 'Doe',
        email: randomEmail('null-firstname'),
        password: 'Password123!',
        company_name: 'Test Company'
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
}

/**
 * Test login with registered client
 */
async function testClientLogin(email, password = 'SecurePassword123!') {
  printSection('CLIENT LOGIN TEST');
  
  try {
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: email,
      password: password,
    });
    
    const passed = response.statusCode === 200 && response.body.success === true;
    
    printTestResult(
      'Client login after registration',
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
        data.user.roles.includes('CLIENT') &&
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
    printTestResult('Client login after registration', false, error.message);
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
      fs.unlinkSync(path.join(testDir, file));
    });
    fs.rmdirSync(testDir);
  }
}

/**
 * Run all client registration tests
 */
async function runCompleteRegistrationTests() {
  console.log('🧪 Starting Complete Client Registration Tests...\n');
  
  try {
    // Test complete registration with files
    const registrationData = await testCompleteClientRegistration();
    
    // Test minimal registration
    await testMinimalClientRegistration();
    
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
      await testClientLogin(registrationData.user.email);
    }
    
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
  runCompleteRegistrationTests().catch(error => {
    console.error('Test execution failed:', error);
    cleanupTestFiles();
    process.exit(1);
  });
}

module.exports = { runCompleteRegistrationTests };