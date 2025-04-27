/**
 * Request validation middleware
 */
const path = require('path');

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

/**
 * Validates file uploads
 * @param {Object} options - Validation options
 * @returns {Function} - Express middleware function
 */
const validateFileUpload = (options = {}) => {
  const {
    required = true,
    allowedTypes = ['image/jpeg', 'image/png'],
    maxSize = 10 * 1024 * 1024, // 10MB default
    minSize = 100, // 100 bytes minimum (for test images)
    fieldName = 'image'
  } = options;

  return (req, res, next) => {
    try {
      // Check if a file was uploaded via multer
      if (req.file) {
        const file = req.file;
        
        // Validate file type
        if (!allowedTypes.includes(file.mimetype)) {
          throw new ValidationError(
            `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`,
            415 // Unsupported Media Type
          );
        }
        
        // Validate file size
        if (file.size > maxSize) {
          throw new ValidationError(
            `File too large. Maximum size: ${Math.floor(maxSize / (1024 * 1024))}MB`,
            413 // Payload Too Large
          );
        }
        
        // File is valid, continue
        return next();
      }
      
      // Check if we have file uploaded via express-fileupload
      if (req.files && req.files[fieldName]) {
        const file = req.files[fieldName];
        
        // Validate file type
        const fileExt = path.extname(file.name).toLowerCase();
        const isValidType = allowedTypes.some(type => {
          const ext = type.split('/')[1];
          return fileExt === `.${ext}` || 
                 (ext === 'jpeg' && fileExt === '.jpg') ||
                 file.mimetype === type;
        });
        
        if (!isValidType) {
          throw new ValidationError(
            `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`,
            415 // Unsupported Media Type
          );
        }
        
        // Validate file size
        if (file.size > maxSize) {
          throw new ValidationError(
            `File too large. Maximum size: ${Math.floor(maxSize / (1024 * 1024))}MB`,
            413 // Payload Too Large
          );
        }
        
        // File is valid, continue
        return next();
      }
      
      // Check for base64 encoded image in request body
      if (req.body && req.body[fieldName]) {
        const imageData = req.body[fieldName];
        
        // Basic validation for base64 data
        if (typeof imageData === 'string') {
          // Validate mime type
          if (!imageData.startsWith('data:image/')) {
            throw new ValidationError('Invalid image format. Must be a valid image data URL', 415);
          }
          
          const mimeType = imageData.split(';')[0].split(':')[1];
          if (!allowedTypes.includes(mimeType)) {
            throw new ValidationError(
              `Invalid image type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`,
              415
            );
          }
          
          // Validate size (approximate for base64)
          // Base64 size is roughly 4/3 of the binary size
          const base64Data = imageData.split(',')[1] || '';
          const approximateSize = Math.ceil((base64Data.length * 3) / 4);
          
          if (approximateSize > maxSize) {
            throw new ValidationError(
              `Image too large. Maximum size: ${Math.floor(maxSize / (1024 * 1024))}MB`,
              413
            );
          }
          
          // Data is valid, continue
          return next();
        }
      }
      
      // If we get here and file is required but no file was found
      if (required) {
        throw new ValidationError('No image file provided', 400);
      }
      
      // File is not required and none was provided, continue
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validates request body against a schema
 * @param {Object} schema - Validation schema object with field names and validation functions
 * @returns {Function} - Express middleware function
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const errors = [];
      
      // Check each field in the schema
      Object.keys(schema).forEach(field => {
        const value = req.body[field];
        const validationRules = schema[field];
        
        // Check if the field is required
        if (validationRules.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field} is required`);
          return;
        }
        
        // Skip validation if value is not provided and not required
        if ((value === undefined || value === null || value === '') && !validationRules.required) {
          return;
        }
        
        // Validate the field against all rules
        if (validationRules.validate) {
          const result = validationRules.validate(value);
          if (result !== true) {
            errors.push(result);
          }
        }
      });
      
      // If there are validation errors, throw a validation error
      if (errors.length > 0) {
        throw new ValidationError(`Validation failed: ${errors.join(', ')}`, 400);
      }
      
      // Validation passed, continue
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  ValidationError,
  validateFileUpload,
  validateBody
};