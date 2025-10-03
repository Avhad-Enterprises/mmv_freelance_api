// Upload Middleware - Multer configuration for registration file uploads
import multer from 'multer';
import { Request } from 'express';
import { MulterFile } from '../interfaces/file-upload.interface';

// Memory storage for file processing before S3 upload
const storage = multer.memoryStorage();

// File filter for allowed file types
const fileFilter = (req: Request, file: MulterFile, cb: Function) => {
  // Allow images for profile pictures (both profile_picture and profile_photo for different user types)
  if (file.fieldname === 'profile_picture' || file.fieldname === 'profile_photo') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Profile picture must be an image file'), false);
    }
  }
  // Allow images and PDFs for documents
  else if (file.fieldname === 'id_document' || file.fieldname === 'business_document' || file.fieldname === 'business_documents') {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Documents must be image or PDF files'), false);
    }
  }
  else {
    cb(new Error('Unexpected field'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 3, // Maximum 3 files (profile, id, business)
  },
});

// Registration upload middleware
export const registrationUpload = upload.fields([
  { name: 'profile_picture', maxCount: 1 }, // For clients and videographers
  { name: 'profile_photo', maxCount: 1 },   // For video editors
  { name: 'id_document', maxCount: 1 },
  { name: 'business_document', maxCount: 1 }, // Only for clients
  // Note: business_documents support kept for backward compatibility
  { name: 'business_documents', maxCount: 1 }, // Legacy field name support
]);

export default { registrationUpload };