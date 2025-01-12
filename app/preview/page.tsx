'use client';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/fileStore';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import Image from 'next/image';

export default function UploadPage() {
  interface PresignedPostResponse {
    url: string;
    fields: {
      [key: string]: string; // 어떤 문자열 키든 받을 수 있음
    };
  }
  const router = useRouter();
  const file = useFileStore((state) => state.file);
  const previewUrl = useFileStore((state) => state.previewUrl);
  const resetFileStore = useFileStore((state) => state.resetFileStore);

  const [selectedMethod, setSelectedMethod] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file || !previewUrl) {
      router.push('/');
    }
  }, [file, previewUrl, router]);

  const handleProcess = async () => {
    if (!file || !selectedMethod) return;
    try {
      const filename = encodeURIComponent(file.name);
      const res = await fetch('/api/image?file=' + filename, {
        method: 'GET',
      });
      const presignedData = (await res.json()) as PresignedPostResponse;
      const formData = new FormData();
      Object.entries({ ...presignedData.fields, file }).forEach(
        ([key, value]) => {
          formData.append(key, value);
        }
      );
      const uploadResult = await fetch(presignedData.url, {
        method: 'POST',
        body: formData,
      });
      console.log(uploadResult);

      if (uploadResult.ok) {
        router.push(`/transform?method=${selectedMethod}`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setIsUploading(false);
    }
    //TODO
    //3. backend에 s3 주소와 method인자 전달!
    // try {
    //   setIsUploading(true);
    //   setError('');

    //   // 여기서 나중에 S3 업로드 로직이 들어갈 예정
    //   router.push(`/transform?method=${selectedMethod}`);
    // } catch {
    //   setError('Failed to start processing');
    //   setIsUploading(false);
    // }
  };

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
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        value="method1"
                        checked={selectedMethod === 'method1'}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>Method 1</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        value="method2"
                        checked={selectedMethod === 'method2'}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>Method 2</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={isUploading || !selectedMethod}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg flex items-center disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Image'
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
