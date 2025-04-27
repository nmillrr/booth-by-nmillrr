import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiAlertCircle } from 'react-icons/fi';

// File size limit: 10MB in bytes
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Drag and drop file upload component with validation
 */
const DropZone = ({ onImageSelect, className = '' }) => {
  const [validationError, setValidationError] = useState(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 10MB.';
    }

    // Check file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return 'Unsupported file type. Please upload a JPEG or PNG image.';
    }

    return null;
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate the file
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }
    
    // Clear any previous errors
    setValidationError(null);
    
    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result;
      onImageSelect(imageDataUrl, file);
    };
    
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const onDropRejected = useCallback(() => {
    setValidationError('File rejected. Please check file type and size.');
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: MAX_FILE_SIZE
  });

  // Border color based on drag state or validation error
  let borderColor = 'border-gray-300';
  if (isDragActive) borderColor = 'border-blue-400';
  if (isDragReject || validationError) borderColor = 'border-red-400';

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 hover:bg-gray-50`}
      >
        <input {...getInputProps()} />
        
        <FiUpload className="mx-auto text-blue-500 mb-4 w-12 h-12" />
        
        {isDragActive ? (
          <p className="text-lg text-blue-500 font-medium">Drop the image here...</p>
        ) : isDragReject ? (
          <p className="text-lg text-red-500 font-medium">Unsupported file type!</p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 font-medium mb-2">
              Drag & drop an image here
            </p>
            <p className="text-gray-500">
              or click to select an image
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: JPEG, PNG
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum file size: 10MB
            </p>
          </div>
        )}
      </div>
      
      {validationError && (
        <div className="mt-2 flex items-start text-red-500 text-sm">
          <FiAlertCircle className="mr-1 mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

export default DropZone;