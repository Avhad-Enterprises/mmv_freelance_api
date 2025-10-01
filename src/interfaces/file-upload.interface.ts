/**
 * File upload related interfaces and types
 */

// Multer file interface for uploaded files
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

// Result interface for successful file uploads
export interface FileUploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
  fileName: string;
}

// Document types for folder organization
export enum DocumentType {
  ID_DOCUMENT = 'id_documents',
  BUSINESS_DOCUMENT = 'business_documents',
  PROFILE_PHOTO = 'profile_photos'
}

// User account types
export enum AccountType {
  CLIENT = 'client',
  VIDEOGRAPHER = 'videographer',
  VIDEOEDITOR = 'videoeditor'
}

// Upload configuration
export interface UploadConfig {
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedDocumentTypes: string[];
  bucketName: string;
}