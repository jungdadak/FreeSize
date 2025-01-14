// hooks/useFileUpload.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFileStore } from "@/store/fileStore";
import { MAX_FILE_SIZE, ALLOWED_TYPES } from "@/lib/constants";
import type { PresignedPostResponse, APIResponse } from "@/types";
import type { ProcessingOptions } from "@/types/transform";

export const useFileUpload = () => {
	const router = useRouter();
	const { file, previewUrl, setUploadStatus } = useFileStore();
	const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
		// uncrop과 upscale 옵션을 위한 초기 상태
		uncrop: undefined,
		upscale: undefined,
	});

	const validateFile = () => {
		if (!file) return "No file selected";
		if (!ALLOWED_TYPES.includes(file.type)) {
			return "지원하지 않는 파일 형식입니다.";
		}
		if (file.size > MAX_FILE_SIZE) {
			return "파일 크기는 10MB를 초과할 수 없습니다.";
		}
		return null;
	};

	const handleProcess = async () => {
		if (!file) return;

		// 선택된 프로세싱 옵션이 없는 경우 처리하지 않음
		if (!processingOptions.uncrop && !processingOptions.upscale) {
			setUploadStatus({
				stage: "idle",
				error: "처리 옵션을 하나 이상 선택해주세요.",
			});
			return;
		}

		const validationError = validateFile();
		if (validationError) {
			setUploadStatus({ stage: "idle", error: validationError });
			return;
		}

		try {
			setUploadStatus({ stage: "getting-url" });

			// 1. presignedURL 요청
			const filename = encodeURIComponent(file.name);
			const res = await fetch("/api/image?file=" + filename, {
				method: "GET",
			});

			if (!res.ok) {
				throw new Error("Failed to get upload URL");
			}

			const presignedData =
				(await res.json()) as APIResponse<PresignedPostResponse>;

			if (!presignedData.success) {
				throw new Error(presignedData.error || "Failed to get upload URL");
			}

			// 2. Blob URL 정리
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}

			// 3. transform 페이지로 전달할 데이터 준비
			const transformData = {
				presignedUrl: presignedData.data!.url,
				presignedFields: presignedData.data!.fields,
				processingOptions,
				originalFileName: file.name,
			};

			// 4. transform 페이지로 이동
			router.push(
				`/transform?data=${encodeURIComponent(JSON.stringify(transformData))}`
			);
		} catch (error) {
			setUploadStatus({
				stage: "idle",
				error:
					error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
			});
		}
	};

	return {
		processingOptions,
		setProcessingOptions,
		handleProcess,
		validateFile,
	};
};
