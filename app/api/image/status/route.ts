// app/api/image/status/route.ts
import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';

interface ProcessInfo {
  s3Url: string;
  originalFileName: string;
  method: string;
}

async function checkS3Url(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking S3 URL:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { processId } = await request.json();

    if (!processId) {
      console.error('Missing processId in request');
      return NextResponse.json({
        success: false,
        code: 2,
        message: 'Process ID is required',
      });
    }

    const processInfo = processStore.get(processId) as ProcessInfo | undefined;
    if (!processInfo) {
      console.error(`Process ID not found: ${processId}`);
      return NextResponse.json({
        success: false,
        code: 2,
        message: 'Invalid process ID',
      });
    }

    console.log(`Checking status for process: ${processId}`);
    const exists = await checkS3Url(processInfo.s3Url);

    if (exists) {
      // 이미지가 존재하면 프록시 URL 생성
      const proxyUrl = `/api/image/proxy/${processId}`;
      console.log(`Processing completed for ${processInfo.originalFileName}`);

      return NextResponse.json({
        success: true,
        code: 0,
        message: 'Processing completed',
        imageUrl: proxyUrl,
        originalFileName: processInfo.originalFileName,
        method: processInfo.method,
      });
    }

    console.log(`Still processing: ${processInfo.originalFileName}`);
    return NextResponse.json({
      success: true,
      code: 1,
      message: 'Still processing',
      originalFileName: processInfo.originalFileName,
      method: processInfo.method,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        success: false,
        code: 2,
        message: 'Status check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
