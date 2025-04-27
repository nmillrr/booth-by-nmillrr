import React from 'react';

/**
 * Card component for content containers
 */
const Card = ({ 
  children, 
  title, 
  className = '', 
  titleClassName = '',
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      {...props}
    >
      {title && (
        <h2 className={`text-xl font-semibold text-gray-700 mb-4 ${titleClassName}`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card;