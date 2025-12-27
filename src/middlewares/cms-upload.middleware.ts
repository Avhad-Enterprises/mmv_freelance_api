// CMS Upload Middleware - Multer configuration for CMS image uploads
// Supports SVG and PNG formats only
import multer from "multer";
import { Request } from "express";

// Memory storage for file processing before S3 upload
const storage = multer.memoryStorage();

// Allowed MIME types for CMS images (SVG and PNG only)
const ALLOWED_MIME_TYPES = ["image/png", "image/svg+xml"];

// File filter for CMS images
const cmsImageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check if the file is an allowed image type
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG and SVG image formats are allowed"));
  }
};

// Multer configuration for CMS uploads
const cmsUpload = multer({
  storage,
  fileFilter: cmsImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for CMS images
    files: 3, // Maximum 3 files (logo, hero_left, hero_right)
  },
});

// Trusted Companies upload - logo field only
export const trustedCompanyUpload = cmsUpload.single("logo");

// Hero section upload - left and right images
export const heroUpload = cmsUpload.fields([
  { name: "hero_left", maxCount: 1 },
  { name: "hero_right", maxCount: 1 },
]);

// Generic single image upload for any CMS section
export const singleImageUpload = cmsUpload.single("image");

// Export validation constants
export const CMS_ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;
export const CMS_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default {
  trustedCompanyUpload,
  heroUpload,
  singleImageUpload,
};
