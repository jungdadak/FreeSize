export const dynamic = 'force-static';
import React from 'react';
import DragDrop from '@/components/DragDrop';
import { Camera, Image as LucidImage, Upload, Wand2 } from 'lucide-react';

export default function QuickstartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/20">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto pt-16 px-4">
        <h1 className="text-3xl font-bold text-center mb-4">
          Get Started in 3 Simple Steps
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-12">
          Transform your images in seconds with our easy-to-use tool
        </p>
      </div>

      {/* Steps Section */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <Upload className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">1. Upload Your Image</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Drag and drop or select your image file. We support JPG and PNG
              formats up to 10MB.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <Wand2 className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">2. Choose Options</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Select your desired enhancement options and adjustments for the
              perfect result.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <LucidImage className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">3. Download Result</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Get your enhanced image instantly and download in your preferred
              format.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Ready to Transform Your Image?
          </h2>
          <DragDrop />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              High Quality Results
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Our advanced algorithms ensure the highest quality output while
              preserving image details.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Batch Processing
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Process multiple images at once to save time and increase
              productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
