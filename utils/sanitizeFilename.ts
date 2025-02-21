import slugify from 'slugify';

/**
 * 파일명을 slugify로 변환하되 확장자는 유지하는 함수
 */
export const slugifyFilename = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  const ext = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';

  // slugify 옵션: 한글 유지, 소문자 변환
  const slugifiedName = slugify(name, {
    lower: true,
    locale: 'ko',
    strict: true,
  });

  return slugifiedName + ext;
};

// File 객체 변환 유틸
export const slugifyFile = (file: File): File => {
  const slugifiedName = slugifyFilename(file.name);
  return new File([file], slugifiedName, { type: file.type });
};
