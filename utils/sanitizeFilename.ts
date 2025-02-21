import slugify from 'slugify';

export const slugifyFilename = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  const ext = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';

  // 1. 먼저 언더바를 하이픈으로 변환
  const nameWithHyphens = name.replace(/_/g, '-');

  // 2. slugify로 나머지 처리 (한글 보존, 공백은 하이픈으로)
  const slugifiedName = slugify(nameWithHyphens, {
    lower: true, // 소문자로 변환
    replacement: '-', // 공백을 하이픈으로 변경
    remove: /[*+~.()'"!:@]/g, // 특수문자만 제거
    strict: false, // strict 모드 해제로 한글 보존
  });

  return slugifiedName + ext;
};

export const slugifyFile = (file: File): File => {
  const slugifiedName = slugifyFilename(file.name);
  return new File([file], slugifiedName, { type: file.type });
};
