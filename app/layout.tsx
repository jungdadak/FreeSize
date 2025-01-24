// RootLayout.tsx
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import { Analytics } from '@vercel/analytics/next';

// Import Swiper's CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ToastContainer from '@/components/Toast/ToastContainer';
import AdComponent from '@/goggleAdsense/adComponent';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://freesize.vercel.app'),
  title: {
    default: 'AI Image Processing Tools for LORA Training',
    template: '%s | FreeSizeAI',
  },
  description:
    'Free AI-powered image processing tools optimized for LORA model training dataset preparation',
  keywords:
    'LORA training, AI image processing, image dataset preparation, upscaling for LORA, image uncropping, square conversion, LORA model training, AI fine-tuning',
  openGraph: {
    siteName: 'FreeSizeAI',
    type: 'website',
    url: 'https://freesize.vercel.app',
    title:
      'AI Image Processing Tools for LORA Training | Free Upscale, Uncrop & Square',
    description:
      'Prepare your LORA training dataset with our free AI tools. Upscale images for better quality, uncrop for composition, and convert to squares for consistent training. Perfect for preparing 20-50 images for LORA model training.',
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
    images: ['https://freesize.vercel.app/og-image.png'], // 절대 URL 사용
  },
  alternates: {
    canonical: 'https://freesize.vercel.app',
  },
  other: {
    'google-adsense-account': 'ca-pub-7791415629101587',
  },
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeFromCookie = (await cookies()).get('theme');
  const theme = themeFromCookie?.value || 'dark';

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased 
        bg-white dark:bg-[#141414] text-gray-900 dark:text-gray-100
        transition-colors duration-200`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            {' '}
            <MaintenanceBanner />
            <Navbar />
            <main className="flex-grow lg:pt-16 pb-16">
              {' '}
              {/* Navbar의 높이만큼 padding-top 추가 */}
              <div className="container mx-auto">
                {children} <ToastContainer /> <AdComponent />
                <Analytics />
                <SpeedInsights />
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
