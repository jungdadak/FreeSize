import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';

const SPRING_API_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';

async function sendToSpringApi(formData: FormData, method: string) {
  try {
    console.log(`📡 Sending request to Spring API [${method}]...`);

    // FormData 내용 확인
    for (const [key, value] of formData.entries()) {
      console.log(`🔹 ${key}:`, value);
    }

    const response = await fetch(`${SPRING_API_BASE}/staging/${method}`, {
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
    console.log(`📥 Received image transform request`);

    const formData = await request.formData();
    const results = [];

    const entries = Array.from(formData.entries());
    console.log(`📦 Total FormData Entries: ${entries.length}`);

    for (let i = 0; i < entries.length; i += 3) {
      const index = Math.floor(i / 3);
      const method = formData.get(`method_${index}`) as string;
      const file = formData.get(`file_${index}`) as File;
      const metadata = JSON.parse(formData.get(`metadata_${index}`) as string);

      console.log(
        `🔹 Processing image [${metadata.originalFileName}] using method: ${method}`
      );

      const newFormData = new FormData();
      newFormData.append('file', file);
      newFormData.append('taskId', metadata.s3Key);
      newFormData.append('originalFileName', metadata.originalFileName);
      newFormData.append('width', metadata.width.toString());
      newFormData.append('height', metadata.height.toString());

      appendMetadataToFormData(newFormData, metadata, method);

      try {
        const springResponse = await sendToSpringApi(newFormData, method);

        if (springResponse.code === 0) {
          const processId = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          processStore.set(processId, {
            s3Url: springResponse.url,
            originalFileName: metadata.originalFileName,
            method,
          });

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
      } catch {
        results.push({
          processId: '',
          originalFileName: metadata.originalFileName,
          error: 'Processing failed',
        });

        console.error(
          `🚨 Processing request failed for: ${metadata.originalFileName}`
        );
      }
    }

    console.log(`📤 Sending response back to client`, results);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error(`🚨 Error processing transform request`, error);
    return NextResponse.json(
      { success: false, message: 'Processing failed' },
      { status: 500 }
    );
  }
}
