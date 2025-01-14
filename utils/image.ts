// utils/image.ts
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
			reject(new Error("Failed to load image"));
		};
		img.src = url;
	});
};

export const formatDimensions = (dimensions: ImageDimensions): string => {
	return `${dimensions.width} × ${dimensions.height}`;
};
