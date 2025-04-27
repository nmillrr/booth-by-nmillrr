/**
 * Serverless function for serving processed images by ID
 */
const path = require('path');
const fs = require('fs');
const os = require('os');

// Mock storage for processed images in serverless environment
// In a real application, you would use a database or object storage like S3
const processedImages = new Map();

module.exports = async (req, res) => {
  const id = req.query.id;
  
  try {
    // In a real application, you would fetch the image from a database or object storage
    const image = processedImages.get(id);
    
    if (!image) {
      // Check if the image is in temporary storage
      const uploadsDir = path.join(os.tmpdir(), 'uploads');
      const imagePath = path.join(uploadsDir, `processed_${id}.jpeg`);
      
      if (fs.existsSync(imagePath)) {
        const buffer = fs.readFileSync(imagePath);
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        // Send the image
        return res.send(buffer);
      }
      
      return res.status(404).json({
        success: false,
        error: {
          message: 'Image not found'
        }
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send the image
    res.send(image);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to serve image'
      }
    });
  }
};