// lib/constants.ts
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export interface ProcessingMethod {
	id: "uncrop" | "upscale";
	label: string;
	enabled: boolean;
}

export interface AspectRatio {
	id: "1:1" | "1:2" | "2:1";
	label: string;
}

export interface ScaleMark {
	value: number;
	label: string;
}

export const PROCESSING_METHODS: ProcessingMethod[] = [
	{ id: "uncrop", label: "Uncrop Image", enabled: false },
	{ id: "upscale", label: "Upscale Resolution", enabled: false },
];

export const ASPECT_RATIOS = [
	{ id: "1:1" as const, label: "1:1 Square" },
	{ id: "1:2" as const, label: "1:2 Portrait" },
	{ id: "2:1" as const, label: "2:1 Landscape" },
];
