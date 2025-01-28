import JSZip from 'jszip';
import type { TransformData } from '@/store/transformStore';

export async function downloadZip(successfulImages: TransformData[]) {
  const zip = new JSZip();

  for (const item of successfulImages) {
    try {
      const base64Data = item.processedImageUrl?.split(',')[1];
      if (!base64Data) continue;

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      zip.file(`processed_${item.originalFileName}`, bytes, { binary: true });
    } catch (error) {
      console.error(`압축 실패: ${item.originalFileName}`, error);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = 'processed_images.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
