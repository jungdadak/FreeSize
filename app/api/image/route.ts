import { NextRequest, NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileName = searchParams.get('file');

  if (!fileName) {
    return NextResponse.json(
      { error: 'File name is required' },
      { status: 400 }
    );
  }

  const s3Client = new S3Client({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY!,
      secretAccessKey: process.env.SECRET_KEY!,
    },
  });

  try {
    const url = await createPresignedPost(s3Client, {
      Bucket: process.env.BUCKET_NAME!,
      Key: fileName,
      Fields: { key: fileName },
      Expires: 60,
      Conditions: [['content-length-range', 0, 10485760]], // Max 1MB
    });

    return NextResponse.json(url);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
