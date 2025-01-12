'use client';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/fileStore';

export default function DragDrop() {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const setFile = useFileStore((state) => state.setFile);
  const setPreviewUrl = useFileStore((state) => state.setPreviewUrl);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Only JPG and PNG files are allowed');
      return false;
    }
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  // 파일 검증 및 업로드 처리 부분
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      // 즉시 Blob URL 생성
      const previewUrl = URL.createObjectURL(droppedFile);
      setFile(droppedFile);
      setPreviewUrl(previewUrl);
      router.push('/preview');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');

    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(previewUrl);
      router.push('/preview');
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all backdrop-blur-sm
                   ${
                     dragActive
                       ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                       : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 bg-white/90 dark:bg-gray-900/80'
                   }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png"
          onChange={handleChange}
        />

        <Upload className="w-16 h-16 mx-auto mb-4 text-purple-500 dark:text-purple-400" />
        <h3 className="text-xl font-semibold mb-2">
          Drag & Drop your image here
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">or</p>
        <button
          onClick={onButtonClick}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-all"
        >
          Choose File
        </button>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Supports JPG, PNG - Max file size 10MB
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
