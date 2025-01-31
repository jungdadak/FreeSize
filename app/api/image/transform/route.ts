import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';

const SPRING_API_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';

interface Metadata {
  aspectRatio?: string;
  targetRes?: string;
  factor?: string;
  s3Key: string;
  originalFileName: string;
  width: number;
  height: number;
}

async function sendToSpringApi(formData: FormData, method: string) {
  try {
    console.log(
      `\n🔍 [DEBUG] Spring API Request Details for method: ${method}`
    );
    console.log(`🌐 API Endpoint: ${SPRING_API_BASE}/staging/${method}`);

    // FormData 상세 로깅
    console.log('\n📦 FormData Contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`   📄 ${key}: File detected`);
        console.log(`      - Name: ${value.name}`);
        console.log(`      - Size: ${value.size} bytes`);
        console.log(`      - Type: ${value.type}`);
      } else {
        console.log(`   🔹 ${key}: ${value}`);
      }
    }

    // taskId 특별 확인
    const taskId = formData.get('taskId');
    console.log(`\n🔑 TaskID Check:`, taskId ? `Found: ${taskId}` : 'MISSING');

    // 파일 특별 확인
    const file = formData.get('file');
    console.log(
      '\n📎 File Check:',
      file instanceof File
        ? {
            name: (file as File).name,
            size: (file as File).size,
            type: (file as File).type,
          }
        : 'MISSING'
    );

    console.log('\n📡 Sending request to Spring API...');

    const response = await fetch(`${SPRING_API_BASE}/staging/${method}`, {
      method: 'POST',
      body: formData,
    });

    console.log(`\n📥 Spring API Response:`);
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Status Text: ${response.statusText}`);
    console.log(
      `   - Headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ Spring API Error Details:`);
      console.error(`   - Status: ${response.status}`);
      console.error(`   - Error: ${errorText}`);
      throw new Error(errorText);
    }

    const responseData = await response.json();
    console.log(
      `\n✅ Spring API Success Response:`,
      JSON.stringify(responseData, null, 2)
    );

    return responseData;
  } catch (error) {
    console.error(`\n💥 Spring API Request Failed:`);
    console.error(`   - Method: ${method}`);
    console.error(`   - Error:`, error);
    if (error instanceof Error) {
      console.error(`   - Stack:`, error.stack);
    }
    throw error;
  }
}

function appendMetadataToFormData(
  formData: FormData,
  metadata: Metadata,
  method: string
): void {
  console.log(`\n🔧 Appending Metadata for method: ${method}`);
  console.log('   - Original metadata:', metadata);

  switch (method) {
    case 'uncrop':
      if (metadata.aspectRatio) {
        formData.append('targetRatio', metadata.aspectRatio);
        console.log(`   - Added targetRatio: ${metadata.aspectRatio}`);
      }
      break;
    case 'square':
      if (metadata.targetRes) {
        formData.append('targetRes', metadata.targetRes);
        console.log(`   - Added targetRes: ${metadata.targetRes}`);
      }
      break;
    case 'upscale':
      if (metadata.factor) {
        const ratio = metadata.factor.replace('x', '');
        formData.append('upscaleRatio', ratio);
        console.log(`   - Added upscaleRatio: ${ratio}`);
      }
      break;
  }
}

export async function POST(request: Request) {
  try {
    console.log(`\n📥 [START] Image Transform Request`);
    console.log(`   - Timestamp: ${new Date().toISOString()}`);

    const formData = await request.formData();
    console.log('\n🔍 REQUEST HEADERS:', request.headers);

    // FormData 전체 내용 상세 로깅
    console.log('\n📦 INITIAL FORMDATA DETAILED CONTENT:');
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (value instanceof File) {
        console.log(`   📄 ${key}:`, {
          type: 'File',
          name: value.name,
          size: value.size,
          contentType: value.type,
        });
      } else {
        console.log(`   🔹 ${key}:`, value);
      }
    }

    console.log(`\n📊 FormData Summary:`);
    console.log(`   - Total Entries: ${entries.length}`);
    console.log(`   - Entry Keys: ${entries.map(([key]) => key).join(', ')}`);
    console.log(
      `   - Files Count: ${
        Array.from(formData.entries()).filter(([, v]) => v instanceof File)
          .length
      }`
    );

    if (entries.length === 0) {
      console.error('\n❌ ERROR: No entries found in FormData');
      throw new Error('FormData is empty');
    }

    if (entries.length % 3 !== 0) {
      console.error('\n⚠️ WARNING: Number of entries is not divisible by 3');
      console.log(
        '   Expected format: method_X, file_X, metadata_X for each item'
      );
    }

    const results = [];

    for (let i = 0; i < entries.length; i += 3) {
      const index = Math.floor(i / 3);
      console.log(
        `\n🔄 Processing Batch ${index + 1}/${Math.ceil(entries.length / 3)}`
      );

      const method = formData.get(`method_${index}`) as string;
      const file = formData.get(`file_${index}`) as File;
      const metadataStr = formData.get(`metadata_${index}`) as string;

      console.log(`\n📝 Batch ${index + 1} Details:`);
      console.log(`   - Method: ${method}`);
      console.log(`   - File Present: ${!!file}`);
      console.log(`   - Metadata Present: ${!!metadataStr}`);

      const metadata = JSON.parse(metadataStr) as Metadata;
      console.log(`   - Parsed Metadata:`, metadata);

      const newFormData = new FormData();
      newFormData.append('file', file);
      newFormData.append('taskId', metadata.s3Key);
      newFormData.append('originalFileName', metadata.originalFileName);
      newFormData.append('width', metadata.width.toString());
      newFormData.append('height', metadata.height.toString());

      appendMetadataToFormData(newFormData, metadata, method);

      console.log('\n🔍 Final FormData Verification:');
      for (const [key, value] of newFormData.entries()) {
        if (value instanceof File) {
          console.log(
            `   - ${key}: [File] ${value.name} (${value.size} bytes)`
          );
        } else {
          console.log(`   - ${key}: ${value}`);
        }
      }

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

          console.log(`\n✅ Batch ${index + 1} Processed Successfully:`);
          console.log(`   - ProcessID: ${processId}`);
          console.log(`   - File: ${metadata.originalFileName}`);
        } else {
          console.error(`\n⚠️ Batch ${index + 1} Failed:`);
          console.error(`   - Error: ${springResponse.message}`);
          results.push({
            processId: '',
            originalFileName: metadata.originalFileName,
            error: springResponse.message,
          });
        }
      } catch (error) {
        console.error(`\n💥 Batch ${index + 1} Processing Error:`);
        console.error(`   - File: ${metadata.originalFileName}`);
        console.error(`   - Error:`, error);

        results.push({
          processId: '',
          originalFileName: metadata.originalFileName,
          error: 'Processing failed',
        });
      }
    }

    console.log(`\n📤 Final Results:`, JSON.stringify(results, null, 2));
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error(`\n💥 Global Error:`);
    console.error(`   - Error:`, error);
    if (error instanceof Error) {
      console.error(`   - Stack:`, error.stack);
    }

    return NextResponse.json(
      { success: false, message: 'Processing failed' },
      { status: 500 }
    );
  }
}
