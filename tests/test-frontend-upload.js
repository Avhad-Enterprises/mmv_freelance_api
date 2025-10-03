#!/usr/bin/env node

/**
 * Test Registration Upload with Real File
 * This script tests the exact same upload path as the frontend
 */

const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Create a proper PNG file for testing
 */
function createTestPNG() {
  // Create a simple 1x1 pixel PNG
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5c, 0xdd, 0xdb, 0x8d, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  
  const testFile = '/tmp/test-profile.png';
  fs.writeFileSync(testFile, pngBuffer);
  return testFile;
}

/**
 * Test video editor registration with file upload
 */
async function testRegistrationWithFile() {
  console.log('🧪 Testing Video Editor Registration with File Upload...\n');
  
  try {
    // Create test PNG file
    const testFile = createTestPNG();
    console.log(`📁 Created test file: ${testFile}`);
    
    // Create form data (similar to frontend)
    const formData = new FormData();
    formData.append('first_name', 'TestFrontend');
    formData.append('last_name', 'User');
    formData.append('email', `testfrontend${Date.now()}@gmail.com`);
    formData.append('password', 'test123456');
    formData.append('profile_title', 'Senior Video Editor');
    formData.append('experience_level', 'expert');
    formData.append('hourly_rate', '75');
    formData.append('skills', 'Adobe Premiere Pro,After Effects,DaVinci Resolve');
    
    // Append file (this is how browsers send files)
    formData.append('profile_picture', fs.createReadStream(testFile), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Sending registration request...');
    
    // Make request
    const response = await axios.post(
      `${API_BASE_URL}/auth/register/videoeditor`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    console.log('✅ Registration successful!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    // Clean up
    fs.unlinkSync(testFile);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Registration failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
    
    throw error;
  }
}

/**
 * Test multiple registrations to check for consistency
 */
async function testMultipleRegistrations() {
  console.log('🔄 Testing multiple registrations for consistency...\n');
  
  const results = [];
  
  for (let i = 0; i < 3; i++) {
    console.log(`\n--- Test ${i + 1}/3 ---`);
    try {
      const result = await testRegistrationWithFile();
      results.push({ success: true, data: result });
      console.log(`✅ Test ${i + 1} passed`);
    } catch (error) {
      results.push({ success: false, error: error.message });
      console.log(`❌ Test ${i + 1} failed`);
    }
    
    // Wait 2 seconds between tests
    if (i < 2) {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/3`);
  console.log(`❌ Failed: ${3 - successful}/3`);
  
  if (successful === 3) {
    console.log('🎉 All tests passed! Upload is working consistently.');
  } else {
    console.log('⚠️  Some tests failed. Issue may be intermittent.');
  }
  
  return results;
}

// Run tests
if (require.main === module) {
  testMultipleRegistrations().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testRegistrationWithFile, testMultipleRegistrations };