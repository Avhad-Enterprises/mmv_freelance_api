#!/usr/bin/env node

/**
 * Credits Purchase API Test
 * Tests the POST /credits/purchase endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  authHeader
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get videographer token
 */
async function loginAsVideographer() {
  try {
    // First, create a test videographer user for this test
    console.log('Creating test videographer user for credits testing...');
    
    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');
    
    // Create test files
    const testDir = path.join(__dirname, '..', 'auth', 'test-files');
    const imagePath = path.join(testDir, 'test-profile.png');
    const pdfPath = path.join(testDir, 'test-id.pdf');
    
    // Ensure test files exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    if (!fs.existsSync(imagePath)) {
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
        0x73, 0x74, 0x72, 0x65, 0x61, 0x6D, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62,
        0x6A, 0x0A, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x35, 0x0A, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35,
        0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x30, 0x31, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20,
        0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x32,
        0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x33, 0x30, 0x20, 0x30, 0x30,
        0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x30, 0x34, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20,
        0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x35,
        0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A, 0x78,
        0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x35, 0x0A, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35,
        0x20, 0x66, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x31, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x32, 0x30, 0x20, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x33, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x20, 0x6E, 0x20, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x34, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x35, 0x30, 0x20, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x20, 0x0A, 0x74, 0x72, 0x61, 0x69,
        0x6C, 0x65, 0x72, 0x0A, 0x3C, 0x3C, 0x0A, 0x2F, 0x53, 0x69, 0x7A, 0x65,
        0x20, 0x35, 0x0A, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x31, 0x20, 0x30,
        0x20, 0x52, 0x0A, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78,
        0x72, 0x65, 0x66, 0x0A, 0x36, 0x30, 0x30, 0x0A, 0x25, 0x25, 0x45, 0x4F,
        0x46
      ]);
      fs.writeFileSync(pdfPath, pdfContent);
    }
    
    // Create test videographer user
    const testEmail = `credits-test-videographer-${Date.now()}@test.com`;
    
    const formData = new FormData();
    const videographerData = {
      first_name: 'Credits',
      last_name: 'Test',
      email: testEmail,
      password: 'Password123!',
      skill_tags: JSON.stringify(['cinematography']),
      superpowers: JSON.stringify(['editing']),
      country: 'United States',
      city: 'Los Angeles',
      portfolio_links: JSON.stringify(['https://portfolio.com']),
      phone_number: '+1-555-0123',
      id_type: 'passport',
      short_description: 'Credits test videographer',
      languages: JSON.stringify(['English']),
      terms_accepted: true,
      privacy_policy_accepted: true
    };

    Object.keys(videographerData).forEach(key => {
      const value = videographerData[key];
      formData.append(key, typeof value === 'boolean' ? value.toString() : value);
    });

    formData.append('profile_photo', fs.createReadStream(imagePath), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    formData.append('id_document', fs.createReadStream(pdfPath), {
      filename: 'id_doc.pdf',
      contentType: 'application/pdf'
    });

    const registerResponse = await makeRequest(
      'POST',
      `${CONFIG.apiVersion}/auth/register/videographer`,
      null,
      formData
    );

    if (registerResponse.statusCode === 201 && registerResponse.body?.success) {
      console.log('✅ Test videographer user created successfully');
      
      // Now login with the created user
      const loginResponse = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
        email: testEmail,
        password: 'Password123!'
      });

      if (loginResponse.statusCode === 200 && loginResponse.body?.data?.token) {
        storeToken('videographer', loginResponse.body.data.token);
        printTestResult('Videographer login', true, `SUCCESS with ${testEmail}`, null);
        return true;
      } else {
        console.log(`Login failed after registration: ${loginResponse.statusCode}`);
        printTestResult('Videographer login', false, `Login failed after creating user`, loginResponse);
        return false;
      }
    } else {
      console.log(`Registration failed: ${registerResponse.statusCode}`);
      printTestResult('Videographer login', false, `Failed to create test user`, registerResponse);
      return false;
    }
  } catch (error) {
    printTestResult('Videographer login', false, `Request failed: ${error.message}`, null);
    return false;
  }
}

/**
 * Test Purchase Credits
 */
async function testPurchaseCredits() {
  printSection('Testing Purchase Credits');

  // Test 1: Purchase credits without auth
  console.log('Test 1: Purchase credits without authentication');
  console.log('📤 Request: POST /credits/purchase');
  console.log('🔑 Auth: None');

  const response1 = await makeRequest('POST', `${CONFIG.apiVersion}/credits/purchase`, {
    credits_amount: 10
  });

  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Purchase credits without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Purchase credits with missing credits_amount
  console.log('\nTest 2: Purchase credits with missing credits_amount');
  console.log('📤 Request: POST /credits/purchase');
  console.log('🔑 Auth: Bearer token (videographer)');

  const response2 = await makeRequest('POST', `${CONFIG.apiVersion}/credits/purchase`, {}, authHeader('videographer'));

  console.log('📥 Response Status:', response2.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

  const test2Passed = response2.statusCode === 400;
  printTestResult('Purchase credits missing amount', test2Passed, `Status: ${response2.statusCode}, Expected: 400`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Purchase credits with invalid amount (negative)
  console.log('\nTest 3: Purchase credits with negative amount');
  console.log('📤 Request: POST /credits/purchase');
  console.log('🔑 Auth: Bearer token (videographer)');

  const response3 = await makeRequest('POST', `${CONFIG.apiVersion}/credits/purchase`, {
    credits_amount: -5
  }, authHeader('videographer'));

  console.log('📥 Response Status:', response3.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response3.body, null, 2));

  const test3Passed = response3.statusCode === 400;
  printTestResult('Purchase credits negative amount', test3Passed, `Status: ${response3.statusCode}, Expected: 400`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Purchase credits with invalid amount (zero)
  console.log('\nTest 4: Purchase credits with zero amount');
  console.log('📤 Request: POST /credits/purchase');
  console.log('🔑 Auth: Bearer token (videographer)');

  const response4 = await makeRequest('POST', `${CONFIG.apiVersion}/credits/purchase`, {
    credits_amount: 0
  }, authHeader('videographer'));

  console.log('📥 Response Status:', response4.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response4.body, null, 2));

  const test4Passed = response4.statusCode === 400;
  printTestResult('Purchase credits zero amount', test4Passed, `Status: ${response4.statusCode}, Expected: 400`, response4);
  if (test4Passed) passedTests++; else failedTests++;

  // Test 5: Purchase credits successfully
  console.log('\nTest 5: Purchase credits successfully');
  console.log('📤 Request: POST /credits/purchase');
  console.log('🔑 Auth: Bearer token (videographer)');

  const response5 = await makeRequest('POST', `${CONFIG.apiVersion}/credits/purchase`, {
    credits_amount: 25,
    payment_reference: 'TEST-PAYMENT-REF-001'
  }, authHeader('videographer'));

  console.log('📥 Response Status:', response5.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response5.body, null, 2));

  const test5Passed = response5.statusCode === 200 && response5.body?.success === true;
  printTestResult('Purchase credits success', test5Passed, `Status: ${response5.statusCode}, Expected: 200`, response5);
  if (test5Passed) passedTests++; else failedTests++;

  // Test 6: Verify response structure
  if (test5Passed && response5.body?.data) {
    console.log('\nTest 6: Verify purchase response structure');
    const data = response5.body.data;
    const hasRequiredFields = data.hasOwnProperty('credits_balance') &&
                             data.hasOwnProperty('total_credits_purchased');

    const areNumbers = typeof data.credits_balance === 'number' &&
                      typeof data.total_credits_purchased === 'number';

    const test6Passed = hasRequiredFields && areNumbers;
    printTestResult('Verify purchase response structure', test6Passed,
      `Has required fields: ${hasRequiredFields}, All numbers: ${areNumbers}`,
      { data });
    if (test6Passed) passedTests++; else failedTests++;
  }

  // Test 7: Purchase more credits and verify accumulation
  console.log('\nTest 7: Purchase additional credits and verify accumulation');
  console.log('📤 Request: POST /credits/purchase');
  console.log('🔑 Auth: Bearer token (videographer)');

  const response7 = await makeRequest('POST', `${CONFIG.apiVersion}/credits/purchase`, {
    credits_amount: 15,
    payment_reference: 'TEST-PAYMENT-REF-002'
  }, authHeader('videographer'));

  console.log('📥 Response Status:', response7.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response7.body, null, 2));

  const test7Passed = response7.statusCode === 200 && response7.body?.success === true;
  printTestResult('Purchase additional credits', test7Passed, `Status: ${response7.statusCode}, Expected: 200`, response7);
  if (test7Passed) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('💰 CREDITS PURCHASE API TESTS');
  console.log('=============================\n');

  // Login first
  const loginSuccess = await loginAsVideographer();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without videographer authentication');
    process.exit(1);
  }

  // Run tests
  await testPurchaseCredits();

  // Print summary
  printSummary(passedTests, failedTests, passedTests + failedTests);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };