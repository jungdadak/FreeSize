import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/fileStore';
import { useTransformStore } from '@/store/transformStore';
import { useUploadStore } from '@/store/uploadStore';
import { getImageDimensions } from '@/utils/image';

export function useFileProcessing() {
  const router = useRouter();
  const { stage } = useUploadStore();
  const {
    files,
    uploadStatus,
    setUploadStatus,
    resetFileStore,
    setProcessingOption,
    updateFile,
    removeFile,
    addFile, // 노출시킬 addFile 메소드
  } = useFileStore();

  // 파일 갯수와 크기 계산
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
    // 파일이 없을 때 리다이렉트하는 로직 제거
    // 대신 이미지 차원 계산 로직만 유지
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

  // 메서드 토글 핸들러
  const handleMethodToggle = (fileIndex: number, methodId: string) => {
    const { processingOption } = files[fileIndex];
    if (processingOption?.method === methodId) {
      setProcessingOption(fileIndex, null);
    } else {
      if (methodId === 'uncrop') {
        setProcessingOption(fileIndex, {
          method: 'uncrop',
          aspectRatio: '1:1',
        });
      } else if (methodId === 'upscale') {
        setProcessingOption(fileIndex, { method: 'upscale', factor: 'x1' });
      } else if (methodId === 'square') {
        setProcessingOption(fileIndex, { method: 'square', targetRes: '1024' });
      }
    }
  };

  // 비율 변경 핸들러
  const handleAspectRatioChange = (
    fileIndex: number,
    ratio: '1:1' | '1:2' | '2:1'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'uncrop') {
      setProcessingOption(fileIndex, { ...currentOption, aspectRatio: ratio });
    }
  };

  // 업스케일 팩터 변경 핸들러
  const handleUpscaleFactorChange = (
    fileIndex: number,
    factor: 'x1' | 'x2' | 'x4'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'upscale') {
      setProcessingOption(fileIndex, { ...currentOption, factor });
    }
  };

  // Square 타겟 해상도 변경 핸들러
  const handleSquareTargetResChange = (
    fileIndex: number,
    targetRes: '1024' | '1568' | '2048'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'square') {
      setProcessingOption(fileIndex, { ...currentOption, targetRes });
    }
  };

  // 파일 제거 핸들러
  const handleRemoveFile = (index: number) => {
    removeFile(index);
  };

  // 취소 핸들러
  const handleCancel = () => {
    resetFileStore();
    useUploadStore.getState().reset();
    router.push('/');
  };

  // 처리 시작 핸들러
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
      const transformDataArray = files.map((file) => ({
        file: file.file,
        previewUrl: file.previewUrl,
        originalFileName: file.file.name,
        s3Key: `${Date.now()}-${file.file.name}`,
        dimensions: {
          // 올바른 dimensions 구조로 변경
          width: file.dimensions?.width || 800,
          height: file.dimensions?.height || 600,
        },
        processingOptions: file.processingOption || {
          method: 'upscale',
          factor: 'x1',
        },
      }));

      console.log('Setting transform data:', transformDataArray); // 데이터 확인용 로그
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
    addFile, // addFile 메소드 노출

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
