import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhoto, PROCESSING_STATUS } from '../context/PhotoContext';
import Loader from '../components/Loader';
import Card from '../components/Card';
import Button from '../components/Button';
import { FiUploadCloud, FiAlertTriangle, FiServer } from 'react-icons/fi';

/**
 * Processing page with animated loader and upload progress
 */
const ProcessingPage = () => {
  const { 
    originalPhoto, 
    processPhoto, 
    status,
    error, 
    uploadProgress, 
    fileName,
    processedPhoto
  } = usePhoto();
  
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Processing messages by status
  const messages = {
    [PROCESSING_STATUS.UPLOADING]: [
      "Uploading your photo...",
      "Preparing to upload...",
      "Sending to server...",
      "Transmitting image data..."
    ],
    [PROCESSING_STATUS.PROCESSING]: [
      "Processing your photo...",
      "Applying enhancements...",
      "Almost there...",
      "Working our magic...",
      "Making your photo look awesome...",
      "Optimizing your image...",
      "Analyzing pixels..."
    ]
  };

  // Function to update message randomly - memoized to prevent recreating on each render
  const updateRandomMessage = useCallback(() => {
    if (status === PROCESSING_STATUS.UPLOADING || status === PROCESSING_STATUS.PROCESSING) {
      const currentMessages = messages[status];
      const newMessage = currentMessages[Math.floor(Math.random() * currentMessages.length)];
      setMessage(newMessage);
    }
  }, [status, messages]);

  // Update message periodically
  useEffect(() => {
    // Set initial message
    updateRandomMessage();
    
    // Update message every 4 seconds for a dynamic feel
    const interval = setInterval(() => {
      updateRandomMessage();
    }, 4000);
    
    return () => clearInterval(interval);
  }, [updateRandomMessage]);
  
  // Track elapsed time
  useEffect(() => {
    let timer;
    if (status === PROCESSING_STATUS.UPLOADING || status === PROCESSING_STATUS.PROCESSING) {
      // Reset elapsed time when we start processing
      setElapsedTime(0);
      
      // Start a timer that updates every second
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  // Auto-navigate to the result page when processing completes successfully
  useEffect(() => {
    if (status === PROCESSING_STATUS.SUCCESS && processedPhoto) {
      // Short delay before navigating to ensure state is fully updated
      const navigationTimeout = setTimeout(() => {
        navigate('/result');
      }, 500);
      
      return () => clearTimeout(navigationTimeout);
    }
  }, [status, processedPhoto, navigate]);

  // Start processing when component mounts
  useEffect(() => {
    // If there's no photo to process, go back to upload
    if (!originalPhoto) {
      navigate('/upload');
      return;
    }

    // Don't restart processing if we're already in a processing state
    if (status === PROCESSING_STATUS.IDLE) {
      processPhoto();
    }
    
  }, [originalPhoto, processPhoto, navigate, status]);

  // Handle retry
  const handleRetry = () => {
    processPhoto();
  };

  // If there's an error, show it
  if (error || status === PROCESSING_STATUS.ERROR) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gray-50 p-4">
        <Card className="w-full max-w-md mx-auto text-center">
          <div className="flex justify-center mb-4">
            <FiAlertTriangle className="text-red-500 w-16 h-16" />
          </div>
          
          <h1 className="text-2xl font-bold text-red-600 mb-4">Processing Error</h1>
          <p className="text-gray-700 mb-6">{error || 'Something went wrong during processing.'}</p>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleRetry}
              className="w-full"
            >
              Try Again
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigate('/upload')}
              className="w-full"
            >
              Upload Different Photo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto text-center py-12">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {status === PROCESSING_STATUS.UPLOADING ? 'Uploading' : 'Processing'} Your Photo
        </h2>
        
        {status === PROCESSING_STATUS.UPLOADING && (
          <div className="mb-8 flex justify-center">
            <FiUploadCloud className="text-blue-500 w-16 h-16 animate-pulse" />
          </div>
        )}
        
        {status === PROCESSING_STATUS.PROCESSING && (
          <div className="mb-8">
            <Loader message={message} />
          </div>
        )}
        
        <div className="mb-6">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>
              {fileName ? `${fileName}` : 'Image'}
            </span>
            <span>
              {status === PROCESSING_STATUS.UPLOADING ? 'Uploading' : 'Processing'} • {uploadProgress}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
          {status === PROCESSING_STATUS.UPLOADING ? (
            <FiUploadCloud className="text-blue-500" />
          ) : (
            <FiServer className="text-blue-500" />
          )}
          <p>{message}</p>
        </div>
        
        <div className="text-gray-400 text-sm mt-4 flex flex-col gap-1">
          <p>This might take a moment. Please don't refresh the page.</p>
          {elapsedTime > 0 && (
            <p>Time elapsed: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProcessingPage;