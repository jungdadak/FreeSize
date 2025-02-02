//hooks/useFileProcessing.ts
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/fileStore';
import { useTransformStore } from '@/store/transformStore';
import { useUploadStore } from '@/store/uploadStore';
import { useFileUpload } from '@/services/uploadService';
import { getImageDimensions } from '@/utils/image';

export function useFileProcessing() {
  const router = useRouter();
  const { stage } = useUploadStore();
  const fileUpload = useFileUpload();
  const {
    files,
    uploadStatus,
    setUploadStatus,
    resetFileStore,
    setProcessingOption,
    updateFile,
    removeFile,
    addFile,
  } = useFileStore();

  const totalFiles = useMemo(() => files.length, [files]);
  const totalSize = useMemo(
    () =>
      (
        files.reduce((acc, item) => acc + item.file.size, 0) /
        (1024 * 1024)
      ).toFixed(2),
    [files]
  );

  useEffect(() => {
    files.forEach(async (fileItem, index) => {
      if (!fileItem.dimensions) {
        try {
          const dims = await getImageDimensions(fileItem.previewUrl);
          updateFile(index, {
            dimensions: { width: dims.width, height: dims.height },
          });
        } catch (error) {
          console.error('Error loading image dimensions', error);
        }
      }
    });
  }, [files, updateFile]);

  const handleMethodToggle = (fileIndex: number, methodId: string) => {
    const { processingOption } = files[fileIndex];
    if (processingOption?.method === methodId) {
      setProcessingOption(fileIndex, null);
    } else {
      if (methodId === 'uncrop') {
        setProcessingOption(fileIndex, {
          method: 'uncrop',
          aspectRatio: '1:2',
        });
      } else if (methodId === 'upscale') {
        setProcessingOption(fileIndex, { method: 'upscale', factor: 'x1' });
      } else if (methodId === 'square') {
        setProcessingOption(fileIndex, { method: 'square', targetRes: '1024' });
      }
    }
  };

  const handleAspectRatioChange = (fileIndex: number, ratio: '1:2' | '2:1') => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'uncrop') {
      setProcessingOption(fileIndex, { ...currentOption, aspectRatio: ratio });
    }
  };

  const handleUpscaleFactorChange = (
    fileIndex: number,
    factor: 'x1' | 'x2' | 'x4'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'upscale') {
      setProcessingOption(fileIndex, { ...currentOption, factor });
    }
  };

  const handleSquareTargetResChange = (
    fileIndex: number,
    targetRes: '1024' | '1568' | '2048'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'square') {
      setProcessingOption(fileIndex, { ...currentOption, targetRes });
    }
  };

  const handleRemoveFile = (index: number) => {
    removeFile(index);
  };

  const handleCancel = () => {
    resetFileStore();
    useUploadStore.getState().reset();
    router.push('/');
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setUploadStatus({
        stage: 'idle',
        error: '처리할 파일이 없습니다.',
      });
      return;
    }

    const hasProcessingOptions = files.every(
      (file) => file.processingOption !== null
    );

    if (!hasProcessingOptions) {
      setUploadStatus({
        stage: 'idle',
        error: '처리 옵션을 모두 선택해주세요.',
      });
      return;
    }

    try {
      // 1. S3 업로드 실행
      const filesToUpload = files.map((item) => item.file);
      const uploadResults = await fileUpload.mutateAsync(filesToUpload);

      // 2. TransformData 생성
      const transformDataArray = files.map((file, index) => ({
        file: file.file,
        previewUrl: file.previewUrl,
        originalFileName: file.file.name,
        s3Key: uploadResults[index].s3Key,
        dimensions: {
          width: file.dimensions?.width || 800,
          height: file.dimensions?.height || 600,
        },
        processingOptions: file.processingOption || {
          method: 'upscale',
          factor: 'x1',
        },
      }));

      console.log('Setting transform data:', transformDataArray);
      useTransformStore.getState().setTransformData(transformDataArray);
      router.push('/transform/result');
    } catch (error) {
      console.error('Processing preparation failed:', error);
      setUploadStatus({
        stage: 'idle',
        error: '처리 준비 중 오류가 발생했습니다.',
      });
    }
  };

  return {
    files,
    totalFiles,
    totalSize,
    uploadStatus,
    addFile,
    stage,
    handleMethodToggle,
    handleAspectRatioChange,
    handleUpscaleFactorChange,
    handleSquareTargetResChange,
    handleRemoveFile,
    handleCancel,
    handleProcess,
  };
}
