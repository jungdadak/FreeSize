import { APIResponse } from '@/types';
import { NextResponse } from 'next/server';

const SPRING_API_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';

// sendToSpringApi 함수 수정
async function sendToSpringApi<T>(
  formData: FormData,
  url: string
): Promise<APIResponse<T>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 10초 타임아웃

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      signal: controller.signal,
      body: formData,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to send data to ${url}: ${errorData}`);
    }

    // 응답 값을 먼저 unknown으로 변환 후 APIResponse<T>로 캐스팅
    const responseData = (await response.json()) as unknown;

    // 타입 검사: responseData가 APIResponse<T>의 형태인지 확인
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'success' in responseData &&
      typeof (responseData as APIResponse<T>).success === 'boolean'
    ) {
      return responseData as APIResponse<T>;
    } else {
      throw new Error(`Invalid response format from ${url}`);
    }
  } catch (error) {
    console.error(`Error sending to ${url}:`, error);
    return {
      code: 1,
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    } as APIResponse<T>;
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

    console.log('5️⃣ Spring API 요청 시작');

    const requests = [
      ...uncropData.map((data) =>
        sendToSpringApi<string>(data, `${SPRING_API_BASE}/uncrop`)
      ),
      ...upscaleData.map((data) =>
        sendToSpringApi<string>(data, `${SPRING_API_BASE}/upscale`)
      ),
      ...squareData.map((data) =>
        sendToSpringApi<string>(data, `${SPRING_API_BASE}/square`)
      ),
    ];

    const results = await Promise.allSettled(requests);

    // 성공한 요청만 필터링
    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<APIResponse<string>> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);

    // 실패한 요청만 필터링
    const failedResults = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected'
      )
      .map((result) => result.reason);

    console.log('6️⃣ API 요청 완료');
    console.log('✅ 성공:', successfulResults);
    console.log('❌ 실패:', failedResults);

    return NextResponse.json({
      success: true,
      results: successfulResults,
      errors: failedResults,
    });
  } catch (error) {
    console.error('❌ 전체 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
