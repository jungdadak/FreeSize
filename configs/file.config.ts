/**
 * fie의 형식, 크기를 리턴합니다. 소수점 2째자리까지 mb단위 표시
 */

export const FILE_CONFIG = {
  validTypes: process.env.NEXT_PUBLIC_VALID_FILE_TYPES?.split(',') || [],
  maxSize: Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 4 * 1024 * 1024,
  maxSizeInMB: Number(
    (Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) / 1048576).toFixed(2)
  ),
};
