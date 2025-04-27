import React, { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import ImageUploader from '../components/ImageUploader';
import Button from '../components/Button';
import { processImage } from '../utils/api';

/**
 * Home page component
 */
const HomePage = () => {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = (imageData) => {
    setImage(imageData);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!image) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const data = await processImage(image);
      setResult(data);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Error processing image:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Photo Booth App</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Upload Image">
            <ImageUploader 
              onImageSelect={handleImageSelect}
              className="mb-4"
            />
            
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={!image || processing}
              className="w-full"
            >
              {processing ? 'Processing...' : 'Process Image'}
            </Button>
            
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </Card>
          
          <Card title="Result">
            <div className="border-2 border-gray-200 rounded-lg p-4 h-64 flex items-center justify-center">
              {result ? (
                <div className="text-center">
                  <p className="text-green-500 font-medium">{result.message}</p>
                  <p className="mt-2 text-sm text-gray-500">ID: {result.result?.id}</p>
                </div>
              ) : (
                <p className="text-gray-400">Processed image will appear here</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;