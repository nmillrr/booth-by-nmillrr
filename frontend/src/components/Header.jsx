import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCamera } from 'react-icons/fi';

/**
 * Header component with navigation links
 */
const Header = () => {
  const location = useLocation();
  
  // Don't show header on landing page
  if (location.pathname === '/') {
    return null;
  }
  
  return (
    <header className="bg-white shadow-sm py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          to="/"
          className="flex items-center text-blue-600 font-bold text-xl"
        >
          <FiCamera className="mr-2" />
          Photo Booth
        </Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                to="/upload"
                className={`text-sm ${location.pathname === '/upload' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Upload
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;