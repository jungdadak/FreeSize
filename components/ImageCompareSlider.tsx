'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';

interface ImageCompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

// 이미지 컴포넌트를 별도로 분리하여 메모이제이션
const ComparisonImage = memo(function ComparisonImage({
  src,
  alt,
  onLoad,
}: {
  src: string;
  alt: string;
  onLoad: () => void;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain"
      sizes="100vw"
      priority
      draggable="false"
      onLoad={onLoad}
    />
  );
});

// 라벨 컴포넌트를 별도로 분리하여 메모이제이션
const Label = memo(function Label({ text }: { text: string }) {
  return (
    <div className="bg-[#1E1E1E]/10 dark:text-white text-black text-sm px-3 py-1 rounded-md shadow-md">
      {text}
    </div>
  );
});

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

  // 현재 슬라이더 위치를 ref로 관리
  const positionRef = useRef(sliderPosition);

  const updatePosition = useCallback((newPosition: number) => {
    positionRef.current = newPosition;
    setSliderPosition(newPosition);
  }, []);

  // 디바운스된 이미지 로드 핸들러
  const handleImageLoad = useCallback(() => {
    if (!containerRef.current) return;

    requestAnimationFrame(() => {
      const imgElement = containerRef.current?.querySelector('img');
      if (imgElement) {
        const rect = imgElement.getBoundingClientRect();
        setImageWidth(rect.width);
      }
    });
  }, []);

  // 움직임 핸들러 최적화
  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      event.preventDefault();

      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX;
      const position =
        ((clientX - containerRect.left) / containerRect.width) * 100;

      requestAnimationFrame(() => {
        updatePosition(Math.min(Math.max(position, 0), 100));
      });
    },
    [isDragging, updatePosition]
  );

  const handleMoveEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 드래그 상태에 따른 body 스타일 변경을 useLayoutEffect로 최적화
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

  // 이벤트 리스너 최적화
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

  // 메모이제이션된 스타일
  const clipStyle = useCallback(
    (position: number) => ({
      clipPath: `inset(0 ${100 - position}% 0 0)`,
      WebkitClipPath: `inset(0 ${100 - position}% 0 0)`,
    }),
    []
  );

  const sliderStyle = useCallback(
    (position: number) => ({
      background: `linear-gradient(to right, #019863 0%, #019863 ${position}%, #2E2E2E ${position}%, #2E2E2E 100%)`,
    }),
    []
  );

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full aspect-video overflow-hidden rounded-lg bg-[#1E1E1E] dark:bg-[#1E1E1E] select-none"
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="absolute inset-0 select-none">
          <ComparisonImage
            src={afterImage}
            alt={afterLabel}
            onLoad={handleImageLoad}
          />
        </div>

        <div
          className="absolute inset-0 transition-all duration-300 ease-out select-none"
          style={clipStyle(sliderPosition)}
        >
          <ComparisonImage
            src={beforeImage}
            alt={beforeLabel}
            onLoad={handleImageLoad}
          />
        </div>
      </div>

      <div
        className="relative mt-4 max-w-[100%]"
        style={{ width: imageWidth > 0 ? `${imageWidth}px` : '100%' }}
      >
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => updatePosition(Number(e.target.value))}
            className="w-full appearance-none h-1 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer"
            style={sliderStyle(sliderPosition)}
          />
        </div>

        <div className="flex justify-between w-full mt-2 px-2">
          <Label text={beforeLabel} />
          <Label text={afterLabel} />
        </div>
      </div>
    </div>
  );
}
