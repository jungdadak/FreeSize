// app/api/image/transform/route.ts
import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';

const SPRING_API_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';
const S3_BUCKET_URL = process.env.SPRING_S3_BUCKET_URL;
// 불완전한 s3url을 완전한 s3주소로 바꿔주는 함수 정의 ^^
function getFullS3Url(partialUrl: string): string {
  // S3_BUCKET_URL이 없으면 원본 반환
  if (!S3_BUCKET_URL) {
    return partialUrl;
  }

  // 이미 완전한 S3 URL인 경우
  if (partialUrl.includes('.s3.ap-northeast-2.amazonaws.com')) {
    return partialUrl;
  }

  // freesize-0080 도메인을 S3 버킷 URL로 교체
  if (partialUrl.includes('freesize-0080')) {
    return partialUrl.replace('https://freesize-0080', S3_BUCKET_URL);
  }

  // 그 외의 경우 (상대 경로 등)
  const cleanUrl = partialUrl.startsWith('/')
    ? partialUrl.substring(1)
    : partialUrl;
  return `${S3_BUCKET_URL}/${cleanUrl}`;
}
interface TransformMetadata {
  taskId: string;
  originalFileName: string; // processStore 저장용
  aspectRatio?: '1:2' | '2:1';
  factor?: 'x1' | 'x2' | 'x4';
  targetRes?: '1024' | '1568' | '2048';
}

async function sendToSpringApi(formData: FormData, method: string) {
  try {
    console.log(`📡 Sending request to Spring API [${method}]...`);

    // FormData 내용 확인
    for (const [key, value] of formData.entries()) {
      console.log(`🔹 ${key}:`, value);
    }

    const response = await fetch(`${SPRING_API_BASE}/${method}`, {
      method: 'POST',
      body: formData,
    });

    console.log(`📤 Spring API Response (${method}): ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🚨 Spring API Error (${method}):`, errorText);
      throw new Error(errorText);
    }

    const responseData = await response.json();
    console.log(`✅ Spring API Success (${method}):`, responseData);

    return responseData;
  } catch (error) {
    console.error(`🚨 Spring API Request Failed (${method}):`, error);
    throw error;
  }
}

function appendMetadataToFormData(
  formData: FormData,
  metadata: TransformMetadata,
  method: string
): void {
  // taskId는 필수
  formData.append('taskId', metadata.taskId);

  // 메서드별 필수 파라미터
  switch (method) {
    case 'uncrop':
      if (!metadata.aspectRatio)
        throw new Error('aspectRatio is required for uncrop');
      formData.append('targetRatio', metadata.aspectRatio);
      break;
    case 'square':
      if (!metadata.targetRes)
        throw new Error('targetRes is required for square');
      formData.append('targetRes', metadata.targetRes);
      break;
    case 'upscale':
      if (!metadata.factor) throw new Error('factor is required for upscale');
      formData.append('upscaleRatio', metadata.factor.replace('x', ''));
      break;
  }
}

export async function POST(request: Request) {
  try {
    console.log(`📥 Received image transform request`);

    const formData = await request.formData();
    const results = [];

    const entries = Array.from(formData.entries());
    console.log(`📦 Total FormData Entries: ${entries.length}`);

    for (let i = 0; i < entries.length; i += 3) {
      const index = Math.floor(i / 3);
      const method = formData.get(`method_${index}`) as string;
      const file = formData.get(`file_${index}`) as File;
      const metadata = JSON.parse(
        formData.get(`metadata_${index}`) as string
      ) as TransformMetadata;

      console.log(
        `🔹 Processing image [${metadata.originalFileName}] using method: ${method}`
      );

      const springFormData = new FormData();
      springFormData.append('file', file);

      try {
        appendMetadataToFormData(springFormData, metadata, method);
        const springResponse = await sendToSpringApi(springFormData, method);

        if (springResponse.code === 200) {
          const processId = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          console.log('Original S3 URL:', springResponse.url);

          const fullS3Url = getFullS3Url(springResponse.url);
          console.log('Transformed S3 URL:', fullS3Url);
          console.log('S3_BUCKET_URL env:', S3_BUCKET_URL); // 환경변수 확인

          processStore.set(processId, {
            s3Url: fullS3Url,
            originalFileName: metadata.originalFileName,
            method,
          });
          const storedInfo = processStore.get(processId);
          console.log('Stored process info:', storedInfo);

          results.push({
            processId,
            originalFileName: metadata.originalFileName,
          });

          console.log(
            `✅ Image processed successfully: ${metadata.originalFileName}`
          );
        } else {
          results.push({
            processId: '',
            originalFileName: metadata.originalFileName,
            error: springResponse.message,
          });

          console.error(
            `❌ Image processing failed: ${metadata.originalFileName} - ${springResponse.message}`
          );
        }
      } catch (error) {
        console.error(
          `🚨 Failed to process ${metadata.originalFileName}:`,
          error
        );
        results.push({
          processId: '',
          originalFileName: metadata.originalFileName,
          error: error instanceof Error ? error.message : 'Processing failed',
        });
      }
    }

    console.log(`📤 Sending response back to client`, results);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error(`🚨 Error in transform API route:`, error);
    return NextResponse.json(
      { success: false, message: 'Processing failed' },
      { status: 500 }
    );
  }
}
