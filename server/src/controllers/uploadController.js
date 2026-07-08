import * as mm from 'music-metadata';
import path from 'path';
import { deleteFile } from '../utils/deleteFile.js';

/**
 * Controller to handle incoming audio file uploads.
 * Parses and verifies that the duration is strictly between 30 and 45 seconds.
 */
export const handleUpload = async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'No audio file uploaded.'
    });
  }

  try {
    // Parse duration using music-metadata library
    const metadata = await mm.parseFile(file.path);
    const duration = metadata.format.duration;

    if (duration === undefined) {
      await deleteFile(file.path);
      return res.status(400).json({
        success: false,
        message: 'Unable to parse audio duration. The file may be corrupt or of unsupported encoding.'
      });
    }

    // Validate 30-45 seconds duration constraint
    if (duration < 30 || duration > 45) {
      await deleteFile(file.path);
      return res.status(400).json({
        success: false,
        message: `Invalid audio duration: ${duration.toFixed(1)} seconds. Clips must be between 30 and 45 seconds.`
      });
    }

    // File name without extension is treated as file ID
    const fileId = path.basename(file.filename, path.extname(file.filename));
    const cleanDuration = parseFloat(duration.toFixed(2));

    // Return format adhering to both requested specifications (root level + data block)
    return res.status(200).json({
      success: true,
      fileId,
      filename: file.originalname,
      duration: cleanDuration,
      data: {
        fileId,
        filename: file.originalname,
        duration: cleanDuration,
        tempFilename: file.filename, // Keep for mapping during the analysis phase
        path: file.path
      }
    });
  } catch (err) {
    // Proactively clean up file on error
    await deleteFile(file.path);
    return res.status(400).json({
      success: false,
      message: `Audio validation failed: ${err.message}`
    });
  }
};
