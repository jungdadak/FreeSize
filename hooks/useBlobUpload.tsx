// useFileUpload.ts
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/fileStore';

export const useBlobUpload = () => {
  const router = useRouter();
  const setFile = useFileStore((state) => state.setFile);
  const setPreviewUrl = useFileStore((state) => state.setPreviewUrl);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert('Only JPG and PNG files are allowed');
      return false;
    }
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  const handleFileUpload = (file: File) => {
    if (validateFile(file)) {
      const previewUrl = URL.createObjectURL(file);
      setFile(file);
      setPreviewUrl(previewUrl);
      router.push('/preview');
    }
  };

  return { handleFileUpload };
};
