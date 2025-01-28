export interface ImageDimensions {
  width: number;
  height: number;
}

export const getImageDimensions = (url: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

export const formatDimensions = (dimensions: ImageDimensions): string => {
  return `${dimensions.width} × ${dimensions.height}`;
};

export const getFileSize = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const sizeInMB = blob.size / (1024 * 1024);
    return `${sizeInMB.toFixed(2)}MB`;
  } catch (error) {
    console.error('Failed to get file size:', error);
    return 'Unknown size';
  }
};
