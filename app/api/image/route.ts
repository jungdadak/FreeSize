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

  // 클라이언트 IP 가져오기
  const forwarded = request.headers.get('x-forwarded-for');
  const clientIp = forwarded
    ? forwarded.split(',')[0]
    : request.headers.get('x-real-ip');
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();

  // 새로운 파일명 생성: IP-UUID-타임스탬프-원본파일명
  const uniqueFileName = `${clientIp}-${uuid}-${timestamp}-${fileName}`;

  const s3Client = new S3Client({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY!,
      secretAccessKey: process.env.SECRET_KEY!,
    },
  });

  try {
    console.log('S3 config:', {
      region: 'ap-northeast-2',
      bucket: process.env.BUCKET_NAME,
      key: uniqueFileName,
    });

    const url = await createPresignedPost(s3Client, {
      Bucket: process.env.BUCKET_NAME!,
      Key: uniqueFileName,
      Fields: { key: uniqueFileName },
      Expires: 60,
      Conditions: [['content-length-range', 0, 10485760]],
    });

    console.log('Generated presigned URL:', {
      url: url.url,
      fieldCount: Object.keys(url.fields).length,
    });

    return NextResponse.json(url);
  } catch (error) {
    console.error('Detailed presigned URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL', details: error.message },
      { status: 500 }
    );
  }
}
