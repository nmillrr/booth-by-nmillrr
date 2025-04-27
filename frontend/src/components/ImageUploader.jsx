import { useRef, useState } from 'react';
import { usePhoto, UPLOAD_STATES } from '../context/PhotoContext';
import { 
  FadeTransition, 
  SlideTransition, 
  SLIDE_DIRECTIONS, 
  LoadingAnimation 
} from './animations';

/**
 * Image upload component with preview and progress
 */
export default function ImageUploader() {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  
  const {
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
  } = usePhoto();

  /**
   * Handle file input change
   */
  const handleFileInputChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        await handleFileSelect(file);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  /**
   * Trigger file input click
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle file drop
   */
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      try {
        await handleFileSelect(e.dataTransfer.files[0]);
      } catch (error) {
        console.error('Error selecting file:', error);
      }
    }
  };

  /**
   * Handle upload click
   */
  const handleUploadClick = async () => {
    try {
      await uploadAndProcess();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  /**
   * Handle retry click
   */
  const handleRetryClick = async () => {
    try {
      await retryUpload();
    } catch (error) {
      console.error('Error retrying upload:', error);
    }
  };

  /**
   * Render upload button
   */
  const renderActionButton = () => {
    switch (uploadState) {
      case UPLOAD_STATES.IDLE:
        return file ? (
          <button
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md font-medium shadow-sm hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleUploadClick}
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">✨</span>
              Create Magic
            </span>
          </button>
        ) : null;
      
      case UPLOAD_STATES.UPLOADING:
        return null; // We're showing the LoadingAnimation component instead
      
      case UPLOAD_STATES.PROCESSING:
        return null; // We're showing the LoadingAnimation component instead
      
      case UPLOAD_STATES.ERROR:
        return (
          <button
            className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md font-medium shadow-sm hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            onClick={handleRetryClick}
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">🔄</span>
              Try Again
            </span>
          </button>
        );
      
      case UPLOAD_STATES.SUCCESS:
        return (
          <button
            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-md font-medium shadow-sm hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            onClick={resetState}
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">🪄</span>
              Create Another Masterpiece
            </span>
          </button>
        );
      
      default:
        return null;
    }
  };

  // Determine whether to show loading animation
  const isLoading = uploadState === UPLOAD_STATES.UPLOADING || uploadState === UPLOAD_STATES.PROCESSING;
  
  // Generate appropriate loading message based on state
  const getLoadingMessage = () => {
    if (uploadState === UPLOAD_STATES.UPLOADING) {
      return retryCount > 0 ? `Retrying upload (${retryCount})` : 'Uploading your image';
    } else if (uploadState === UPLOAD_STATES.PROCESSING) {
      return 'Processing your masterpiece';
    }
    return 'Loading';
  };
  
  // Get CSS classes for the container based on state
  const getContainerClass = () => {
    let classes = "image-uploader p-4 rounded-lg shadow-lg bg-white max-w-md mx-auto relative";
    if (uploadState === UPLOAD_STATES.ERROR) {
      classes += " border-2 border-red-300";
    } else if (uploadState === UPLOAD_STATES.SUCCESS) {
      classes += " border-2 border-green-300";
    }
    return classes;
  };
  
  return (
    <div className={getContainerClass()}>
      {/* Upload area */}
      <FadeTransition 
        show={!preview && uploadState === UPLOAD_STATES.IDLE} 
        duration={400}
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        exitFrom="opacity-100 scale-100"
        exitTo="opacity-0 scale-95"
      >
        <div 
          className={`upload-area border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all duration-300
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleSelectClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="text-4xl mb-4">📸</div>
          <p className="text-lg font-medium text-gray-700 mb-2">Drag & Drop or Click to Select Image</p>
          <p className="text-sm text-gray-500">Accepted formats: JPEG, PNG (Max: 10MB)</p>
        </div>
      </FadeTransition>

      {/* Loading Animation */}
      <FadeTransition 
        show={isLoading} 
        duration={400}
        className="absolute inset-0 flex items-center justify-center bg-white rounded-lg z-10"
      >
        <LoadingAnimation 
          isLoading={isLoading}
          progress={uploadState === UPLOAD_STATES.UPLOADING ? uploadProgress : null}
          message={getLoadingMessage()}
        />
      </FadeTransition>

      {/* Preview */}
      <SlideTransition 
        show={preview && !isLoading} 
        duration={400}
        direction={SLIDE_DIRECTIONS.UP}
        className="w-full flex flex-col items-center"
      >
        <div className="preview-container mb-4 w-full">
          <div className="relative rounded-lg overflow-hidden shadow-md">
            <img 
              src={uploadState === UPLOAD_STATES.SUCCESS && processedImage ? processedImage.result.processedUrl : preview} 
              alt="Preview" 
              className="w-full h-auto object-cover transition-all duration-500"
            />
            
            {uploadState === UPLOAD_STATES.SUCCESS && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="text-4xl mb-2">✨</div>
                <h3 className="text-xl font-bold mb-2">Voilà! Your masterpiece is ready!</h3>
                {processedImage && (
                  <a 
                    href={processedImage.result.processedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 underline"
                  >
                    View full-size image
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </SlideTransition>

      {/* Error message */}
      <SlideTransition 
        show={!!error} 
        duration={300}
        direction={SLIDE_DIRECTIONS.UP}
        className="mb-4"
      >
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      </SlideTransition>

      {/* Action buttons */}
      <FadeTransition 
        show={true} 
        duration={300}
        className="flex flex-col sm:flex-row gap-2 justify-center mt-4"
      >
        <div className="flex-1">
          {renderActionButton()}
        </div>
        
        {file && uploadState !== UPLOAD_STATES.UPLOADING && uploadState !== UPLOAD_STATES.PROCESSING && (
          <button
            className="px-4 py-2 rounded-md text-gray-600 border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
            onClick={resetState}
          >
            {uploadState === UPLOAD_STATES.SUCCESS ? 'New Image' : 'Cancel'}
          </button>
        )}
      </FadeTransition>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="upload-state mt-4 pt-4 border-t text-xs text-gray-500">
          <p>State: {uploadState}</p>
          {retryCount > 0 && <p>Retries: {retryCount}</p>}
        </div>
      )}
    </div>
  );
}