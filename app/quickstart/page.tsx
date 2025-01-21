import React from 'react';
import { Metadata } from 'next';
import DragDrop from '@/components/DragDrop';
import { Camera, Image as LucidImage, Upload, Wand2 } from 'lucide-react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Quick Start - Prepare LORA Training Images',
  description:
    'Learn how to prepare your LORA training dataset in 3 simple steps. Process 20-50 images with our AI tools for optimal training results.',
  keywords:
    'LORA training guide, dataset preparation, AI image processing tutorial, LORA model training, image preprocessing steps',
  openGraph: {
    title: 'Quick Start - LORA Training Image Processing Made Easy',
    description:
      'Prepare your LORA training dataset in 3 steps. Process 20-50 images with free AI tools for optimal training results.',
    type: 'article',
    url: 'https://freesize.vercel.app/quickstart',
    images: [
      {
        url: '/og-quickstart.png',
        width: 1200,
        height: 630,
        alt: 'LORA Training Image Processing Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Started with LORA Training Image Processing',
    description:
      'Process your LORA training images in 3 simple steps - completely free.',
    images: ['https://freesize.vercel.app/og-quickstart.png'],
  },
  alternates: {
    canonical: 'https://freesize.vercel.app/quickstart',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Process Images for LORA Training',
  description:
    'Prepare your LORA training dataset using AI-powered tools in three simple steps',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Upload Your Training Images',
      text: 'Upload 20-50 images for your LORA training dataset. Supports JPG and PNG formats up to 10MB.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Choose Processing Options',
      text: 'Select enhancement options: upscale for quality, uncrop for better composition, or convert to square format.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Download Processed Images',
      text: 'Get your processed images ready for LORA training, optimized for best results.',
      position: 3,
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'AI Upscaling for LORA',
    },
    {
      '@type': 'HowToTool',
      name: 'AI Uncropping Tool',
    },
    {
      '@type': 'HowToTool',
      name: 'Square Format Converter',
    },
  ],
};

export default function QuickstartPage() {
  return (
    <>
      <Script id="json-ld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

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
              <h3 className="font-semibold text-lg mb-2">
                1. Upload Your Image
              </h3>
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
    </>
  );
}
