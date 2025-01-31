// utils/download.ts
import { TransformData } from '@/store/transformStore';
import JSZip from 'jszip';

export async function downloadZip(successfulData: TransformData[]) {
  const zip = new JSZip();

  // 각 이미지를 ZIP에 추가
  await Promise.all(
    successfulData.map(async (item) => {
      if (!item.processedImageUrl) return;

      try {
        const response = await fetch(item.processedImageUrl);
        const blob = await response.blob();
        zip.file(item.originalFileName, blob);
      } catch (error) {
        console.error(`Failed to add ${item.originalFileName} to ZIP:`, error);
      }
    })
  );

  // ZIP 파일 생성 및 다운로드
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'processed_images.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
