import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFileStore } from "@/store/fileStore";
import { useTransformStore } from "@/store/transformStore";
import { useFileUpload } from "@/services/uploadService";
import { useUploadStore } from "@/store/uploadStore";
import { getImageDimensions } from "@/utils/image";

export function useFileProcessing() {
	const router = useRouter();
	const uploadMutation = useFileUpload();
	const { isUploading, stage } = useUploadStore();
	const {
		files,
		uploadStatus,
		setUploadStatus,
		resetFileStore,
		setProcessingOption,
		updateFile,
		removeFile,
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

	// 파일 dimension 설정
	useEffect(() => {
		if (files.length === 0) {
			router.push("/");
			return;
		}
		files.forEach(async (fileItem, index) => {
			if (!fileItem.dimensions) {
				try {
					const dims = await getImageDimensions(fileItem.previewUrl);
					updateFile(index, {
						dimensions: { width: dims.width, height: dims.height },
					});
				} catch (error) {
					console.error("Error loading image dimensions", error);
				}
			}
		});
	}, [files, router, updateFile]);

	// 메서드 토글 핸들러
	const handleMethodToggle = (fileIndex: number, methodId: string) => {
		const { processingOption } = files[fileIndex];
		if (processingOption?.method === methodId) {
			setProcessingOption(fileIndex, null);
		} else {
			if (methodId === "uncrop") {
				setProcessingOption(fileIndex, {
					method: "uncrop",
					aspectRatio: "1:1",
				});
			} else if (methodId === "upscale") {
				setProcessingOption(fileIndex, { method: "upscale", factor: "x1" });
			} else if (methodId === "square") {
				setProcessingOption(fileIndex, { method: "square" });
			}
		}
	};

	// 비율 변경 핸들러
	const handleAspectRatioChange = (
		fileIndex: number,
		ratio: "1:1" | "1:2" | "2:1"
	) => {
		const currentOption = files[fileIndex].processingOption;
		if (currentOption?.method === "uncrop") {
			setProcessingOption(fileIndex, { ...currentOption, aspectRatio: ratio });
		}
	};

	// 업스케일 팩터 변경 핸들러
	const handleUpscaleFactorChange = (
		fileIndex: number,
		factor: "x1" | "x2" | "x4"
	) => {
		const currentOption = files[fileIndex].processingOption;
		if (currentOption?.method === "upscale") {
			setProcessingOption(fileIndex, { ...currentOption, factor });
		}
	};

	// 파일 제거 핸들러
	const handleRemoveFile = (index: number) => {
		removeFile(index);
	};

	// 취소 핸들러
	const handleCancel = () => {
		resetFileStore();
		router.push("/");
	};

	// 처리 시작 핸들러
	const handleProcess = async () => {
		if (files.length === 0) return;

		const hasProcessingOptions = files.every(
			(file) => file.processingOption !== null
		);
		if (!hasProcessingOptions) {
			setUploadStatus({
				stage: "idle",
				error: "처리 옵션을 모두 선택해주세요.",
			});
			return;
		}

		try {
			const results = await uploadMutation.mutateAsync(files.map((f) => f.file));

			const transformDataArray = results.map((result, index) => ({
				s3Key: result.s3Key,
				processingOptions: files[index].processingOption,
				originalFileName: files[index].file.name,
				previewUrl: files[index].previewUrl,
				width: files[index].dimensions?.width || 800,
				height: files[index].dimensions?.height || 600,
			}));

			useTransformStore.getState().setTransformData(transformDataArray);

			setTimeout(() => {
				router.push("/transform");
			}, 100);
		} catch (error) {
			console.error("Upload failed:", error);
		}
	};

	return {
		files,
		totalFiles,
		totalSize,
		uploadStatus,
		isUploading,
		stage,
		handleMethodToggle,
		handleAspectRatioChange,
		handleUpscaleFactorChange,
		handleRemoveFile,
		handleCancel,
		handleProcess,
	};
}
