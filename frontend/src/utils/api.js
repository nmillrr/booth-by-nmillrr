/**
 * API utilities for interacting with the backend
 */

/**
 * Custom API error with additional properties
 */
export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Adds timeout functionality to a promise
 * @param {Promise} promise - The promise to add timeout to
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} - Promise with timeout
 */
export function withTimeout(promise, ms = 30000) {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new ApiError('Request timed out', 408));
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

/**
 * Retry logic wrapper for API calls
 * @param {Function} fn - The API function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that will be resolved after retries
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    shouldRetry = (error) => error.status >= 500 || error.status === 408,
    onRetry = () => {}
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If it's a retry attempt, wait before trying again
      if (attempt > 0) {
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        onRetry({ attempt, maxRetries, error: lastError });
      }
      
      // Attempt the API call
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Only retry if the error matches the retry condition
      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }
    }
  }
}

/**
 * Process an image using XMLHttpRequest for upload progress
 * @param {File} file - The image file to process
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Processing result
 */
export function uploadAndProcessImage(file, options = {}) {
  const {
    endpoint = (process.env.NODE_ENV === 'production' ? '/api/process' : 'http://localhost:3001/api/process'),
    onProgress = () => {},
    timeout = 60000,
    retryOptions = {}
  } = options;

  const uploadFn = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      // Add the file to the form data
      formData.append('image', file);
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
      
      // Handle the response
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new ApiError('Failed to parse response', xhr.status));
          }
        } else {
          let errorMessage = 'Upload failed';
          let details = null;
          
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.error?.message || errorMessage;
            details = response.error;
          } catch (e) {
            // If we can't parse the error, just use the status text
            errorMessage = xhr.statusText || errorMessage;
          }
          
          reject(new ApiError(errorMessage, xhr.status, details));
        }
      };
      
      // Handle network errors
      xhr.onerror = () => {
        reject(new ApiError('Network error', 0));
      };
      
      // Handle timeout
      xhr.timeout = timeout;
      xhr.ontimeout = () => {
        reject(new ApiError('Request timed out', 408));
      };
      
      // Open and send the request
      xhr.open('POST', endpoint, true);
      xhr.send(formData);
    });
  };
  
  // Return the upload function wrapped with retry logic
  return withRetry(uploadFn, {
    ...retryOptions,
    onRetry: (info) => {
      console.log(`Retrying upload attempt ${info.attempt} of ${info.maxRetries}`);
      if (retryOptions.onRetry) {
        retryOptions.onRetry(info);
      }
    }
  });
}

/**
 * Process an image using the Fetch API (no progress tracking)
 * @param {File} file - The image file to process
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Processing result
 */
export function processImageWithFetch(file, options = {}) {
  const {
    endpoint = (process.env.NODE_ENV === 'production' ? '/api/process' : 'http://localhost:3001/api/process'),
    timeout = 60000,
    retryOptions = {}
  } = options;

  const fetchFn = async () => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await withTimeout(
      fetch(endpoint, {
        method: 'POST',
        body: formData
      }),
      timeout
    );
    
    if (!response.ok) {
      let errorMessage = 'Upload failed';
      let details = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        details = errorData.error;
      } catch (e) {
        // If we can't parse the error, just use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new ApiError(errorMessage, response.status, details);
    }
    
    return response.json();
  };
  
  // Return the fetch function wrapped with retry logic
  return withRetry(fetchFn, retryOptions);
}

/**
 * Process an image as JSON (using base64 encoding)
 * @param {File} file - The image file to process
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Processing result
 */
export function processImageAsJson(file, options = {}) {
  const {
    endpoint = (process.env.NODE_ENV === 'production' ? '/api/process-image' : 'http://localhost:3001/api/process-image'),
    timeout = 60000,
    retryOptions = {}
  } = options;

  const jsonFn = async () => {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    const response = await withTimeout(
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64
        })
      }),
      timeout
    );
    
    if (!response.ok) {
      let errorMessage = 'Upload failed';
      let details = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        details = errorData.error;
      } catch (e) {
        // If we can't parse the error, just use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new ApiError(errorMessage, response.status, details);
    }
    
    return response.json();
  };
  
  // Return the JSON function wrapped with retry logic
  return withRetry(jsonFn, retryOptions);
}

/**
 * Convert a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Get all processed images
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Images result
 */
export function getProcessedImages(options = {}) {
  const {
    endpoint = (process.env.NODE_ENV === 'production' ? '/api/images' : 'http://localhost:3001/api/images'),
    timeout = 30000,
    retryOptions = {}
  } = options;

  const fetchFn = async () => {
    const response = await withTimeout(
      fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }),
      timeout
    );
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch images';
      let details = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        details = errorData.error;
      } catch (e) {
        // If we can't parse the error, just use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new ApiError(errorMessage, response.status, details);
    }
    
    return response.json();
  };
  
  // Return the fetch function wrapped with retry logic
  return withRetry(fetchFn, retryOptions);
}

/**
 * Get a single processed image by ID
 * @param {string} id - The image ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Image result
 */
export function getProcessedImageById(id, options = {}) {
  const {
    endpoint = (process.env.NODE_ENV === 'production' 
      ? `/api/images/${id}` 
      : `http://localhost:3001/api/images/${id}`),
    timeout = 30000,
    retryOptions = {}
  } = options;

  const fetchFn = async () => {
    const response = await withTimeout(
      fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }),
      timeout
    );
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch image';
      let details = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        details = errorData.error;
      } catch (e) {
        // If we can't parse the error, just use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new ApiError(errorMessage, response.status, details);
    }
    
    return response.json();
  };
  
  // Return the fetch function wrapped with retry logic
  return withRetry(fetchFn, retryOptions);
}