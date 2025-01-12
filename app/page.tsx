export const dynamic = 'force-static';

import HomeBots from '@/components/homeBots';
import Getstarted from '@/components/Btn/Getstarted-home';

export default function Home() {
  return (
    <div className="h-full bg-gray-100 dark:bg-black transition-colors duration-500">
      <main className="flex flex-col items-center justify-center text-center md:px-4 md:py-20 mt-16">
        <h1 className="font-extrabold text-5xl md:text-7xl lg:text-8xl text-gray-900 dark:text-white transition-colors duration-500">
          Optimize Your Images
        </h1>
        <h2 className="mt-4 font-semibold text-4xl md:text-6xl lg:text-7xl text-gray-700 dark:text-gray-300 transition-colors duration-500">
          <span className="text-2xl md:text-4xl lg:text-5xl">for</span>{' '}
          <span className="text-5xl md:text-7xl lg:text-8xl text-blue-500 dark:text-teal-400">
            Free
          </span>
        </h2>
        <p className="mt-6 text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl">
          Efficiently compress and optimize your images without losing quality.
          Enhance your website&apos;s performance today!
        </p>
        <Getstarted targetId="homebots" />

        <div className="mt-32" id="homebots">
          <HomeBots />
        </div>
      </main>
    </div>
  );
}
