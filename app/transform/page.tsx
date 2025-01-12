'use client';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/fileStore';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Download } from 'lucide-react';
export default function ProcessPage() {
  const router = useRouter();
  const file = useFileStore((state) => state.file);
  const previewUrl = useFileStore((state) => state.previewUrl);

  const [status, setStatus] = useState('processing'); // 'processing' | 'complete' | 'error'
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file || !previewUrl) {
      router.push('/');
      return;
    }

    // 여기에 실제 처리 로직 추가 예정

    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [file, previewUrl, router]);

  if (!file || !previewUrl) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          {status === 'processing' && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
              <h2 className="text-xl font-semibold mb-2">
                Processing Your Image
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                This may take a few moments...
              </p>
            </div>
          )}

          {status === 'complete' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold mb-6">Results</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Original Image</h3>
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={previewUrl}
                      alt="Original"
                      className="w-full object-contain max-h-[500px]"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Processed Image</h3>
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={processedImageUrl}
                      alt="Processed"
                      className="w-full object-contain max-h-[500px]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 pt-6">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Process Another Image
                </button>
                <button
                  onClick={() => window.open(processedImageUrl, '_blank')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Result
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Processing Failed</h2>
              <p className="text-red-500 dark:text-red-400 mb-6">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
