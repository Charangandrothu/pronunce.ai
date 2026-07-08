import fs from 'fs/promises';

/**
 * Asynchronously deletes a file from disk.
 * Handles missing file errors (ENOENT) gracefully.
 * @param {string} filePath Absolute or relative path to the file
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // Avoid throwing if the file has already been deleted (ENOENT)
    if (err.code !== 'ENOENT') {
      console.error(`Error deleting file at ${filePath}:`, err.message);
    }
  }
};
