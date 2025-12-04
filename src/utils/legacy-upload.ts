/**
 * Legacy upload functions for backward compatibility
 * This file contains old upload methods that are still being used by existing features
 */

import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// S3 client for legacy upload functions
export const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true, // Supabase documentation recommends true for S3 compatibility
});

/**
 * Upload file to AWS S3 (base64 string version)
 * @deprecated Use registration-upload.ts for new upload functionality
 * @param filename - Name of the file to upload
 * @param base64String - Base64 encoded file content (may include data URI prefix)
 * @returns Promise<string> - URL of uploaded file
 */
export async function uploadToAws(filename: string, base64String: string): Promise<string> {
  // Strip the data URI prefix if present (e.g., "data:image/png;base64,")
  let cleanBase64 = base64String;
  if (base64String.includes(',')) {
    cleanBase64 = base64String.split(',')[1];
  }
  
  const buffer = Buffer.from(cleanBase64, 'base64');
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ACL: 'public-read' as const,
  };

  try {
    const uploadResult = await new Upload({
      client: s3,
      params,
    }).done();

    return uploadResult.Location || `${process.env.AWS_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/${filename}`;
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}