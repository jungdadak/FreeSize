/**
 * fie의 형식, 크기를 리턴합니다. 소수점 2째자리까지 mb단위 표시
 */

export const FILE_CONFIG = {
  validTypes: process.env.NEXT_PUBLIC_VALID_FILE_TYPES?.split(',').filter(
    Boolean
  ) || ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 4 * 1024 * 1024,
  maxSizeInMB:
    Number(
      (
        (Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 4 * 1024 * 1024) /
        1048576
      ).toFixed(2)
    ) || 4,
  maxImageCount: Number(process.env.NEXT_PUBLIC_MAX_IMAGE_COUNT) || 10,
};
