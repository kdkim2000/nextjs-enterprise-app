/**
 * File Upload Middleware - Common Module
 */

import multer from 'multer';

// Memory storage for buffer access
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

export const uploadMultipleBuffer = (fieldName: string, maxCount: number) => {
  return upload.array(fieldName, maxCount);
};

export const uploadSingleBuffer = (fieldName: string) => {
  return upload.single(fieldName);
};

export default upload;
