import slugify from 'slugify';

/**
 * 파일명을 slugify로 변환하되 확장자는 유지하는 함수
 */
export const slugifyFilename = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  const ext = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';

  // slugify 옵션: 한글 유지를 위해 strict 제거, remove 옵션으로 제거할 문자 직접 지정
  const slugifiedName = slugify(name, {
    lower: true,
    replacement: '-', // 공백을 하이픈으로 변경
    remove: /[*+~.()'"!:@]/g, // 특수문자만 제거
    strict: false, // strict 모드 해제
  });

  return slugifiedName + ext;
};

// File 객체 변환 유틸
export const slugifyFile = (file: File): File => {
  const slugifiedName = slugifyFilename(file.name);
  return new File([file], slugifiedName, { type: file.type });
};
