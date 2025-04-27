import React from 'react';

/**
 * Animated loader component with customizable message
 */
const Loader = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-lg animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;