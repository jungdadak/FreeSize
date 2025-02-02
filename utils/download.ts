// utils/download.ts
import { TransformData } from '@/store/transformStore';
import JSZip from 'jszip';

/**
 * 이미지를 ZIP 파일로 다운로드하는 함수
 */
export async function downloadZip(successfulData: TransformData[]) {
  try {
    console.log(`📦 Creating ZIP with ${successfulData.length} images...`);
    const zip = new JSZip();

    // 각 이미지를 ZIP에 추가
    await Promise.all(
      successfulData.map(async (item) => {
        if (!item.processedImageUrl) {
          console.warn(
            `⚠️ Skipping image without URL: ${item.originalFileName}`
          );
          return;
        }

        try {
          console.log(`📥 Fetching: ${item.originalFileName}`);
          const response = await fetch(item.processedImageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }

          const blob = await response.blob();
          zip.file(item.originalFileName, blob);
          console.log(`✅ Added to ZIP: ${item.originalFileName}`);
        } catch (error) {
          console.error(
            `❌ Failed to add ${item.originalFileName} to ZIP:`,
            error
          );
        }
      })
    );

    // ZIP 파일 생성
    console.log('📦 Generating ZIP file...');
    const content = await zip.generateAsync({ type: 'blob' });

    // 다운로드 링크 생성 및 클릭
    const url = URL.createObjectURL(content);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed-images-${timestamp}.zip`;

    // 링크 클릭하여 다운로드 시작
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 메모리 정리
    URL.revokeObjectURL(url);
    console.log('✅ Download started successfully');
  } catch (error) {
    console.error('❌ ZIP creation failed:', error);
    throw new Error('Failed to create and download ZIP file');
  }
}
