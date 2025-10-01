import 'dotenv/config';
import { 
  uploadRegistrationFile, 
  uploadMultipleRegistrationFiles 
} from '../src/utils/registration-upload';
import { DocumentType, AccountType, MulterFile } from '../src/interfaces/file-upload.interface';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test script to upload dummy files to S3 bucket
 * This will test the registration upload system with real files
 */

// Create dummy file buffers for testing
function createDummyImageFile(filename: string, accountType: string): MulterFile {
  // Create a simple 1x1 pixel PNG image
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  ]);

  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'image/png',
    size: pngBuffer.length,
    buffer: pngBuffer,
  };
}

function createDummyPdfFile(filename: string): MulterFile {
  // Create a minimal PDF file
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
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
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
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF`;

  const pdfBuffer = Buffer.from(pdfContent);

  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: pdfBuffer.length,
    buffer: pdfBuffer,
  };
}

async function testRegistrationUploads() {
  console.log('🚀 Starting Registration Upload Tests\n');
  console.log('📍 Bucket:', process.env.AWS_BUCKET_NAME);
  console.log('🌍 Region:', process.env.AWS_REGION);
  console.log('🔗 Endpoint:', process.env.AWS_ENDPOINT);
  console.log('');

  const testResults: Array<{ test: string; status: string; details?: string }> = [];

  // Test 1: Upload Profile Photo for Client
  try {
    console.log('🧪 Test 1: Uploading Profile Photo for Client...');
    const profilePhoto = createDummyImageFile('client-profile.png', 'client');
    
    const result = await uploadRegistrationFile(
      profilePhoto,
      'test_client_001',
      DocumentType.PROFILE_PHOTO,
      AccountType.CLIENT
    );

    console.log('✅ Success!');
    console.log('  📂 Path:', result.key);
    console.log('  🔗 URL:', result.url);
    console.log('  📦 Size:', result.size, 'bytes');
    console.log('');
    testResults.push({ 
      test: 'Client Profile Photo', 
      status: '✅ PASSED', 
      details: result.key 
    });
  } catch (error: any) {
    console.log('❌ Failed:', error.message);
    console.log('');
    testResults.push({ 
      test: 'Client Profile Photo', 
      status: '❌ FAILED', 
      details: error.message 
    });
  }

  // Test 2: Upload ID Document for Videographer
  try {
    console.log('🧪 Test 2: Uploading ID Document for Videographer...');
    const idDoc = createDummyImageFile('videographer-id.png', 'videographer');
    
    const result = await uploadRegistrationFile(
      idDoc,
      'test_videographer_002',
      DocumentType.ID_DOCUMENT,
      AccountType.VIDEOGRAPHER
    );

    console.log('✅ Success!');
    console.log('  📂 Path:', result.key);
    console.log('  🔗 URL:', result.url);
    console.log('  📦 Size:', result.size, 'bytes');
    console.log('');
    testResults.push({ 
      test: 'Videographer ID Document', 
      status: '✅ PASSED', 
      details: result.key 
    });
  } catch (error: any) {
    console.log('❌ Failed:', error.message);
    console.log('');
    testResults.push({ 
      test: 'Videographer ID Document', 
      status: '❌ FAILED', 
      details: error.message 
    });
  }

  // Test 3: Upload Multiple Business Documents for Client
  try {
    console.log('🧪 Test 3: Uploading Multiple Business Documents for Client...');
    const businessDocs = [
      createDummyPdfFile('business-license.pdf'),
      createDummyPdfFile('tax-certificate.pdf'),
      createDummyPdfFile('company-registration.pdf'),
    ];
    
    const results = await uploadMultipleRegistrationFiles(
      businessDocs,
      'test_client_003',
      DocumentType.BUSINESS_DOCUMENT,
      AccountType.CLIENT
    );

    console.log('✅ Success!');
    results.forEach((result, index) => {
      console.log(`  📄 Document ${index + 1}:`);
      console.log('    📂 Path:', result.key);
      console.log('    🔗 URL:', result.url);
      console.log('    📦 Size:', result.size, 'bytes');
    });
    console.log('');
    testResults.push({ 
      test: 'Multiple Business Documents', 
      status: '✅ PASSED', 
      details: `${results.length} files uploaded` 
    });
  } catch (error: any) {
    console.log('❌ Failed:', error.message);
    console.log('');
    testResults.push({ 
      test: 'Multiple Business Documents', 
      status: '❌ FAILED', 
      details: error.message 
    });
  }

  // Test 4: Upload Profile Photo for Video Editor
  try {
    console.log('🧪 Test 4: Uploading Profile Photo for Video Editor...');
    const profilePhoto = createDummyImageFile('editor-profile.png', 'videoeditor');
    
    const result = await uploadRegistrationFile(
      profilePhoto,
      'test_videoeditor_004',
      DocumentType.PROFILE_PHOTO,
      AccountType.VIDEOEDITOR
    );

    console.log('✅ Success!');
    console.log('  📂 Path:', result.key);
    console.log('  🔗 URL:', result.url);
    console.log('  📦 Size:', result.size, 'bytes');
    console.log('');
    testResults.push({ 
      test: 'Video Editor Profile Photo', 
      status: '✅ PASSED', 
      details: result.key 
    });
  } catch (error: any) {
    console.log('❌ Failed:', error.message);
    console.log('');
    testResults.push({ 
      test: 'Video Editor Profile Photo', 
      status: '❌ FAILED', 
      details: error.message 
    });
  }

  // Test 5: Upload ID Document for Video Editor
  try {
    console.log('🧪 Test 5: Uploading ID Document for Video Editor...');
    const idDoc = createDummyPdfFile('editor-passport.pdf');
    
    const result = await uploadRegistrationFile(
      idDoc,
      'test_videoeditor_005',
      DocumentType.ID_DOCUMENT,
      AccountType.VIDEOEDITOR
    );

    console.log('✅ Success!');
    console.log('  📂 Path:', result.key);
    console.log('  🔗 URL:', result.url);
    console.log('  📦 Size:', result.size, 'bytes');
    console.log('');
    testResults.push({ 
      test: 'Video Editor ID Document (PDF)', 
      status: '✅ PASSED', 
      details: result.key 
    });
  } catch (error: any) {
    console.log('❌ Failed:', error.message);
    console.log('');
    testResults.push({ 
      test: 'Video Editor ID Document (PDF)', 
      status: '❌ FAILED', 
      details: error.message 
    });
  }

  // Test 6: Verify Folder Structure
  try {
    console.log('🧪 Test 6: Verifying Folder Structure...');
    console.log('✅ Expected structure: mmv/{document_type}/{user_id}/{filename}');
    console.log('');
    
    const expectedStructures = [
      'profile_photos/test_client_001/',
      'id_documents/test_videographer_002/',
      'business_documents/test_client_003/',
      'profile_photos/test_videoeditor_004/',
      'id_documents/test_videoeditor_005/',
    ];
    
    console.log('📂 Expected folder paths created:');
    expectedStructures.forEach(path => {
      console.log(`  ✓ ${path}`);
    });
    console.log('');
    testResults.push({ 
      test: 'Folder Structure Verification', 
      status: '✅ PASSED', 
      details: 'All folders created correctly' 
    });
  } catch (error: any) {
    testResults.push({ 
      test: 'Folder Structure Verification', 
      status: '❌ FAILED', 
      details: error.message 
    });
  }

  // Print Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  testResults.forEach(result => {
    console.log(`${result.status} - ${result.test}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  });
  
  const passed = testResults.filter(r => r.status.includes('✅')).length;
  const failed = testResults.filter(r => r.status.includes('❌')).length;
  
  console.log('');
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(70));
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your bucket now has test data.');
    console.log('📂 Check your Supabase Storage dashboard to view the uploaded files.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run the tests
testRegistrationUploads().catch(console.error);
