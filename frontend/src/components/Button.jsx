import React from 'react';

/**
 * Reusable button component
 */
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = "font-medium py-2 px-4 rounded transition duration-300";
  
  const variantStyles = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-500 hover:bg-green-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;