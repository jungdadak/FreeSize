import { FileImage, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  totalFiles: number;
  totalSize: string;
}

export default function Header({ totalFiles, totalSize }: HeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between rounded-2xl shadow-lg p-4 lg:p-8 bg-white border border-gray-200 dark:bg-[#1a1a1a] dark:border-none dark:backdrop-blur-sm gap-4 lg:gap-0">
        {/* Title and Description */}
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
            Image Processing Studio
          </h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
            AI를 이용한 고급 이미지 처리로 이미지를 변환하세요
          </p>
        </div>

        {/* Badges Container */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-6">
          {/* Files Badge */}
          <Badge
            variant="secondary"
            className="px-3 lg:px-4 py-1 lg:py-2 bg-gray-100 border border-gray-200 text-gray-700 dark:bg-[#2e2e2e] dark:border-none dark:text-gray-200 text-sm whitespace-nowrap"
          >
            <FileImage className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            {totalFiles} 개의 파일
          </Badge>

          {/* Size Badge */}
          <Badge
            variant="secondary"
            className="px-3 lg:px-4 py-1 lg:py-2 bg-gray-100 border border-gray-200 text-gray-700 dark:bg-[#2e2e2e] dark:border-none dark:text-gray-200 text-sm whitespace-nowrap"
          >
            <Upload className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            {totalSize} MB
          </Badge>
        </div>
      </div>
    </div>
  );
}
