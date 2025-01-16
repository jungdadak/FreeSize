'use client';
import { useState, useRef, DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFileStore, FileItem } from '@/store/fileStore';
import { FILE_CONFIG } from '@/configs/file.config';

export default function DragDrop() {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const files = useFileStore((state) => state.files);
  const addFile = useFileStore((state) => state.addFile);

  /**
   * 드래그 이벤트 핸들러
   * e.stopPropagation으로 브라우저의 기본 동작을 방지
   */
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      setDragActive(false);
    }
  };

  /**
   * 파일 타입 및 크기 벨리데이션
   * @param file - 검사할 파일
   * @returns 유효한 파일인지 여부
   */
  const validateFile = (file: File): boolean => {
    if (!FILE_CONFIG.validTypes.includes(file.type)) {
      setError(
        `Sorry, only ${FILE_CONFIG.validTypes
          .map((type) => type.split('/')[1].toUpperCase())
          .join(', ')} files are supported.`
      );
      return false;
    }
    if (file.size > FILE_CONFIG.maxSize) {
      setError(`File size must be less than ${FILE_CONFIG.maxSizeInMB}MB.`);
      return false;
    }
    return true;
  };

  /**
   * 중복 파일 검사
   * @param file - 검사할 파일
   * @returns 중복 여부
   */
  const isDuplicate = (file: File): boolean => {
    return files.some(
      (item) => item.file.name === file.name && item.file.size === file.size
    );
  };

  /**
   * 파일 수 제한 검사
   * @param newFilesCount - 추가할 파일 수
   * @returns 파일 수 제한을 초과하는지 여부
   */
  const exceedsFileLimit = (newFilesCount: number): boolean => {
    return files.length + newFilesCount > FILE_CONFIG.maxImageCount;
  };

  /**
   * 파일 처리: 벨리데이션, 중복 검사, 파일 수 제한, Blob URL 생성 및 상태 업데이트
   * @param file - 처리할 파일
   */
  const processFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    if (isDuplicate(file)) {
      setError(`File "${file.name}" is already selected.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const fileItem: FileItem = {
      file,
      previewUrl,
      dimensions: null, // 필요 시 업데이트
    };
    addFile(fileItem);
  };

  // 파일 검증 및 업로드 처리 부분 (드래그 앤 드롭)
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const newFilesCount = droppedFiles.length;
      if (exceedsFileLimit(newFilesCount)) {
        setError(
          `You can only upload up to ${FILE_CONFIG.maxImageCount} files.`
        );
        return;
      }

      for (let i = 0; i < droppedFiles.length; i++) {
        processFile(droppedFiles[i]);
      }
      router.push('/preview');
    }
  };

  /**
   * 파일 선택 시 처리
   * @param e - 변경 이벤트
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');

    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFilesCount = selectedFiles.length;
      if (exceedsFileLimit(newFilesCount)) {
        setError(
          `You can only upload up to ${FILE_CONFIG.maxImageCount} files.`
        );
        return;
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        processFile(selectedFiles[i]);
      }
      router.push('/preview');
    }
  };

  /**
   * 파일 선택 버튼 클릭 시 파일 선택 창 열기
   */
  const onButtonClick = () => {
    inputRef.current?.click();
  };

  /**
   * 키보드 접근성 향상
   * @param e - 키보드 이벤트
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onButtonClick();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400
                   ${
                     dragActive
                       ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                       : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 bg-white/90 dark:bg-gray-900/80'
                   }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        role="button"
        aria-label="Drag and drop your images here or click to select files"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={FILE_CONFIG.validTypes.join(',')}
          multiple
          onChange={handleChange}
        />

        <Upload className="w-16 h-16 mx-auto mb-4 text-purple-500 dark:text-purple-400" />
        <h3 className="text-xl font-semibold mb-2">
          Drag & Drop your images here
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">or</p>
        <button
          onClick={onButtonClick}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Choose Files
        </button>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Supports{' '}
          {FILE_CONFIG.validTypes
            .map((type) => type.split('/')[1].toUpperCase())
            .join(', ')}{' '}
          - Max file size {FILE_CONFIG.maxSizeInMB}MB each - Max{' '}
          {FILE_CONFIG.maxImageCount} files
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
