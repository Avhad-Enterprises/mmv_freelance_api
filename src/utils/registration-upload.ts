import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { 
  MulterFile, 
  FileUploadResult, 
  DocumentType, 
  AccountType 
} from '../interfaces/file-upload.interface';

// Initialize S3 client with Supabase configuration
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

// File validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
  fileName: string;
}

/**
 * Upload file to S3 with proper folder structure
 * Structure: mmv/{document_type}/{user_id}/{filename}
 */
export async function uploadRegistrationFile(
  file: MulterFile,
  userId: string,
  documentType: DocumentType,
  accountType: AccountType
): Promise<UploadResult> {
  
  // Validate file
  validateFile(file, documentType);

  // Generate file path based on folder structure
  const fileName = generateFileName(file, accountType, documentType);
  const filePath = `${documentType}/${userId}/${fileName}`;

  try {
    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        accountType: accountType,
        documentType: documentType,
        userId: userId,
        uploadDate: new Date().toISOString()
      }
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const url = `${process.env.AWS_ENDPOINT}/${BUCKET_NAME}/${filePath}`;

    return {
      url,
      key: filePath,
      size: file.size,
      contentType: file.mimetype,
      fileName: fileName
    };

  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload ${documentType}: ${error}`);
  }
}

/**
 * Upload multiple files (for business documents)
 */
export async function uploadMultipleRegistrationFiles(
  files: MulterFile[],
  userId: string,
  documentType: DocumentType,
  accountType: AccountType
): Promise<UploadResult[]> {
  
  if (!files || files.length === 0) {
    return [];
  }

  // Validate file count for business documents
  if (documentType === DocumentType.BUSINESS_DOCUMENT && files.length > 5) {
    throw new Error('Maximum 5 business documents allowed');
  }

  const uploadPromises = files.map((file, index) => 
    uploadRegistrationFile(file, userId, documentType, accountType)
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple file upload error:', error);
    throw new Error(`Failed to upload multiple ${documentType}: ${error}`);
  }
}

/**
 * Delete file from S3
 */
export async function deleteRegistrationFile(filePath: string): Promise<void> {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath
    });

    await s3Client.send(deleteCommand);
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete file: ${error}`);
  }
}

/**
 * Validate file based on document type
 */
function validateFile(file: MulterFile, documentType: DocumentType): void {
  if (!file || !file.buffer) {
    throw new Error('No file provided');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file type based on document type
  let allowedTypes: string[];
  
  switch (documentType) {
    case DocumentType.PROFILE_PHOTO:
      allowedTypes = ALLOWED_IMAGE_TYPES;
      break;
    case DocumentType.ID_DOCUMENT:
      allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
      break;
    case DocumentType.BUSINESS_DOCUMENT:
      allowedTypes = ALLOWED_DOCUMENT_TYPES;
      break;
    default:
      throw new Error('Invalid document type');
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
}

/**
 * Generate unique filename with proper naming convention
 */
function generateFileName(
  file: MulterFile, 
  accountType: AccountType, 
  documentType: DocumentType
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const fileExt = getFileExtension(file.originalname);
  
  // Create descriptive filename
  const prefix = `${accountType}_${documentType.replace('_', '')}`;
  return `${prefix}_${timestamp}_${randomStr}${fileExt}`;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot) : '';
}

/**
 * Get S3 client for direct usage if needed
 */
export function getS3Client(): S3Client {
  return s3Client;
}

export default {
  uploadRegistrationFile,
  uploadMultipleRegistrationFiles,
  deleteRegistrationFile,
  DocumentType,
  AccountType
};