'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ImageCompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export default function ImageCompareSlider({
  beforeImage,
  afterImage,
  beforeLabel = '처리 전',
  afterLabel = '처리 후',
  className = '',
}: ImageCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageWidth, setImageWidth] = useState<number>(0);

  // 이미지 로드 시 실제 렌더링된 이미지의 너비를 계산
  const handleImageLoad = useCallback(() => {
    if (containerRef.current) {
      // 또는 e.currentTarget.getBoundingClientRect()로 직접 측정할 수도 있습니다.
      const imgElement = containerRef.current.querySelector('img');
      if (imgElement) {
        const rect = imgElement.getBoundingClientRect();
        setImageWidth(rect.width);
      }
    }
  }, []);

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      event.preventDefault();

      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX;
      const position =
        ((clientX - containerRect.left) / containerRect.width) * 100;

      setSliderPosition(Math.min(Math.max(position, 0), 100));
    },
    [isDragging]
  );

  const handleMoveEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  useEffect(() => {
    const handleGlobalMove = (event: MouseEvent | TouchEvent) => {
      handleMove(event);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMove, {
        passive: false,
      });
      document.addEventListener('touchmove', handleGlobalMove, {
        passive: false,
      });
      document.addEventListener('mouseup', handleMoveEnd);
      document.addEventListener('touchend', handleMoveEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('mouseup', handleMoveEnd);
      document.removeEventListener('touchend', handleMoveEnd);
    };
  }, [isDragging, handleMove, handleMoveEnd]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full aspect-video overflow-hidden rounded-lg bg-[#1E1E1E] dark:bg-[#1E1E1E] select-none"
      >
        {/* 처리 후 이미지 */}
        <div className="absolute inset-0 select-none">
          <Image
            src={afterImage}
            alt={afterLabel}
            fill
            className="object-contain"
            sizes="100vw"
            priority
            draggable="false"
            onLoad={handleImageLoad} // onLoadingComplete 대신 onLoad 사용
          />
        </div>

        {/* 처리 전 이미지 (클리핑 적용) */}
        <div
          className="absolute inset-0 transition-all duration-300 ease-out select-none"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Image
            src={beforeImage}
            alt={beforeLabel}
            fill
            className="object-contain"
            sizes="100vw"
            priority
            draggable="false"
            onLoad={handleImageLoad}
          />
        </div>
      </div>

      {/* 슬라이더와 라벨을 포함하는 컨테이너 */}
      <div
        className="relative mt-4"
        style={{ width: imageWidth > 0 ? `${imageWidth}px` : '100%' }}
      >
        {/* 슬라이더 컨트롤 */}
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="w-full appearance-none h-1 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #019863 0%, #019863 ${sliderPosition}%, #2E2E2E ${sliderPosition}%, #2E2E2E 100%)`,
            }}
          />
        </div>

        {/* 라벨 */}
        <div className="flex justify-between w-full mt-2 px-2">
          <div className="bg-[#1E1E1E]/50 dark:bg-white/50 text-white dark:text-black text-sm px-3 py-1 rounded-md shadow-md">
            {beforeLabel}
          </div>
          <div className="bg-[#1E1E1E]/50 dark:bg-white/50 text-white dark:text-black text-sm px-3 py-1 rounded-md shadow-md">
            {afterLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
