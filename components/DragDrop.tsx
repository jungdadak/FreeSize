// components/DragDrop.tsx
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
   * Drag event handler
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
   * Validate file type and size
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
   * Check for duplicate files
   */
  const isDuplicate = (file: File): boolean => {
    return files.some(
      (item) => item.file.name === file.name && item.file.size === file.size
    );
  };

  /**
   * Check if adding new files exceeds the limit
   */
  const exceedsFileLimit = (newFilesCount: number): boolean => {
    return files.length + newFilesCount > FILE_CONFIG.maxImageCount;
  };

  /**
   * Process and add file to the store
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
      dimensions: null, // To be updated later
      processingOption: null, // Initialize as null
    };
    addFile(fileItem);
  };

  /**
   * Handle file drop event
   */
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
   * Handle file selection via input
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
   * Trigger file input click
   */
  const onButtonClick = () => {
    inputRef.current?.click();
  };

  /**
   * Handle keyboard events for accessibility
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
