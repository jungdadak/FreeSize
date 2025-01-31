import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';

export async function GET(request: Request) {
  try {
    // ✅ Next.js 15+에서는 request.nextUrl.pathname을 사용하여 processId를 추출해야 함
    const processId = request.url.split('/').pop(); // URL에서 processId 추출
    if (!processId) {
      console.error('❌ Missing process ID in request');
      return new NextResponse('Not found', { status: 404 });
    }

    console.log(`🔍 Fetching process info for ID: ${processId}`);

    const processInfo = processStore.get(processId);
    if (!processInfo) {
      console.error(`❌ Process ID ${processId} not found`);
      return new NextResponse('Not found', { status: 404 });
    }

    const response = await fetch(processInfo.s3Url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from S3: ${response.status}`);
    }

    const blob = await response.blob();
    console.log(`✅ Successfully fetched image for ID: ${processId}`);

    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error(`🚨 Proxy error for ID: ${request.url}`, error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
