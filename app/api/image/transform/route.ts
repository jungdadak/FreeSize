import { NextResponse } from 'next/server';

interface TransformData {
  originalFileName: string;
  previewUrl: string;
  base64Image: string; // 추가된 필드
  processingOptions: {
    method: 'uncrop' | 'square' | 'upscale';
    aspectRatio?: string;
    factor?: string;
  };
  s3Key: string;
  width: number;
  height: number;
}

const SPRING_API_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';

// route.ts
export async function POST(request: Request) {
  try {
    console.log('1️⃣ POST 요청 시작');

    const transformData: unknown = await request.json();
    console.log('2️⃣ 받은 데이터:', JSON.stringify(transformData, null, 2));

    if (!Array.isArray(transformData)) {
      console.log('❌ 데이터가 배열이 아님');
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    console.log('3️⃣ 데이터 필터링 시작');
    // 필터링 전에 데이터 구조 확인
    console.log(
      '첫 번째 아이템 구조:',
      JSON.stringify(transformData[0], null, 2)
    );

    const uncropData = transformData.filter(
      (item: TransformData) => item.processingOptions?.method === 'uncrop'
    );
    const squareData = transformData.filter(
      (item: TransformData) => item.processingOptions?.method === 'square'
    );
    const upscaleData = transformData.filter(
      (item: TransformData) => item.processingOptions?.method === 'upscale'
    );

    console.log('4️⃣ 필터링 결과:', {
      uncrop: uncropData.length,
      square: squareData.length,
      upscale: upscaleData.length,
    });

    try {
      console.log('5️⃣ Spring API 요청 시작');
      console.log('SPRING_API_BASE:', SPRING_API_BASE);

      const results = await Promise.all([
        uncropData.length > 0
          ? sendToSpringApi(uncropData, `${SPRING_API_BASE}/uncrop`)
          : [],
        squareData.length > 0
          ? sendToSpringApi(squareData, `${SPRING_API_BASE}/square`)
          : [],
        upscaleData.length > 0
          ? sendToSpringApi(upscaleData, `${SPRING_API_BASE}/upscale`)
          : [],
      ]);

      console.log('6️⃣ API 요청 완료, 결과:', results);
      return NextResponse.json({ success: true, results });
    } catch (error: unknown) {
      console.error('❌ API 요청 실패:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'API request failed',
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('❌ 전체 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

async function sendToSpringApi(data: TransformData[], url: string) {
  if (data.length === 0) return { url, status: 'No data sent' };

  const results = await Promise.all(
    data.map(async (item) => {
      try {
        const requestBody = {
          file: item.base64Image, // 클라이언트에서 전달받은 base64
          originalFileName: item.originalFileName, // 추가된 필드
          s3Key: item.s3Key, // 추가된 필드
          width: item.width, // 추가된 필드
          height: item.height, // 추가된 필드
          ...(item.processingOptions.method === 'uncrop'
            ? { targetRatio: item.processingOptions.aspectRatio }
            : item.processingOptions.method === 'upscale'
            ? {
                upscaleRatio:
                  (item.processingOptions.factor || '').replace('x', '') || '1',
              }
            : {}),
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to send data to ${url}`);
        }

        return response.json();
      } catch (error) {
        console.error(`Error processing file ${item.originalFileName}:`, error);
        throw error;
      }
    })
  );

  return results;
}
