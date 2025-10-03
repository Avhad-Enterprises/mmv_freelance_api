#!/usr/bin/env node

/**
 * Test Client Registration with Business Document
 */

const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Create test files
 */
function createTestFiles() {
  // Create a simple PDF
  const pdfContent = `%PDF-1.4
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
72 720 Td
(Test Business Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
295
%%EOF`;

  const pdfFile = '/tmp/test-business-doc.pdf';
  fs.writeFileSync(pdfFile, pdfContent);
  
  // Create PNG
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5c, 0xdd, 0xdb, 0x8d, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  
  const profileFile = '/tmp/test-profile.png';
  fs.writeFileSync(profileFile, pngBuffer);
  
  return { pdfFile, profileFile };
}

/**
 * Test client registration with business document
 */
async function testClientRegistration() {
  console.log('🏢 Testing Client Registration with Business Document...\n');
  
  try {
    const { pdfFile, profileFile } = createTestFiles();
    console.log(`📁 Created test files: PDF (${fs.statSync(pdfFile).size} bytes), PNG (${fs.statSync(profileFile).size} bytes)`);
    
    const formData = new FormData();
    formData.append('first_name', 'TestClient');
    formData.append('last_name', 'Company');
    formData.append('email', `testclient${Date.now()}@company.com`);
    formData.append('password', 'test123456');
    formData.append('company_name', 'Test Company LLC');
    formData.append('phone_number', '+1234567890');
    formData.append('city', 'New York');
    formData.append('state', 'NY');
    formData.append('country', 'USA');
    
    // Add files with correct field names
    formData.append('profile_picture', fs.createReadStream(profileFile), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    
    formData.append('business_document', fs.createReadStream(pdfFile), {
      filename: 'business-license.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('📤 Sending client registration request...');
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/register/client`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Test Client Registration)'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Client registration successful!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    // Clean up
    fs.unlinkSync(pdfFile);
    fs.unlinkSync(profileFile);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Client registration failed:');
    
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
 * Test with alternative field name (business_documents)
 */
async function testClientRegistrationAltField() {
  console.log('🏢 Testing Client Registration with Alternative Field Name...\n');
  
  try {
    const { pdfFile, profileFile } = createTestFiles();
    
    const formData = new FormData();
    formData.append('first_name', 'TestClientAlt');
    formData.append('last_name', 'Company');
    formData.append('email', `testclientalt${Date.now()}@company.com`);
    formData.append('password', 'test123456');
    formData.append('company_name', 'Test Company Alt LLC');
    
    // Use alternative field name
    formData.append('business_documents', fs.createReadStream(pdfFile), {
      filename: 'business-license-alt.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('📤 Sending client registration request with alternative field name...');
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/register/client`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Client registration with alternative field successful!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    // Clean up
    fs.unlinkSync(pdfFile);
    fs.unlinkSync(profileFile);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Client registration with alternative field failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    throw error;
  }
}

// Run tests
if (require.main === module) {
  (async () => {
    try {
      await testClientRegistration();
      console.log('\n' + '-'.repeat(50) + '\n');
      await testClientRegistrationAltField();
      console.log('\n🎉 All client registration tests passed!');
    } catch (error) {
      console.error('\n❌ Client registration tests failed');
      process.exit(1);
    }
  })();
}

module.exports = { testClientRegistration, testClientRegistrationAltField };