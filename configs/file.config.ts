/**
 * fie의 형식, 크기를 리턴합니다. 소수점 2째자리까지 mb단위 표시
 */

// configs/file.config.ts
'use client';

// 기본값 설정
const DEFAULT_VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE = 4 * 1024 * 1024; // 4MB
const DEFAULT_MAX_COUNT = 10;

export const FILE_CONFIG = {
  validTypes:
    typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_VALID_FILE_TYPES?.split(',') ||
        DEFAULT_VALID_TYPES
      : DEFAULT_VALID_TYPES,

  maxSize:
    typeof window !== 'undefined'
      ? Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || DEFAULT_MAX_SIZE
      : DEFAULT_MAX_SIZE,

  maxSizeInMB:
    typeof window !== 'undefined'
      ? Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || DEFAULT_MAX_SIZE) /
        (1024 * 1024)
      : DEFAULT_MAX_SIZE / (1024 * 1024),

  maxImageCount:
    typeof window !== 'undefined'
      ? Number(process.env.NEXT_PUBLIC_MAX_IMAGE_COUNT) || DEFAULT_MAX_COUNT
      : DEFAULT_MAX_COUNT,
};
