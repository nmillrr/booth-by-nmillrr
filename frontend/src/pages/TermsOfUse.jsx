import React from 'react';

/**
 * Terms of Use page component
 */
export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Use</h1>
        
        <div className="prose prose-indigo max-w-none">
          <p className="text-lg mb-6">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Agreement to Terms</h2>
          <p className="mb-4">
            By accessing and using Photo Booth Magic, you agree to be bound by these Terms of Use. 
            If you do not agree to these Terms, you should not use our service.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Description of Service</h2>
          <p className="mb-4">
            Photo Booth Magic is a web application that allows users to upload and process photos with 
            various filters and effects. The service is provided "as is" and may be updated or modified at any time.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">User Responsibilities</h2>
          <p className="mb-4">
            When using our service, you agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Only upload content that you own or have the rights to use</li>
            <li className="mb-2">Not upload any content that is illegal, offensive, or violates the rights of others</li>
            <li className="mb-2">Not attempt to reverse engineer, modify, or tamper with our service</li>
            <li className="mb-2">Use the service for personal, non-commercial purposes only unless explicitly authorized</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Intellectual Property</h2>
          <p className="mb-4">
            You retain all rights to your original images. We do not claim ownership of any content you upload to our service.
          </p>
          <p className="mb-4">
            All aspects of the Photo Booth Magic service, including but not limited to the design, text, graphics, 
            logo, and software, are owned by us and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, including without limitation, loss of profits, 
            data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Your use or inability to use the service</li>
            <li className="mb-2">Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
            <li className="mb-2">Any interruption or cessation of transmission to or from the service</li>
            <li className="mb-2">Any bugs, viruses, or the like that may be transmitted to or through our service</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of any changes by 
            updating the "Last Updated" date. Your continued use of the service after such modifications 
            will constitute your acknowledgment of the modified Terms and agreement to abide by them.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by the laws of [Your Jurisdiction], without respect to its conflict of law principles.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at: terms@photoboothmagic.example.com
          </p>
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