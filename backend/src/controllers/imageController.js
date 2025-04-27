/**
 * Image processing controller
 */
const fs = require('fs');
const path = require('path');
const imageService = require('../services/imageService');
const config = require('../config/app');

// Mock database for storing processed images
// In a real app, you would use a database
const processedImages = [];

// Get the uploads directory, which could be the default or set in app.locals for serverless
const getUploadsDir = (req) => {
  if (req && req.app && req.app.locals && req.app.locals.uploadsDir) {
    return req.app.locals.uploadsDir;
  }
  
  // Default uploads directory (for local development)
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  return uploadsDir;
}

/**
 * Process an uploaded image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processImage = async (req, res) => {
  try {
    let imageData, filePath;
    
    // Check if we have a file uploaded via multer
    if (req.file) {
      filePath = req.file.path;
      // Read file for processing
      imageData = req.file.buffer || fs.readFileSync(filePath);
    } 
    // Check if we have form data with 'image' field
    else if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadsDir = getUploadsDir(req);
      filePath = path.join(uploadsDir, `${Date.now()}-${file.name}`);
      
      // Save the file
      await new Promise((resolve, reject) => {
        file.mv(filePath, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      
      // Read file for processing
      imageData = fs.readFileSync(filePath);
    } 
    // Check for JSON with base64 image data
    else if (req.body && req.body.image) {
      imageData = req.body.image;
      
      // If it's a base64 string, validate it
      if (typeof imageData === 'string') {
        if (!imageService.validateImage(imageData)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid image data format'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Image data must be a base64 string'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No image found in request'
      });
    }
    
    // Validate file size
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (imageData.length > maxSizeBytes) {
      // Clean up file if it was saved
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds the maximum limit of 10MB'
      });
    }
    
    // Process the image
    const processOptions = {
      filters: req.body.filters || ['auto-enhance'],
    };
    
    // Call the image service to process the image
    const processedResult = await imageService.processImage(imageData, processOptions);
    
    // Generate a unique ID for the processed image
    const id = Date.now().toString();
    
    // Create a new processed image record
    const processedImage = {
      id,
      originalSize: processedResult.originalSize,
      processedSize: processedResult.processedSize,
      processedUrl: processedResult.url || 'https://example.com/processed-image.jpg',
      createdAt: new Date().toISOString()
    };
    
    // Store in our mock database
    processedImages.push(processedImage);
    
    // Determine response format
    const responseFormat = req.query.format || 'json';
    
    if (responseFormat === 'raw') {
      // Return the processed image buffer directly
      res.set('Content-Type', 'image/jpeg');
      res.set('Content-Disposition', `attachment; filename="processed_${processedImage.id}.jpg"`);
      return res.send(processedResult.buffer);
    } else {
      // Return JSON response
      res.status(200).json({
        success: true,
        message: 'Image processed successfully',
        result: {
          id: processedImage.id,
          processedUrl: processedImage.processedUrl
        }
      });
    }
    
    // Clean up temporary file if it was saved
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process image: ' + error.message
    });
  }
};

/**
 * Get all processed images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllImages = (req, res) => {
  try {
    // Format images for response
    const images = processedImages.map(img => ({
      id: img.id,
      url: img.processedUrl,
      createdAt: img.createdAt
    }));
    
    res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve images' 
    });
  }
};

/**
 * Get a single processed image by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getImageById = (req, res) => {
  try {
    const { id } = req.params;
    
    const image = processedImages.find(img => img.id === id);
    
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      image: {
        id: image.id,
        url: image.processedUrl,
        createdAt: image.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve image' 
    });
  }
};

module.exports = {
  processImage,
  getAllImages,
  getImageById
};