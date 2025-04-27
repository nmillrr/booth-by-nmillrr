/**
 * Global error handling middleware
 */
const path = require('path');
const fs = require('fs');
const { ValidationError } = require('./validationMiddleware');

// Set up error logging
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

/**
 * Log error to file
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 */
const logErrorToFile = (err, req) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  };
  
  // Log to console
  console.error(`[${timestamp}] Error:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error('Stack:', err.stack);
  }
  
  // Log to file
  const logFilePath = path.join(logDirectory, 'error.log');
  const logEntry = JSON.stringify(errorLog) + '\n';
  
  fs.appendFile(logFilePath, logEntry, (writeErr) => {
    if (writeErr) {
      console.error('Error writing to log file:', writeErr);
    }
  });
};

/**
 * Cleanup temporary files from the request if an error occurs
 * @param {Object} req - Express request object
 */
const cleanupTempFiles = (req) => {
  try {
    // Clean up file uploaded via multer
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Clean up file uploaded via express-fileupload
    if (req.files) {
      for (const fieldname in req.files) {
        const file = req.files[fieldname];
        if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
          fs.unlinkSync(file.tempFilePath);
        }
      }
    }
  } catch (cleanupError) {
    console.error('Error cleaning up temporary files:', cleanupError);
    // Don't throw, as we're already handling an error
  }
};

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logErrorToFile(err, req);
  
  // Clean up any temporary files
  cleanupTempFiles(req);
  
  // Determine status code and error type
  let statusCode = err.statusCode || 500;
  let errorType = 'SERVER_ERROR';
  let message = err.message || 'Internal server error';
  
  // Handle specific error types
  if (err instanceof ValidationError) {
    errorType = 'VALIDATION_ERROR';
  } else if (err.name === 'MulterError') {
    // Handle Multer-specific errors
    errorType = 'FILE_UPLOAD_ERROR';
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413; // Payload Too Large
      message = 'File too large. Maximum size: 10MB';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      statusCode = 400; // Bad Request
      message = `Unexpected field: ${err.field}. Expected field name: 'image'`;
    }
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    // Handle JSON parsing errors
    statusCode = 400;
    errorType = 'INVALID_JSON';
    message = 'Invalid JSON provided';
  } else if (err.code === 'ENOENT') {
    // Handle file not found errors
    statusCode = 404;
    errorType = 'FILE_NOT_FOUND';
  } else if (err.code === 'EACCES' || err.code === 'EPERM') {
    // Handle permission errors
    statusCode = 403;
    errorType = 'PERMISSION_DENIED';
    message = 'Operation not permitted';
  } else if (statusCode === 500) {
    // For production, don't expose internal error details
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error';
    }
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;