import { NextResponse } from 'next/server';

const SPRING_API_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';

async function sendToSpringApi(formData: FormData, url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // 필요한 경우 쿠키 포함
      mode: 'cors', // CORS 설정
      signal: controller.signal,
      body: formData,
    });

    clearTimeout(timeoutId); // 성공적인 응답을 받았으면 타이머 해제

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to send data to ${url}: ${errorData}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout for ${url}`);
      }
    }
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

    // entries를 3개씩 그룹화 (file, metadata, method)
    for (let i = 0; i < entries.length; i += 3) {
      const index = Math.floor(i / 3);
      const method = formData.get(`method_${index}`) as string;
      const file = formData.get(`file_${index}`) as File;
      const metadata = JSON.parse(formData.get(`metadata_${index}`) as string);

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
          if (metadata.targetRes) {
            newFormData.append('targetRes', metadata.targetRes);
          }
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
        default:
          console.warn(`Unknown method: ${method} at index ${index}`);
          break;
      }
    }

    try {
      console.log('5️⃣ Spring API 요청 시작');

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
