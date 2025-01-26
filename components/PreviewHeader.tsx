import { FileImage, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface HeaderProps {
  totalFiles: number;
  totalSize: string;
}

export default function Header({ totalFiles, totalSize }: HeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div
        className={`
        flex items-center justify-between rounded-2xl shadow-lg p-8
        bg-white border border-gray-200
        dark:bg-[#1a1a1a] dark:border-none dark:backdrop-blur-sm
      `}
      >
        <div className="space-y-2">
          <h1
            className={`
            text-3xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-indigo-400 to-violet-400
          `}
          >
            Image Processing Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            AI를 이용한 고급 이미지 처리로 이미지를 변환하세요
          </p>
        </div>
        <div className="flex items-center gap-6">
          {/* //폴링테스트페이지 */}
          <Badge
            variant="outline"
            className={`
              px-4 py-2 bg-cyan-800 border border-gray-200 text-gray-700 
              text-yellow-300
            `}
          >
            <Link href={'/polling'}>폴링 테스트페이지</Link>
          </Badge>
          <Badge
            variant="secondary"
            className={`
              px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 
              dark:bg-[#2e2e2e] dark:border-none dark:text-gray-200
            `}
          >
            <FileImage className="w-4 h-4 mr-2" />
            {totalFiles} 개의 파일
          </Badge>
          <Badge
            variant="secondary"
            className={`
              px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 
              dark:bg-[#2e2e2e] dark:border-none dark:text-gray-200
            `}
          >
            <Upload className="w-4 h-4 mr-2" />
            {totalSize} MB
          </Badge>
        </div>
      </div>
    </div>
  );
}
