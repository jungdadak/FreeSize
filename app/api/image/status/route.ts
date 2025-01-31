//app/api/image/status/route.ts
import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';

async function checkS3Url(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { processId } = await request.json();

    const processInfo = processStore.get(processId);
    if (!processInfo) {
      return NextResponse.json({
        success: false,
        message: 'Invalid process ID',
      });
    }

    const exists = await checkS3Url(processInfo.s3Url);

    if (exists) {
      // 처리가 완료된 경우, 프록시 URL 생성
      const proxyUrl = `/api/image/proxy/${processId}`;
      return NextResponse.json({
        success: true,
        code: 0,
        message: 'Processing completed',
        imageUrl: proxyUrl,
        originalFileName: processInfo.originalFileName,
      });
    }

    return NextResponse.json({
      success: true,
      code: 1,
      message: 'Still processing',
      originalFileName: processInfo.originalFileName,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Status check failed' },
      { status: 500 }
    );
  }
}
