// app/api/image/transform/route.ts
import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';

const SPRING_API_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';

async function sendToSpringApi(formData: FormData, method: string) {
  try {
    const response = await fetch(`${SPRING_API_BASE}/staging/${method}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  } catch (error) {
    console.error(`Spring API error (${method}):`, error);
    throw error;
  }
}

function appendMetadataToFormData(
  formData: FormData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any,
  method: string
): void {
  switch (method) {
    case 'uncrop':
      if (metadata.aspectRatio) {
        formData.append('targetRatio', metadata.aspectRatio);
      }
      break;
    case 'square':
      if (metadata.targetRes) {
        formData.append('targetRes', metadata.targetRes);
      }
      break;
    case 'upscale':
      if (metadata.factor) {
        formData.append('upscaleRatio', metadata.factor.replace('x', ''));
      }
      break;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const results = [];

    const entries = Array.from(formData.entries());
    for (let i = 0; i < entries.length; i += 3) {
      const index = Math.floor(i / 3);
      const method = formData.get(`method_${index}`) as string;
      const file = formData.get(`file_${index}`) as File;
      const metadata = JSON.parse(formData.get(`metadata_${index}`) as string);

      const newFormData = new FormData();
      newFormData.append('file', file);
      newFormData.append('s3Key', metadata.s3Key);
      newFormData.append('originalFileName', metadata.originalFileName);
      newFormData.append('width', metadata.width.toString());
      newFormData.append('height', metadata.height.toString());

      // 메타데이터 추가
      appendMetadataToFormData(newFormData, metadata, method);

      try {
        const springResponse = await sendToSpringApi(newFormData, method);
        if (springResponse.code === 0) {
          const processId = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          // S3 URL을 서버에 저장
          processStore.set(processId, {
            s3Url: springResponse.url,
            originalFileName: metadata.originalFileName,
            method,
          });

          // 클라이언트에는 processId만 반환
          results.push({
            processId,
            originalFileName: metadata.originalFileName,
          });
        } else {
          results.push({
            processId: '',
            originalFileName: metadata.originalFileName,
            error: springResponse.message,
          });
        }
      } catch {
        results.push({
          processId: '',
          originalFileName: metadata.originalFileName,
          error: 'Processing failed',
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Processing failed' },
      { status: 500 }
    );
  }
}
