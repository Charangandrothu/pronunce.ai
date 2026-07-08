import { deleteFile } from '../utils/deleteFile.js';

/**
 * Global Express Error Handler.
 * Catches all controller and middleware failures, sweeps any uploaded files from disk,
 * and formats consistent JSON error responses.
 */
export const errorHandler = async (err, req, res, next) => {
  // Always sweep uploaded files from disk on error
  if (req.file && req.file.path) {
    await deleteFile(req.file.path);
  }

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Specific Multer limit handler mapping
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413; // Payload Too Large
    message = 'File is too large. Maximum upload size allowed is 20 MB.';
  }

  // Format consistent error logging
  if (statusCode === 500) {
    console.error(`[CRITICAL SERVER ERROR]:`, err);
  } else {
    console.warn(`[Client Request Warning] ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};
