// app/upload/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/fileStore';
import { useFileUpload } from '@/hooks/useFileUpload';
import { PROCESS_METHODS } from '@/lib/constants';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

export default function UploadPage() {
  const router = useRouter();
  const { file, previewUrl, uploadStatus, resetFileStore } = useFileStore();
  const { selectedMethod, setSelectedMethod, handleProcess } = useFileUpload();

  useEffect(() => {
    if (!file || !previewUrl) {
      router.push('/');
    }
  }, [file, previewUrl, router]);

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    resetFileStore();
    router.push('/');
  };

  if (!file || !previewUrl) {
    return null;
  }

  console.log('uploadStatus:', uploadStatus);
  console.log('selectedMethod:', selectedMethod);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative">
              <Image
                src={previewUrl}
                alt="Preview"
                width={500}
                height={500}
                className="w-full rounded-lg object-contain max-h-96"
              />
              <button
                onClick={handleCancel}
                className="absolute top-2 right-2 p-1 bg-gray-900/50 hover:bg-gray-900/70 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4">Image Details</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  File name: {file.name}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">
                    Select Process Method
                  </h3>
                  <div className="space-y-3">
                    {PROCESS_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="radio"
                          value={method.id}
                          checked={selectedMethod === method.id}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span>{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {uploadStatus.error && (
                  <p className="text-red-500 dark:text-red-400 mb-4">
                    {uploadStatus.error}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={uploadStatus.stage !== 'idle'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={uploadStatus.stage !== 'idle' || !selectedMethod}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg flex items-center disabled:opacity-50"
                >
                  {uploadStatus.stage === 'getting-url' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Getting ready...
                    </>
                  ) : (
                    'Start Processing'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
