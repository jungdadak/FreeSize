'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ImageCompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function ImageCompareSlider({
  beforeImage,
  afterImage,
  beforeLabel = '처리 전',
  afterLabel = '처리 후',
}: ImageCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX;
      const position =
        ((clientX - containerRect.left) / containerRect.width) * 100;

      setSliderPosition(Math.min(Math.max(position, 0), 100));
    },
    [isDragging]
  );

  const handleMoveStart = useCallback(() => setIsDragging(true), []);
  const handleMoveEnd = useCallback(() => setIsDragging(false), []);

  // Prevent text/image selection during dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'default';
    }
  }, [isDragging]);

  // Add event listeners for dragging
  useEffect(() => {
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleMoveEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleMoveEnd);

    return () => {
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleMoveEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleMoveEnd);
    };
  }, [handleMove, handleMoveEnd]);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative w-full max-w-3xl h-[400px] overflow-hidden rounded-lg bg-black dark:bg-black"
        onMouseDown={handleMoveStart}
        onTouchStart={handleMoveStart}
      >
        {/* 베이스 이미지 (처리 후) */}
        <div className="absolute inset-0">
          <Image
            src={afterImage}
            alt={afterLabel}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* 원본 이미지 (클리핑 적용) */}
        <div
          className="absolute inset-0 transition-all duration-300 ease-out"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Image
            src={beforeImage}
            alt={beforeLabel}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* 슬라이더 핸들 (붉은 삼각형) */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 cursor-pointer"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMoveStart}
          onTouchStart={handleMoveStart}
        >
          {/* 삼각형 만들기 */}
          <div className="w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-b-8 border-b-red-600"></div>
        </div>
      </div>

      {/* 슬라이더 컨트롤 */}
      <div className="w-full max-w-3xl mt-4 px-2">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="w-full appearance-none h-1 bg-black dark:bg-white rounded-full cursor-pointer"
          />
          {/* 슬라이더 레일을 선으로 표시 */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-black dark:bg-white"></div>
        </div>
      </div>

      {/* 라벨 */}
      <div className="flex justify-between w-full max-w-3xl mt-2 px-2">
        <div className="bg-black/50 dark:bg-white/50 text-white dark:text-black text-sm px-3 py-1 rounded-md shadow-md">
          {beforeLabel}
        </div>
        <div className="bg-black/50 dark:bg-white/50 text-white dark:text-black text-sm px-3 py-1 rounded-md shadow-md">
          {afterLabel}
        </div>
      </div>
    </div>
  );
}
