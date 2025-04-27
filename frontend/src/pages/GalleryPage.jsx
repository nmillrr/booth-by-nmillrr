import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { getGalleryImages } from '../utils/api';

/**
 * Gallery page to display processed images
 */
const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        // This would fetch real data in a production app
        const data = await getGalleryImages();
        setImages(data);
      } catch (err) {
        setError('Failed to load gallery images');
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Your Gallery</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading gallery...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No images in your gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map(image => (
              <Card key={image.id} className="overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.title || 'Gallery image'} 
                  className="w-full h-48 object-cover object-center"
                />
                <div className="mt-2">
                  <h3 className="font-medium text-gray-800">{image.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-500">{new Date(image.createdAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GalleryPage;