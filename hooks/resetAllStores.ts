import { useEffect, useRef } from 'react';
import { useFileStore } from '@/store/fileStore';
import { useTransformStore } from '@/store/transformStore';
import { useUploadStore } from '@/store/uploadStore';

export const useResetStoresOnUnmount = () => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    return () => {
      // 개발 환경의 strict mode로 인한 리마운트시에는 리셋하지 않음
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      useFileStore.getState().resetFileStore();
      useTransformStore.getState().reset();
      useUploadStore.getState().reset();
    };
  }, []);
};
