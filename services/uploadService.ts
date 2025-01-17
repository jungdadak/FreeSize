// services/uploadService.ts
import { useMutation } from '@tanstack/react-query';
import { useUploadStore } from '@/store/uploadStore';

// 파일 업로드 함수
async function uploadToS3(
  url: string,
  fields: Record<string, string>,
  file: File,
  onProgress: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        onProgress(percentCompleted);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.open('POST', url);
    xhr.send(formData);
  });
}

// Presigned URL 요청 함수
async function getPresignedUrl(filename: string) {
  const res = await fetch(`/api/image?file=${encodeURIComponent(filename)}`);
  if (!res.ok) {
    throw new Error(`Failed to get presigned URL for ${filename}`);
  }
  return res.json();
}

export function useFileUpload() {
  const { startUpload, setProgress, setStage, setError } = useUploadStore();

  return useMutation({
    mutationFn: async (files: File[]) => {
      try {
        startUpload();
        setStage('getting-url');

        // Get presigned URLs for all files
        const presignedResults = await Promise.all(
          files.map(async (file) => {
            const presignedData = await getPresignedUrl(file.name);
            if (!presignedData.success) {
              throw new Error(
                presignedData.error || 'Failed to get presigned URL'
              );
            }
            return {
              file,
              presigned: presignedData.data.presigned,
              s3Key: presignedData.data.s3Key,
            };
          })
        );

        // Upload files one by one
        setStage('uploading');
        for (let i = 0; i < presignedResults.length; i++) {
          const { file, presigned } = presignedResults[i];
          await uploadToS3(presigned.url, presigned.fields, file, (progress) =>
            setProgress(i, progress)
          );
        }

        return presignedResults;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Upload failed';
        setError(message);
        throw error;
      }
    },
  });
}
