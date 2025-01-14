export interface ProcessingMethod {
	id: "uncrop" | "upscale";
	label: string;
	enabled: boolean;
}

export interface UncropOptions {
	aspectRatio: "1:1" | "1:2" | "2:1";
}

export interface UpscaleOptions {
	width: number;
	height: number;
}

export interface ProcessingOptions {
	uncrop?: UncropOptions;
	upscale?: UpscaleOptions;
}
