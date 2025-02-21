import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FILE_CONFIG } from '@/configs/file.config';
import type { FileItem } from '@/store/fileStore';
import { slugifyFile } from '@/utils/sanitizeFilename';

interface CompactUploadProps {
  onFileAdd: (file: FileItem) => void;
  className?: string;
}

const CompactUpload: React.FC<CompactUploadProps> = ({
  onFileAdd,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!FILE_CONFIG.validTypes.includes(file.type)) {
      setError(
        `Supported: ${FILE_CONFIG.validTypes
          .map((type) => type.split('/')[1].toUpperCase())
          .join(', ')}`
      );
      return false;
    }
    if (file.size > FILE_CONFIG.maxSize) {
      setError(`Max size: ${FILE_CONFIG.maxSizeInMB}MB`);
      return false;
    }
    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;
    console.log('Original filename:', file.name); // 원본 파일명

    const sluggedFile = slugifyFile(file); // 파일명 변환
    console.log('Slugified filename:', sluggedFile.name); // 변환된 파일명

    const previewUrl = URL.createObjectURL(sluggedFile);
    const fileItem: FileItem = {
      file: sluggedFile, // 변환된 파일 사용
      previewUrl,
      dimensions: null,
      processingOption: null,
    };
    onFileAdd(fileItem);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    setError('');

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      Array.from(droppedFiles).forEach(processFile);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');

    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach(processFile);
    }
  };

  return (
    <Card
      className={`relative overflow-hidden ${
        dragActive ? 'ring-2 ring-purple-400' : ''
      } ${className}`}
      onDragEnter={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={FILE_CONFIG.validTypes.join(',')}
        multiple
        onChange={handleChange}
      />

      <div
        className="flex flex-col items-center justify-center p-4 space-y-2 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-purple-500" />
        <p className="text-sm font-medium text-center">
          Drop images here or click to add more
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Card>
  );
};

export default CompactUpload;
