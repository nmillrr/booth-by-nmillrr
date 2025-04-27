import React from 'react';
import Header from './Header';

/**
 * Main application layout with common elements
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Photo Booth App
        </div>
      </footer>
    </div>
  );
};

export default Layout;