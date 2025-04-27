/**
 * Cleanup service for temporary files
 * Implements automatic deletion of processed images after 24 hours
 */
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Delete files older than the specified age
 * @param {string} directory - Directory to clean up
 * @param {number} maxAgeHours - Maximum age in hours
 * @returns {Promise<number>} - Number of deleted files
 */
const cleanupOldFiles = async (directory, maxAgeHours = 24) => {
  try {
    // Check if directory exists
    if (!fs.existsSync(directory)) {
      logger.info(`Directory does not exist: ${directory}`);
      return 0;
    }
    
    // Calculate the cutoff date
    const now = Date.now();
    const cutoff = now - (maxAgeHours * 60 * 60 * 1000);
    
    // Read all files in the directory
    const files = fs.readdirSync(directory);
    let deletedCount = 0;
    
    // Process each file
    for (const file of files) {
      // Skip .gitkeep and other hidden files
      if (file.startsWith('.')) continue;
      
      const filePath = path.join(directory, file);
      
      try {
        // Get file stats
        const stats = fs.statSync(filePath);
        
        // Check if file is older than cutoff
        if (stats.mtimeMs < cutoff) {
          // Delete the file
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.info(`Deleted old file: ${filePath}`);
        }
      } catch (fileError) {
        logger.error(`Error processing file ${filePath}: ${fileError.message}`);
      }
    }
    
    logger.info(`Cleanup complete. Deleted ${deletedCount} files from ${directory}`);
    return deletedCount;
  } catch (error) {
    logger.error(`Cleanup error: ${error.message}`);
    return 0;
  }
};

/**
 * Schedule periodic cleanup
 * @param {string} directory - Directory to clean up
 * @param {number} intervalHours - Cleanup interval in hours
 * @param {number} maxAgeHours - Maximum file age in hours
 */
const scheduleCleanup = (directory, intervalHours = 1, maxAgeHours = 24) => {
  // Initial cleanup
  cleanupOldFiles(directory, maxAgeHours);
  
  // Schedule periodic cleanup
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  const intervalId = setInterval(() => {
    cleanupOldFiles(directory, maxAgeHours);
  }, intervalMs);
  
  logger.info(`Scheduled cleanup for ${directory} every ${intervalHours} hour(s)`);
  
  // Return the interval ID so it can be cleared if needed
  return intervalId;
};

module.exports = {
  cleanupOldFiles,
  scheduleCleanup
};