import { Metadata } from 'next';
import HomeBots from '@/components/homeBots';
import Getstarted from '@/components/Btn/Getstarted-home';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'AI Image Tools for LORA | Free Processing',
  description:
    'Free AI tools for LORA training images. Upscale quality, uncrop composition, and convert to squares. Perfect for 20-50 image datasets.',

  keywords:
    'LORA training, AI image processing, image dataset preparation, upscaling for LORA, image uncropping, square conversion, LORA model training, AI fine-tuning',
  openGraph: {
    title:
      'AI Image Processing Tools for LORA Training | Free Upscale, Uncrop & Square',
    description:
      'Prepare perfect LORA training datasets: Upscale for quality, uncrop for composition, and convert to squares. Ideal for processing 20-50 training images with AI technology - completely free.',
    type: 'website',
    url: 'https://freesize.vercel.app',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Image Processing Tools for LORA Training',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Image Processing for LORA Training',
    description:
      'Process your LORA training images with AI technology. Perfect for preparing 20-50 image datasets - completely free.',
    images: ['https://freesize.vercel.app/og-image.png'],
  },
  alternates: {
    canonical: 'https://freesize.vercel.app',
  },
  other: {
    'google-adsense-account': 'ca-pub-7791415629101587',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FreeSizeAI - LORA Training Image Processor',
  description:
    'Free AI-powered tools for preparing LORA training image datasets. Process 20-50 images with upscaling, uncropping, and square conversion.',
  applicationCategory: 'AI Image Processing',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'AI image upscaling for LORA training',
    'AI-powered image uncropping',
    'Automatic square conversion for consistent datasets',
    'Optimized for 20-50 image LORA training sets',
  ],
};

export default function Home() {
  return (
    <>
      <Script
        id="schema-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="h-full bg-gray-100 dark:bg-[#141414] transition-colors duration-500">
        <main className="flex flex-col items-center justify-center text-center md:px-4 md:py-20 mt-16">
          <h1 className="font-extrabold text-5xl md:text-7xl lg:text-8xl text-gray-900 dark:text-white transition-colors duration-500">
            Enhance Images with AI
          </h1>
          <h2 className="mt-4 font-semibold text-4xl md:text-6xl lg:text-7xl text-gray-700 dark:text-gray-300 transition-colors duration-500">
            <span className="text-2xl md:text-4xl lg:text-5xl">for</span>{' '}
            <span className="text-5xl md:text-7xl lg:text-8xl text-blue-500 dark:text-teal-400">
              Free
            </span>
          </h2>
          <p className="mt-6 text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl">
            Upscale resolution up to 4x, uncrop images with advanced AI
            generation, and create perfect square conversions for consistent
            training. Our free tools optimize your LORA training datasets with
            state-of-the-art AI technology. Ideal for processing 20-50
            high-quality images for model training.
          </p>
          <Getstarted targetId="homebots" />
          <div className="mt-32" id="homebots">
            <HomeBots />
          </div>
        </main>
      </div>
    </>
  );
}
