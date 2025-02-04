import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preview & Edit LORA Training Images',
  description:
    'Preview selected images, add custom processing options, and upload new files for LORA training. AI-powered tools for optimal dataset preparation.',
  keywords:
    'LORA training preview, AI image processing, image dataset customization, upload LORA images, AI image enhancement, dataset preparation for LORA, batch processing',
  openGraph: {
    title: 'Preview & Customize LORA Training Images',
    description:
      'Add processing options to your selected images or upload new files for LORA training. Customize aspect ratio, resolution, and upscaling with AI-powered tools.',
    type: 'article',
    url: 'https://freesize.vercel.app/preview',
    images: [
      {
        url: '/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'LORA Training Image Preview & Customization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preview & Customize Your LORA Training Images',
    description:
      'Select images, fine-tune processing options, and upload new files for LORA model training with AI-powered tools.',
    images: ['https://freesize.vercel.app/og-preview.png'],
  },
  alternates: {
    canonical: 'https://freesize.vercel.app/preview',
  },
  other: {
    'google-adsense-account': 'ca-pub-7791415629101587',
  },
};
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return { children };
}
