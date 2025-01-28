import { useEffect } from 'react';
import { useFileStore } from '@/store/fileStore';
import { useTransformStore } from '@/store/transformStore';
import { useUploadStore } from '@/store/uploadStore';

export const useResetStoresOnUnmount = () => {
  useEffect(() => {
    // 언마운트될 때만 실행되는 클린업 함수 반환
    return () => {
      useFileStore.getState().resetFileStore();
      useTransformStore.getState().resetTransformData();
      useUploadStore.getState().reset();
    };
  }, []);
};
