'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useTransform } from '@/hooks/useTransform';

interface LogEntry {
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'error';
}

export default function TransformPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL에서 데이터 파싱
  const encodedData = searchParams.get('data');
  const transformData = encodedData
    ? JSON.parse(decodeURIComponent(encodedData))
    : null;

  // 로그 메시지 상태 추가
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // onLog 함수를 useCallback으로 메모이제이션
  const logHandler = useCallback(
    (message: string, type: LogEntry['type'] = 'info') => {
      setLogs((prev) => [
        ...prev,
        {
          message,
          timestamp: new Date().toLocaleTimeString(),
          type,
        },
      ]);
    },
    []
  );

  // useTransform 훅에 로그 업데이트 함수 전달
  const { status, handleRetry } = useTransform(transformData, logHandler);

  useEffect(() => {
    if (!transformData) {
      router.push('/');
    }
  }, [transformData, router]);

  if (!transformData) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8">
          {/* 상태 표시 UI */}
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            {/* 업로드 중 */}
            {status.stage === 'uploading' && (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  이미지 업로드 중...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  파일을 서버에 업로드하고 있습니다.
                </p>
              </div>
            )}

            {/* 처리 중 */}
            {status.stage === 'processing' && (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  이미지 처리 중...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  AI 모델이 이미지를 처리하고 있습니다.
                </p>
              </div>
            )}

            {/* 완료 */}
            {status.stage === 'completed' && (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-4">처리 완료!</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => (window.location.href = '결과 이미지 URL')} // TODO: 실제 URL 추가
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    결과 다운로드
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 block mx-auto"
                  >
                    홈으로 돌아가기
                  </button>
                </div>
              </div>
            )}

            {/* 실패 */}
            {status.stage === 'failed' && (
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-red-600">
                  처리 실패
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {status.error}
                </p>
                <div className="space-y-4">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center space-x-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>다시 시도</span>
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400"
                  >
                    홈으로 돌아가기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 로그 창 추가 */}
          <div className="mt-8 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 h-48 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-2">진행 상태</h3>
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`text-sm flex items-center space-x-2 ${
                    log.type === 'error'
                      ? 'text-red-600'
                      : log.type === 'success'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="text-xs text-gray-400">{log.timestamp}</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
