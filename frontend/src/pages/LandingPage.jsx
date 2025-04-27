import React from 'react';
import { Link } from 'react-router-dom';
import { FiCamera } from 'react-icons/fi';

/**
 * Landing page with upload button
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-xl mx-auto">
        <div className="mb-6">
          <FiCamera className="inline-block text-blue-600 w-16 h-16 md:w-24 md:h-24" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Photo Booth App
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Transform your photos with our easy-to-use photo processing tools
        </p>
        
        <Link 
          to="/upload" 
          className="inline-block bg-blue-600 text-white text-lg font-medium py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
        >
          Upload Photo
        </Link>
        
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-gray-500">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full mr-2 shadow-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Easy to use</span>
          </div>
          
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full mr-2 shadow-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Instant results</span>
          </div>
          
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full mr-2 shadow-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Free download</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;