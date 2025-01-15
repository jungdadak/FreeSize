// app/api/image/tospring/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { APIResponse, SpringProcessRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SpringProcessRequest;

    const springResponse = await fetch(
      `${process.env.SPRING_API_URL}/process-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!springResponse.ok) {
      const errorData = await springResponse.json();
      return NextResponse.json<APIResponse<null>>(
        {
          success: false,
          error: errorData.error || 'Spring 서버 에러',
        },
        { status: springResponse.status }
      );
    }

    const data = await springResponse.json();

    // 제네릭 타입에 구체적인 타입을 지정하여 resultUrl 포함
    return NextResponse.json<APIResponse<{ resultUrl: string }>>({
      success: true,
      data: {
        resultUrl: data.resultUrl,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json<APIResponse<null>>(
      {
        success: false,
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
