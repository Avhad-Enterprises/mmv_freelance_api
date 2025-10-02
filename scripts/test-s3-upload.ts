#!/usr/bin/env node

/**
 * Test S3 Upload to Supabase Storage
 * This script tests the S3 configuration and uploads a test file
 */

import { S3Client, PutObjectCommand, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// S3 Configuration
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
  region: process.env.AWS_REGION!,
  endpoint: process.env.AWS_ENDPOINT!,
  forcePathStyle: true, // Required for Supabase S3 compatibility
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mmv';

/**
 * Test S3 connection by listing buckets
 */
async function testS3Connection() {
  console.log('🔗 Testing S3 connection...');
  
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ S3 connection successful!');
    console.log('📂 Available buckets:', response.Buckets?.map(b => b.Name) || []);
    return true;
  } catch (error: any) {
    console.error('❌ S3 connection failed:', error.message);
    return false;
  }
}

/**
 * Test bucket access
 */
async function testBucketAccess() {
  console.log(`🪣 Testing bucket access: ${BUCKET_NAME}`);
  
  try {
    const command = new HeadBucketCommand({ Bucket: BUCKET_NAME });
    await s3Client.send(command);
    
    console.log(`✅ Bucket ${BUCKET_NAME} is accessible!`);
    return true;
  } catch (error: any) {
    console.error(`❌ Bucket access failed:`, error.message);
    return false;
  }
}

/**
 * Create a test file for upload
 */
function createTestFile(): Buffer {
  const testContent = `Test file created at ${new Date().toISOString()}
This is a test file to verify S3 upload functionality.
Environment: ${process.env.NODE_ENV}
Bucket: ${BUCKET_NAME}
Endpoint: ${process.env.AWS_ENDPOINT}`;

  return Buffer.from(testContent, 'utf-8');
}

/**
 * Upload test file to S3
 */
async function uploadTestFile() {
  console.log('📤 Testing file upload...');
  
  try {
    const fileBuffer = createTestFile();
    const fileName = `test-upload-${Date.now()}.txt`;
    const key = `test-uploads/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: 'text/plain',
      ContentLength: fileBuffer.length,
    });
    
    const response = await s3Client.send(command);
    
    console.log('✅ File upload successful!');
    console.log('📁 File key:', key);
    console.log('🔗 ETag:', response.ETag);
    
    // Construct the public URL
    const publicUrl = `${process.env.AWS_ENDPOINT}/object/public/${BUCKET_NAME}/${key}`;
    console.log('🌐 Public URL:', publicUrl);
    
    return { success: true, key, publicUrl };
  } catch (error: any) {
    console.error('❌ File upload failed:', error.message);
    console.error('Full error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test image upload (similar to profile picture)
 */
async function uploadTestImage() {
  console.log('🖼️  Testing image upload...');
  
  try {
    // Create a simple 1x1 pixel PNG
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5c, 0xdd, 0xdb, 0x8d, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);
    
    const fileName = `test-image-${Date.now()}.png`;
    const key = `profile_photos/test-user/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: pngBuffer,
      ContentType: 'image/png',
      ContentLength: pngBuffer.length,
    });
    
    const response = await s3Client.send(command);
    
    console.log('✅ Image upload successful!');
    console.log('📁 Image key:', key);
    console.log('🔗 ETag:', response.ETag);
    
    return { success: true, key };
  } catch (error: any) {
    console.error('❌ Image upload failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Print configuration details
 */
function printConfiguration() {
  console.log('⚙️  S3 Configuration:');
  console.log('   Access Key:', process.env.AWS_ACCESS_KEY?.substring(0, 8) + '...');
  console.log('   Secret Key:', process.env.AWS_SECRET_KEY?.substring(0, 8) + '...');
  console.log('   Region:', process.env.AWS_REGION);
  console.log('   Endpoint:', process.env.AWS_ENDPOINT);
  console.log('   Bucket:', BUCKET_NAME);
  console.log('   Force Path Style: true');
  console.log('');
}

/**
 * Main test function
 */
async function runS3Tests() {
  console.log('🧪 Starting S3 Upload Tests...\n');
  
  printConfiguration();
  
  // Test 1: S3 Connection
  const connectionTest = await testS3Connection();
  console.log('');
  
  if (!connectionTest) {
    console.log('❌ Cannot proceed without S3 connection. Please check your credentials.');
    process.exit(1);
  }
  
  // Test 2: Bucket Access
  const bucketTest = await testBucketAccess();
  console.log('');
  
  if (!bucketTest) {
    console.log('❌ Cannot proceed without bucket access. Please check your bucket permissions.');
    process.exit(1);
  }
  
  // Test 3: File Upload
  const fileUploadResult = await uploadTestFile();
  console.log('');
  
  // Test 4: Image Upload
  const imageUploadResult = await uploadTestImage();
  console.log('');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`   S3 Connection: ${connectionTest ? '✅' : '❌'}`);
  console.log(`   Bucket Access: ${bucketTest ? '✅' : '❌'}`);
  console.log(`   File Upload: ${fileUploadResult.success ? '✅' : '❌'}`);
  console.log(`   Image Upload: ${imageUploadResult.success ? '✅' : '❌'}`);
  
  if (fileUploadResult.success && imageUploadResult.success) {
    console.log('\n🎉 All tests passed! Your S3 configuration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the error messages above.');
  }
}

// Run tests if executed directly
if (require.main === module) {
  runS3Tests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

export { runS3Tests };