import { createContext, useContext, useState, useCallback } from 'react';
import { 
  uploadAndProcessImage, 
  processImageWithFetch,
  processImageAsJson
} from '../utils/api';

// Create context
const PhotoContext = createContext(null);

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

// Upload states
export const UPLOAD_STATES = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

/**
 * Photo provider component
 */
export function PhotoProvider({ children }) {
  // State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    setFile(null);
    setPreview(null);
    setUploadState(UPLOAD_STATES.IDLE);
    setUploadProgress(0);
    setProcessedImage(null);
    setError(null);
    setRetryCount(0);
  }, []);

  /**
   * Validate file
   */
  const validateFile = useCallback((file) => {
    // Check if file exists
    if (!file) {
      throw new Error('No file selected');
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.map(type => type.split('/')[1]).join(', ')}`);
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    return true;
  }, []);

  /**
   * Set file and create preview
   */
  const handleFileSelect = useCallback(async (file) => {
    try {
      setUploadState(UPLOAD_STATES.VALIDATING);
      setError(null);
      
      // Validate file
      validateFile(file);
      
      // Create preview
      const preview = URL.createObjectURL(file);
      
      // Update state
      setFile(file);
      setPreview(preview);
      setUploadState(UPLOAD_STATES.IDLE);
      
      return { file, preview };
    } catch (error) {
      setError(error.message);
      setUploadState(UPLOAD_STATES.ERROR);
      throw error;
    }
  }, [validateFile]);

  /**
   * Upload and process image with retry logic and fallbacks
   */
  const uploadAndProcess = useCallback(async (selectedFile = file) => {
    if (!selectedFile) {
      setError('No file selected');
      setUploadState(UPLOAD_STATES.ERROR);
      return;
    }

    try {
      // Validate file
      validateFile(selectedFile);
      
      // Set upload state
      setUploadState(UPLOAD_STATES.UPLOADING);
      setUploadProgress(0);
      setError(null);
      
      // Try the main upload method first (XMLHttpRequest with progress)
      try {
        setUploadState(UPLOAD_STATES.UPLOADING);
        
        const result = await uploadAndProcessImage(selectedFile, {
          endpoint: '/api/process',
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
          retryOptions: {
            maxRetries: 3,
            retryDelay: 1000,
            onRetry: ({ attempt }) => {
              setRetryCount(attempt);
              console.log(`Retrying upload, attempt ${attempt}`);
            }
          }
        });
        
        setUploadState(UPLOAD_STATES.PROCESSING);
        
        // Handle success
        setProcessedImage(result);
        setUploadState(UPLOAD_STATES.SUCCESS);
        
        return result;
      } catch (xhrError) {
        console.error('XHR upload failed, trying fetch API:', xhrError);
        
        // If the main method fails, try the fetch API
        try {
          setUploadState(UPLOAD_STATES.UPLOADING);
          setUploadProgress(0);
          
          const result = await processImageWithFetch(selectedFile, {
            endpoint: '/api/process',
            retryOptions: {
              maxRetries: 2,
              retryDelay: 1500,
              onRetry: ({ attempt }) => {
                setRetryCount(attempt);
                console.log(`Retrying fetch upload, attempt ${attempt}`);
              }
            }
          });
          
          setUploadState(UPLOAD_STATES.PROCESSING);
          
          // Handle success
          setProcessedImage(result);
          setUploadState(UPLOAD_STATES.SUCCESS);
          
          return result;
        } catch (fetchError) {
          console.error('Fetch upload failed, trying JSON/base64:', fetchError);
          
          // If fetch API fails too, try JSON/base64 as last resort
          setUploadState(UPLOAD_STATES.UPLOADING);
          setUploadProgress(0);
          
          const result = await processImageAsJson(selectedFile, {
            endpoint: '/api/process-image',
            retryOptions: {
              maxRetries: 1,
              retryDelay: 2000,
              onRetry: ({ attempt }) => {
                setRetryCount(attempt);
                console.log(`Retrying JSON upload, attempt ${attempt}`);
              }
            }
          });
          
          setUploadState(UPLOAD_STATES.PROCESSING);
          
          // Handle success
          setProcessedImage(result);
          setUploadState(UPLOAD_STATES.SUCCESS);
          
          return result;
        }
      }
    } catch (error) {
      // If all methods fail, set error state
      console.error('All upload methods failed:', error);
      setError(error.message || 'Upload failed');
      setUploadState(UPLOAD_STATES.ERROR);
      throw error;
    }
  }, [file, validateFile]);

  /**
   * Retry upload
   */
  const retryUpload = useCallback(() => {
    if (file) {
      return uploadAndProcess(file);
    } else {
      setError('No file to retry');
      return Promise.reject(new Error('No file to retry'));
    }
  }, [file, uploadAndProcess]);

  // Context value
  const value = {
    file,
    preview,
    uploadState,
    uploadProgress,
    processedImage,
    error,
    retryCount,
    handleFileSelect,
    uploadAndProcess,
    retryUpload,
    resetState
  };

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  );
}

/**
 * Custom hook to use photo context
 */
export function usePhoto() {
  const context = useContext(PhotoContext);
  
  if (context === null) {
    throw new Error('usePhoto must be used within a PhotoProvider');
  }
  
  return context;
}