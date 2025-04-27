import React from 'react';

/**
 * Privacy Policy page component
 */
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-indigo max-w-none">
          <p className="text-lg mb-6">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Introduction</h2>
          <p className="mb-4">
            At Booth by nmillrr, we value your privacy and are committed to protecting your personal information. 
            This Privacy Policy explains how we handle any information when you use our photo processing service.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Process</h2>
          <p className="mb-4">
            <strong>Images:</strong> When you upload photos to our service, we temporarily process these images to 
            apply the filters and effects you've selected. These images are:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Only used for the purpose of applying the selected photo effects</li>
            <li className="mb-2">Automatically deleted from our servers within 24 hours of processing</li>
            <li className="mb-2">Never shared with third parties</li>
            <li className="mb-2">Never used for training AI models or any other purpose</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Technical Data</h2>
          <p className="mb-4">
            Our service may collect standard technical information that your browser sends when you visit our site. This includes:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">IP address (anonymized)</li>
            <li className="mb-2">Browser type and version</li>
            <li className="mb-2">Operating system</li>
            <li className="mb-2">Referral source</li>
          </ul>
          <p className="mb-4">
            This information is used solely for the purpose of maintaining and improving our service and is not used to personally identify users.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Store Your Data</h2>
          <p className="mb-4">
            <strong>Temporary Image Storage:</strong> Images are stored temporarily (maximum 24 hours) to allow for processing 
            and download of your edited photos. After this period, they are automatically and permanently deleted from our servers.
          </p>
          <p className="mb-4">
            <strong>Serverless Environment:</strong> In our serverless deployment, images are processed entirely in memory and 
            are not persisted beyond the lifecycle of the processing function, which typically completes within seconds.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Request deletion of your images before the automatic 24-hour deletion</li>
            <li className="mb-2">Access information about what data is being processed</li>
            <li className="mb-2">Object to the processing of your data</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
        </div>
        
        <div className="mt-8 border-t pt-4">
          <a href="/" className="text-indigo-600 hover:text-indigo-800 transition-colors">
            &larr; Back to Photo Booth
          </a>
        </div>
      </div>
    </div>
  );
}