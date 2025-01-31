// app/api/image/proxy/[processId]/route.ts
import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';

export async function GET(
  request: Request,
  { params }: { params: { processId: string } }
) {
  try {
    const processInfo = processStore.get(params.processId);
    if (!processInfo) {
      return new NextResponse('Not found', { status: 404 });
    }

    const response = await fetch(processInfo.s3Url);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
