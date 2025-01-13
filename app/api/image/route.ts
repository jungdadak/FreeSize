// app/api/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { s3Client, generateUniqueFileName } from '@/lib/s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import type { APIResponse, PresignedPostResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const fileName = request.nextUrl.searchParams.get('file');
    if (!fileName) {
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: 'File name is required',
        },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded
      ? forwarded.split(',')[0]
      : request.headers.get('x-real-ip') || 'unknown';

    const uniqueFileName = generateUniqueFileName(clientIp, fileName);

    const url = await createPresignedPost(s3Client, {
      Bucket: process.env.BUCKET_NAME!,
      Key: uniqueFileName,
      Fields: { key: uniqueFileName },
      Expires: 60,
      Conditions: [['content-length-range', 0, 10485760]],
    });

    return NextResponse.json<APIResponse<PresignedPostResponse>>({
      success: true,
      data: url,
    });
  } catch (error) {
    console.error('S3 presigned URL error:', error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
