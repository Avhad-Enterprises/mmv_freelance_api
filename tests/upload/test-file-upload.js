// File Upload Test - Test registration with file uploads
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { makeRequest, processApiResponse, randomEmail } = require('./test-utils');

// Create a mock image file for testing
function createMockImageBuffer() {
  // Create a minimal PNG file buffer
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const pngEnd = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  return Buffer.concat([pngHeader, Buffer.alloc(100), pngEnd]);
}

// Create a mock PDF file for testing
function createMockPdfBuffer() {
  return Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n%%EOF');
}

async function testFileUploadRegistration() {
  console.log('\n🔥 Testing File Upload Registration');
  console.log('=' .repeat(50));

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Client registration with files
  totalTests++;
  try {
    const formData = new FormData();
    
    // Add form fields
    formData.append('first_name', 'Upload');
    formData.append('last_name', 'Client');
    formData.append('email', randomEmail('upload-client'));
    formData.append('password', 'Test123!');
    formData.append('phone_number', '+1234567890');
    formData.append('city', 'Test City');
    formData.append('country', 'Test Country');
    formData.append('company_name', 'Upload Test Inc');
    formData.append('industry', 'film');
    formData.append('budget_min', '5000');
    formData.append('budget_max', '10000');
    
    // Add file attachments
    formData.append('profile_picture', createMockImageBuffer(), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    formData.append('id_document', createMockImageBuffer(), {
      filename: 'id.png',
      contentType: 'image/png'
    });
    formData.append('business_document', createMockPdfBuffer(), {
      filename: 'business.pdf',
      contentType: 'application/pdf'
    });

    const response = await makeRequest('POST', '/api/v1/auth/register/client', null, formData);
    const result = processApiResponse(response);
    
    if (result.success && result.data.user && result.data.token) {
      console.log('✓ Client registration with file uploads');
      passedTests++;
    } else {
      console.log('✗ Client registration with file uploads failed');
      console.log(`  Response: ${JSON.stringify(result, null, 2)}`);
    }
  } catch (error) {
    console.log('✗ Client registration with file uploads - Error:', error.message);
  }

  // Test 2: Videographer registration with files
  totalTests++;
  try {
    const formData = new FormData();
    
    // Add form fields
    formData.append('first_name', 'Upload');
    formData.append('last_name', 'Videographer');
    formData.append('email', randomEmail('upload-videographer'));
    formData.append('password', 'Test123!');
    formData.append('phone_number', '+1234567891');
    formData.append('city', 'Test City');
    formData.append('country', 'Test Country');
    formData.append('profile_title', 'Upload Test Videographer');
    formData.append('skills', JSON.stringify(['cinematography', 'drone']));
    formData.append('experience_level', 'intermediate');
    formData.append('hourly_rate', '75');
    formData.append('short_description', 'Test videographer with uploads');
    
    // Add file attachments
    formData.append('profile_picture', createMockImageBuffer(), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    formData.append('id_document', createMockImageBuffer(), {
      filename: 'id.png',
      contentType: 'image/png'
    });

    const response = await makeRequest('POST', '/api/v1/auth/register/videographer', null, formData);
    const result = processApiResponse(response);
    
    if (result.success && result.data.user && result.data.token) {
      console.log('✓ Videographer registration with file uploads');
      passedTests++;
    } else {
      console.log('✗ Videographer registration with file uploads failed');
      console.log(`  Response: ${JSON.stringify(result, null, 2)}`);
    }
  } catch (error) {
    console.log('✗ Videographer registration with file uploads - Error:', error.message);
  }

  // Test 3: Video Editor registration with files
  totalTests++;
  try {
    const formData = new FormData();
    
    // Add form fields
    formData.append('first_name', 'Upload');
    formData.append('last_name', 'Editor');
    formData.append('email', randomEmail('upload-editor'));
    formData.append('password', 'Test123!');
    formData.append('phone_number', '+1234567892');
    formData.append('city', 'Test City');
    formData.append('country', 'Test Country');
    formData.append('profile_title', 'Upload Test Editor');
    formData.append('skills', JSON.stringify(['premiere_pro', 'after_effects']));
    formData.append('experience_level', 'expert');
    formData.append('hourly_rate', '80');
    formData.append('short_description', 'Test editor with uploads');
    
    // Add file attachments
    formData.append('profile_picture', createMockImageBuffer(), {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    formData.append('id_document', createMockImageBuffer(), {
      filename: 'id.png',
      contentType: 'image/png'
    });

    const response = await makeRequest('POST', '/api/v1/auth/register/videoeditor', null, formData);
    const result = processApiResponse(response);
    
    if (result.success && result.data.user && result.data.token) {
      console.log('✓ Video Editor registration with file uploads');
      passedTests++;
    } else {
      console.log('✗ Video Editor registration with file uploads failed');
      console.log(`  Response: ${JSON.stringify(result, null, 2)}`);
    }
  } catch (error) {
    console.log('✗ Video Editor registration with file uploads - Error:', error.message);
  }

  // Summary
  console.log('-'.repeat(50));
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const summaryMessage = `📊 File Upload Tests: ${passedTests}/${totalTests} passed (${successRate}%)`;
  
  if (passedTests === totalTests) {
    console.log(`✅ ${summaryMessage}`);
  } else if (passedTests > totalTests * 0.7) {
    console.log(`⚠️  ${summaryMessage}`);
  } else {
    console.log(`❌ ${summaryMessage}`);
  }
  
  return { passedTests, totalTests };
}

// Export for use in other test files
module.exports = { testFileUploadRegistration };

// Run if called directly
if (require.main === module) {
  testFileUploadRegistration().catch(console.error);
}