// app/api/image/tospring/route.ts

import { NextRequest, NextResponse } from 'next/server';

// POST 메서드 핸들러
export async function POST(request: NextRequest) {
  try {
    const { s3Key, method, originalFileName } = await request.json();

    // 데이터 수신 확인을 위한 로그
    console.log('Received data:', { s3Key, method, originalFileName });

    // Spring 서버로 요청을 보내는 로직 추가 (현재는 Mock 서버로 설정)
    const springResponse = await fetch(
      `${process.env.SPRING_API_URL}/process-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3Key,
          method,
          originalFileName,
        }),
      }
    );

    if (!springResponse.ok) {
      const errorData = await springResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Spring 서버 에러' },
        { status: springResponse.status }
      );
    }

    const data = await springResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
