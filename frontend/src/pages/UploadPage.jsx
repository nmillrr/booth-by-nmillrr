import { useState } from 'react';
import { PhotoProvider } from '../context/PhotoContext';
import ImageUploader from '../components/ImageUploader';

/**
 * Page for uploading and processing images
 */
export default function UploadPage() {
  const [testActive, setTestActive] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [testRunning, setTestRunning] = useState(false);
  
  /**
   * Run an end-to-end test of the upload process
   */
  const runEndToEndTest = async () => {
    setTestRunning(true);
    setTestResults({
      status: 'running',
      steps: [],
      errors: []
    });
    
    try {
      // Step 1: Check if backend server is running
      addTestStep('Checking backend server...');
      
      try {
        const response = await fetch('/api');
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        addTestStep('Backend server is running', 'success');
        addTestStep(`Server version: ${data.version || 'unknown'}`);
      } catch (error) {
        addTestStep('Backend server check failed', 'error');
        addTestError(`Server error: ${error.message}`);
        
        setTestResults(prevResults => ({
          ...prevResults,
          status: 'failed'
        }));
        
        setTestRunning(false);
        return;
      }
      
      // Step 2: Try to create a test image
      addTestStep('Creating test image...');
      
      let testImage;
      try {
        // Create a canvas and draw a simple image
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        
        const ctx = canvas.getContext('2d');
        
        // Fill with a gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff9966');
        gradient.addColorStop(1, '#ff5e62');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some shapes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(100, 100, 200, 200);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(440, 150, 80, 0, Math.PI * 2);
        ctx.fill();
        
        // Add text
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Test Image', canvas.width/2, canvas.height/2);
        
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        testImage = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
        
        addTestStep('Test image created successfully', 'success');
        addTestStep(`Image size: ${Math.round(testImage.size / 1024)}KB`);
      } catch (error) {
        addTestStep('Test image creation failed', 'error');
        addTestError(`Image creation error: ${error.message}`);
        
        setTestResults(prevResults => ({
          ...prevResults,
          status: 'failed'
        }));
        
        setTestRunning(false);
        return;
      }
      
      // Step 3: Try to upload and process the image
      addTestStep('Uploading test image...');
      
      try {
        const formData = new FormData();
        formData.append('image', testImage);
        
        const response = await fetch('/api/process', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          let errorMessage = 'Upload failed';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
          } catch (e) {
            // If we can't parse the error, just use the status text
            errorMessage = response.statusText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        
        addTestStep('Image uploaded and processed successfully', 'success');
        addTestStep(`Result ID: ${result.result.id}`);
        
        // Step 4: Try to fetch the processed image
        addTestStep('Fetching processed image...');
        
        const imageUrl = result.result.processedUrl;
        const imageResponse = await fetch(imageUrl);
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch processed image: ${imageResponse.status}`);
        }
        
        addTestStep('Processed image fetched successfully', 'success');
        
        setTestResults(prevResults => ({
          ...prevResults,
          status: 'success',
          processedImageUrl: imageUrl
        }));
      } catch (error) {
        addTestStep('Image upload or processing failed', 'error');
        addTestError(`Upload error: ${error.message}`);
        
        setTestResults(prevResults => ({
          ...prevResults,
          status: 'failed'
        }));
      }
    } catch (error) {
      addTestStep('Test failed with an unexpected error', 'error');
      addTestError(`Unexpected error: ${error.message}`);
      
      setTestResults(prevResults => ({
        ...prevResults,
        status: 'failed'
      }));
    }
    
    setTestRunning(false);
  };
  
  /**
   * Add a step to the test results
   */
  const addTestStep = (message, status = 'info') => {
    setTestResults(prevResults => ({
      ...prevResults,
      steps: [
        ...prevResults.steps,
        {
          id: Date.now(),
          message,
          status,
          timestamp: new Date().toISOString()
        }
      ]
    }));
  };
  
  /**
   * Add an error to the test results
   */
  const addTestError = (message) => {
    setTestResults(prevResults => ({
      ...prevResults,
      errors: [
        ...prevResults.errors,
        {
          id: Date.now(),
          message,
          timestamp: new Date().toISOString()
        }
      ]
    }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">Photo Booth Magic</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Transform your photos with AI-powered magic. Upload your image and watch it turn into a beautiful masterpiece in seconds.</p>
        </div>
        
        {/* Main upload section */}
        <div className="mb-12">
          <PhotoProvider>
            <ImageUploader />
          </PhotoProvider>
        </div>
        
        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Processing</h3>
            <p className="text-gray-600">Your photos transform in seconds with our optimized algorithms.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🪄</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Magic Filters</h3>
            <p className="text-gray-600">Our unique filters bring out the best in every photo.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mobile Friendly</h3>
            <p className="text-gray-600">Works perfectly on any device - upload from your phone, tablet, or computer.</p>
          </div>
        </div>
        
        {/* Test panel - hidden in production */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mb-8">
            <div className="border-b border-gray-200">
              <button 
                onClick={() => setTestActive(!testActive)}
                className="w-full px-4 py-3 text-left flex justify-between items-center"
              >
                <h2 className="text-lg font-medium text-gray-700">End-to-End Test Panel</h2>
                <span className="text-gray-500">
                  {testActive ? '▲' : '▼'}
                </span>
              </button>
            </div>
            
            {testActive && (
              <div className="p-4">
                <button
                  onClick={runEndToEndTest}
                  disabled={testRunning}
                  className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {testRunning ? 'Test Running...' : 'Run End-to-End Test'}
                </button>
                
                {testResults && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      Test Status: 
                      {testResults.status === 'running' && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Running</span>}
                      {testResults.status === 'success' && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Success</span>}
                      {testResults.status === 'failed' && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Failed</span>}
                    </h3>
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Test Steps:</h4>
                      <ul className="border rounded-md overflow-hidden divide-y">
                        {testResults.steps.map((step) => (
                          <li key={step.id} className={`p-2 text-sm ${step.status === 'success' ? 'bg-green-50 text-green-800' : step.status === 'error' ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-800'}`}>
                            {step.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {testResults.errors.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Errors:</h4>
                        <ul className="border border-red-200 rounded-md overflow-hidden divide-y">
                          {testResults.errors.map((error) => (
                            <li key={error.id} className="p-2 text-sm bg-red-50 text-red-800">
                              {error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {testResults.processedImageUrl && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Processed Image:</h4>
                        <div className="border rounded-md p-2">
                          <img
                            src={testResults.processedImageUrl}
                            alt="Processed test image"
                            className="max-w-full h-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Photo Booth Magic ✨ | Made with 💜 by AI & Human collaboration</p>
        </footer>
      </div>
    </div>
  );
}