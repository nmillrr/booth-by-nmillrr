import React from 'react';

/**
 * Navigation bar component
 */
const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="text-xl font-bold text-blue-600">Photo Booth</div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">
                Home
              </a>
              <a href="/gallery" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">
                Gallery
              </a>
              <a href="/about" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">
                About
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;