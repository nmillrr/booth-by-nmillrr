import React from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';

/**
 * About page with project information
 */
const AboutPage = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">About Photo Booth</h1>
        
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Project Overview</h2>
          <p className="text-gray-600 mb-4">
            Photo Booth is a modern web application for processing and enhancing images with various filters and effects.
            Built with React, Vite, and Express, it provides a fast and responsive experience for users.
          </p>
          <p className="text-gray-600">
            This project demonstrates the use of modern web technologies and best practices for building
            scalable and maintainable applications.
          </p>
        </Card>
        
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Key Features</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Upload and process images with various filters</li>
            <li>View and manage processed images in a gallery</li>
            <li>Responsive design that works on all devices</li>
            <li>Modern UI built with Tailwind CSS</li>
            <li>Secure API for image processing</li>
          </ul>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Technologies Used</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Frontend</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>React 19</li>
                <li>Vite</li>
                <li>Tailwind CSS</li>
                <li>ESLint & Prettier</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Backend</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Node.js</li>
                <li>Express.js</li>
                <li>RESTful API</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AboutPage;