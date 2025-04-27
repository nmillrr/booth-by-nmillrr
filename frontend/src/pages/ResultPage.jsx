import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiRefreshCw, FiHome, FiShare2, FiCheckCircle } from 'react-icons/fi';
import { usePhoto, PROCESSING_STATUS } from '../context/PhotoContext';
import Button from '../components/Button';
import Card from '../components/Card';

/**
 * Result page displaying processed photo
 */
const ResultPage = () => {
  const { processedPhoto, fileName, resetPhotos, status, processedImageId } = usePhoto();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // If there's no processed photo, redirect to upload
  useEffect(() => {
    if (!processedPhoto || status !== PROCESSING_STATUS.SUCCESS) {
      navigate('/upload');
    }
  }, [processedPhoto, navigate, status]);

  // Handle download of processed image
  const handleDownload = () => {
    try {
      // Create a link element
      const link = document.createElement('a');
      link.href = processedPhoto;
      
      // Generate a filename - either use original filename or a default
      const downloadName = fileName 
        ? `processed_${fileName.replace(/\.[^/.]+$/, '')}.jpg`
        : `processed_photo_${new Date().toISOString().slice(0, 10)}.jpg`;
        
      link.download = downloadName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success state
      setDownloadSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle restart - go back to upload
  const handleRestart = () => {
    resetPhotos();
    navigate('/upload');
  };

  // Handle sharing (where supported)
  const handleShare = async () => {
    if (navigator.share && processedPhoto) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(processedPhoto);
        const blob = await response.blob();
        const file = new File([blob], fileName || 'processed-image.jpg', { type: blob.type });
        
        await navigator.share({
          title: 'My Processed Photo',
          text: 'Check out this photo I processed!',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to download if sharing fails
        handleDownload();
      }
    } else {
      // Fallback for browsers without share API
      handleDownload();
    }
  };

  if (!processedPhoto) return null;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gray-50 p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <FiCheckCircle className="text-green-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Processing Complete!
          </h1>
          <p className="text-gray-600">
            Here's your processed photo. You can download it or try another one.
          </p>
          {processedImageId && (
            <p className="text-xs text-gray-400 mt-1">ID: {processedImageId}</p>
          )}
        </div>
        
        <div className="border rounded-lg overflow-hidden mb-6 bg-gray-50">
          {imageError ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FiRefreshCw className="w-10 h-10 mb-2" />
              <p>Image failed to load</p>
              <button 
                className="mt-2 text-blue-500 hover:text-blue-600"
                onClick={() => setImageError(false)}
              >
                Try again
              </button>
            </div>
          ) : (
            <img 
              src={processedPhoto} 
              alt="Processed" 
              className="w-full h-auto max-h-96 object-contain"
              onError={handleImageError}
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button 
            variant="primary" 
            onClick={handleDownload}
            className="flex items-center justify-center relative"
          >
            {downloadSuccess ? (
              <>
                <FiCheckCircle className="mr-2" />
                Downloaded!
              </>
            ) : (
              <>
                <FiDownload className="mr-2" />
                Download
              </>
            )}
          </Button>
          
          {navigator.share ? (
            <Button 
              variant="secondary" 
              onClick={handleShare}
              className="flex items-center justify-center"
            >
              <FiShare2 className="mr-2" />
              Share
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              onClick={handleRestart}
              className="flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2" />
              Try Another Photo
            </Button>
          )}
        </div>
        
        {navigator.share && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="w-full flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2" />
              Try Another Photo
            </Button>
          </div>
        )}
        
        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FiHome className="mr-1" />
            Back to Home
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ResultPage;