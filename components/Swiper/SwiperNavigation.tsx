import { useEffect, useState } from 'react';
import { useSwiper } from 'swiper/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SwiperNavigationProps {
  totalFiles: number;
}

export default function SwiperNavigation({
  totalFiles,
}: SwiperNavigationProps) {
  const swiper = useSwiper();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleSlideChange = () => {
      setActiveIndex(swiper.activeIndex);
    };

    swiper.on('slideChange', handleSlideChange);
    return () => {
      swiper.off('slideChange', handleSlideChange);
    };
  }, [swiper]);

  return (
    <div className="flex justify-center items-center gap-4 mt-2">
      <button
        onClick={() => swiper.slidePrev()}
        disabled={activeIndex === 0}
        className={`px-4 py-2.5 flex items-center gap-2 
          bg-gray-900/80 dark:bg-gray-900/80 
          backdrop-blur-sm border border-gray-700/50 
          rounded-xl text-gray-200 dark:text-gray-200 
          shadow-lg transition-all duration-200
          ${
            activeIndex === 0
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-800 hover:border-gray-600 hover:scale-105 hover:shadow-xl'
          }`}
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </button>
      <div
        className="px-6 py-2 min-w-[100px] text-center 
          bg-gray-900/60 dark:bg-gray-900/60 
          backdrop-blur-sm border border-gray-700/50 
          rounded-xl text-gray-200 dark:text-gray-200"
      >
        {activeIndex + 1} / {totalFiles}
      </div>
      <button
        onClick={() => swiper.slideNext()}
        disabled={activeIndex === totalFiles - 1}
        className={`px-4 py-2.5 flex items-center gap-2
          bg-indigo-900/80 dark:bg-indigo-900/80
          backdrop-blur-sm border border-gray-700/50
          rounded-xl text-gray-200 dark:text-gray-200
          shadow-lg transition-all duration-200
          ${
            activeIndex === totalFiles - 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-800 hover:border-gray-600 hover:scale-105 hover:shadow-xl'
          }`}
      >
        Next
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
