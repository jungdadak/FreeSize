import { Image as ImageIcon } from 'lucide-react';
import DragDrop from './DragDrop';
import Image from 'next/image';
const HomeBots = () => {
  return (
    <div className="md:mt-32 bg-gradient-to-b from-purple-100 dark:from-purple-900 via-white dark:via-black to-white dark:to-black text-gray-800 dark:text-white">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/bgtemp.webp")' }}
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-[#1E1E1E]/50" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Transform Your Images with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-400 dark:to-pink-400">
                AI Upscaling
              </span>
            </h2>
            <p className="text-xl text-white dark:text-gray-200 max-w-2xl mx-auto font-medium">
              Enhance image quality, increase resolution, and remove noise with
              our advanced AI technology. Get professional results in seconds.
            </p>
          </div>
        </div>
      </div>
      <div className="-mt-20">
        {' '}
        <DragDrop />
      </div>
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 -mt-20 md:mt-20">
        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/50 dark:to-transparent backdrop-blur-sm border border-purple-100 dark:border-purple-900">
            <ImageIcon className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">4x Upscaling</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Increase image resolution up to 4 times while maintaining quality
            </p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/50 dark:to-transparent backdrop-blur-sm border border-purple-100 dark:border-purple-900">
            <ImageIcon className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Enhancement</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Advanced AI algorithms to improve clarity and detail
            </p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/50 dark:to-transparent backdrop-blur-sm border border-purple-100 dark:border-purple-900">
            <ImageIcon className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Batch Processing</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Process multiple images at once with our batch upscaling feature
            </p>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-2 gap-8">
          {/* Original Image Card */}
          <div className="p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/50 dark:to-transparent backdrop-blur-sm border border-purple-100 dark:border-purple-900 shadow-lg">
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
              Original Image
            </h3>
            <div className="relative h-80 w-full rounded-md overflow-hidden mb-4">
              <Image
                src="/robin.webp"
                alt="Original image of a robin bird, showing the base quality before AI upscaling"
                fill
                className="object-cover object-left"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Original (640 × 427px)
            </p>
          </div>

          {/* Upscaled Image Card */}
          <div className="p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/50 dark:to-transparent backdrop-blur-sm border border-purple-100 dark:border-purple-900 shadow-lg">
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
              4x Upscale Image
            </h3>
            <div className="relative h-80 w-full rounded-md overflow-hidden mb-4">
              <Image
                src="/upscale_robin.webp"
                alt="AI-enhanced image of the robin bird, showcasing 4x upscaling with improved detail"
                fill
                className="object-cover object-left"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400">
              4x Upscaled (2560 × 1708px)
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 dark:text-gray-400 mt-24">
        <p>© 2025 FreeSize. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomeBots;
