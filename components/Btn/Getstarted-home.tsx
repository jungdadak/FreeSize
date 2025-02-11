'use client';
import { ChevronsDown } from 'lucide-react';

interface GetstartedProps {
  targetId?: string;
}

//주석추가
export default function Getstarted({ targetId }: GetstartedProps) {
  const scrollToTarget = () => {
    if (targetId) {
      // ID가 제공된 경우 해당 요소로 스크롤
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      // ID가 없으면 기본값으로 한 화면 아래로 스크롤
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth',
      });
    }
  };
  return (
    <div
      onClick={scrollToTarget}
      className="mt-12 cursor-pointer flex flex-col items-center group cursor-pointer"
    >
      <span className="text-blue-500 dark:text-teal-400 font-bold text-3xl md:text-5xl hover:text-blue-600 dark:hover:text-teal-500 transition-colors duration-300">
        Get Started
      </span>
      <ChevronsDown className="mt-5 w-12 h-12 text-blue-500 dark:text-teal-400 animate-bounce group-hover:text-blue-600 dark:group-hover:text-teal-500" />
    </div>
  );
}
