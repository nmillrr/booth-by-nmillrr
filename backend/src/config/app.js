/**
 * Application configuration
 */

module.exports = {
  /**
   * Application environment
   */
  env: process.env.NODE_ENV || 'development',
  
  /**
   * Server port
   */
  port: process.env.PORT || 3001,
  
  /**
   * CORS configuration
   */
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },
  
  /**
   * Maximum file size for uploads (10MB)
   */
  maxFileSize: '10mb',
  
  /**
   * Image processing options
   */
  imageProcessing: {
    // Default quality for JPEG compression
    quality: 85,
    // Maximum dimensions
    maxWidth: 1600,
    maxHeight: 1600,
    // Supported formats
    supportedFormats: ['image/jpeg', 'image/png', 'image/gif']
  }
};