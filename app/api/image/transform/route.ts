import { NextResponse } from 'next/server';

const SPRING_API_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';

async function sendToSpringApi(formData: FormData, url: string) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to send data to ${url}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error sending to ${url}:`, error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    console.log('1️⃣ POST 요청 시작');

    const formData = await request.formData();
    const entries = Array.from(formData.entries());

    const uncropData: FormData[] = [];
    const squareData: FormData[] = [];
    const upscaleData: FormData[] = [];

    for (let i = 0; i < entries.length; i += 3) {
      const method = formData.get(`method_${Math.floor(i / 3)}`) as string;
      const file = formData.get(`file_${Math.floor(i / 3)}`) as File;
      const metadata = JSON.parse(
        formData.get(`metadata_${Math.floor(i / 3)}`) as string
      );

      const newFormData = new FormData();
      newFormData.append('file', file);

      // 공통 메타데이터 추가
      newFormData.append('s3Key', metadata.s3Key);
      newFormData.append('width', metadata.width.toString());
      newFormData.append('height', metadata.height.toString());

      switch (method) {
        case 'uncrop':
          if (metadata.aspectRatio) {
            newFormData.append('targetRatio', metadata.aspectRatio);
          }
          uncropData.push(newFormData);
          break;
        case 'square':
          squareData.push(newFormData);
          break;
        case 'upscale':
          if (metadata.factor) {
            newFormData.append(
              'upscaleRatio',
              metadata.factor.replace('x', '')
            );
          }
          upscaleData.push(newFormData);
          break;
      }
    }

    console.log('4️⃣ 필터링 결과:', {
      uncrop: uncropData.length,
      square: squareData.length,
      upscale: upscaleData.length,
    });

    try {
      console.log('5️⃣ Spring API 요청 시작');
      console.log('SPRING_API_BASE:', SPRING_API_BASE);

      const results = await Promise.all([
        ...uncropData.map((data) =>
          sendToSpringApi(data, `${SPRING_API_BASE}/uncrop`)
        ),
        ...upscaleData.map((data) =>
          sendToSpringApi(data, `${SPRING_API_BASE}/upscale`)
        ),
        ...squareData.map((data) =>
          sendToSpringApi(data, `${SPRING_API_BASE}/square`)
        ),
      ]);

      console.log('6️⃣ API 요청 완료, 결과:', results);
      return NextResponse.json({ success: true, results });
    } catch (error) {
      console.error('❌ API 요청 실패:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'API request failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ 전체 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
