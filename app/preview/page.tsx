"use client";

import { useRouter } from "next/navigation";
import { useFileStore } from "@/store/fileStore";
import type { APIResponse, PresignedPostResponse } from "@/types";
import { PROCESSING_METHODS, ASPECT_RATIOS } from "@/lib/constants";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useEffect } from "react";
import { getImageDimensions, formatDimensions } from "@/utils/image";
// import type { ImageDimensions } from "@/utils/image";
import type { ProcessingMethod } from "@/types/transform";

export default function PreviewPage() {
	const router = useRouter();
	const {
		file,
		previewUrl,
		uploadStatus,
		setUploadStatus,
		resetFileStore,
		dimensions,
		setDimensions,
		processingOptions,
		setProcessingOptions,
		selectedMethods,
		setSelectedMethods,
	} = useFileStore();

	useEffect(() => {
		if (!file || !previewUrl) {
			router.push("/");
			return;
		}

		const loadDimensions = async () => {
			try {
				const dims = await getImageDimensions(previewUrl);
				setDimensions(dims);
			} catch (error) {
				console.error("Failed to load image dimensions:", error);
			}
		};

		loadDimensions();

		// Cleanup on unmount
		return () => {
			setProcessingOptions({});
			setSelectedMethods([]);
			setDimensions(null);
		};
	}, [
		file,
		previewUrl,
		router,
		setDimensions,
		setProcessingOptions,
		setSelectedMethods,
	]);

	const handleCancel = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setProcessingOptions({});
		setSelectedMethods([]);
		setDimensions(null);
		resetFileStore();
		router.push("/");
	};

	const handleMethodToggle = (methodId: ProcessingMethod["id"]) => {
		// Toggle the method in selectedMethods
		const updatedMethods = [...selectedMethods];
		const methodIndex = updatedMethods.findIndex((m) => m.id === methodId);
		if (methodIndex > -1) {
			// Toggle enabled
			updatedMethods[methodIndex] = {
				...updatedMethods[methodIndex],
				enabled: !updatedMethods[methodIndex].enabled,
			};
		} else {
			// Add new method with enabled=true
			const method = PROCESSING_METHODS.find((m) => m.id === methodId);
			if (method) {
				updatedMethods.push({ ...method, enabled: true });
			}
		}
		setSelectedMethods(updatedMethods);

		// Update processingOptions based on method toggle
		if (methodId === "uncrop") {
			if (updatedMethods.find((m) => m.id === "uncrop")?.enabled) {
				setProcessingOptions({
					...processingOptions,
					uncrop: { aspectRatio: "1:1" },
				});
			} else {
				const { ...rest } = processingOptions;
				setProcessingOptions(rest);
			}
		} else if (methodId === "upscale") {
			if (updatedMethods.find((m) => m.id === "upscale")?.enabled) {
				setProcessingOptions({
					...processingOptions,
					upscale: {
						width: dimensions ? dimensions.width : 800,
						height: dimensions ? dimensions.height : 600,
					},
				});
			} else {
				const { ...rest } = processingOptions;
				setProcessingOptions(rest);
			}
		}
	};

	const handleAspectRatioChange = (ratio: "1:1" | "1:2" | "2:1") => {
		setProcessingOptions({
			...processingOptions,
			uncrop: {
				...processingOptions.uncrop,
				aspectRatio: ratio,
			},
		});
	};

	const handleDimensionChange = (field: "width" | "height", value: number) => {
		if (!processingOptions.upscale) {
			setProcessingOptions({
				...processingOptions,
				upscale: {
					width: field === "width" ? value : 800,
					height: field === "height" ? value : 600,
				},
			});
		} else {
			setProcessingOptions({
				...processingOptions,
				upscale: {
					...processingOptions.upscale,
					[field]: value,
				},
			});
		}
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

			// 2. transform 페이지로 전달할 데이터 준비
			const transformData = {
				presignedUrl: presignedData.data!.url,
				presignedFields: presignedData.data!.fields,
				processingOptions,
				originalFileName: file.name,
				previewUrl, // Blob URL도 transform 페이지로 전달
			};

			// 3. transform 페이지로 이동 (Blob URL은 여기서 해제하지 않음)
			router.push(
				`/transform?data=${encodeURIComponent(JSON.stringify(transformData))}`
			);
		} catch (error) {
			// 에러 발생 시 Blob URL과 상태 정리
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			setProcessingOptions({});
			setSelectedMethods([]);
			setDimensions(null);
			resetFileStore();

			setUploadStatus({
				stage: "idle",
				error:
					error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
			});
		}
	};

	if (!file || !previewUrl) {
		return null;
	}

	const isUncropEnabled = processingOptions.uncrop !== undefined;
	const isUpscaleEnabled = processingOptions.upscale !== undefined;

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-black py-12">
			<div className="max-w-4xl mx-auto px-4">
				<div className="flex items-center mb-8">
					<button
						onClick={handleCancel}
						className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back
					</button>
				</div>

				<div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8">
					<div className="grid md:grid-cols-2 gap-8">
						<div className="relative">
							<Image
								src={previewUrl}
								alt="Preview"
								width={500}
								height={500}
								className="w-full rounded-lg object-contain max-h-96"
							/>
							<button
								onClick={handleCancel}
								className="absolute top-2 right-2 p-1 bg-gray-900/50 hover:bg-gray-900/70 rounded-full text-white"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="flex flex-col justify-between">
							<div>
								<h2 className="text-xl font-semibold mb-4">Image Details</h2>
								<p className="text-gray-600 dark:text-gray-300 mb-2">
									File name: {file.name}
								</p>
								<p className="text-gray-600 dark:text-gray-300 mb-2">
									Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
								</p>
								{dimensions && (
									<p className="text-gray-600 dark:text-gray-300 mb-4">
										Dimensions: {formatDimensions(dimensions)}
									</p>
								)}

								<div className="mb-6">
									<h3 className="text-lg font-medium mb-3">Processing Options</h3>
									<div className="space-y-4">
										{PROCESSING_METHODS.map((method) => (
											<div key={method.id} className="space-y-4">
												<div className="flex items-center space-x-2">
													<Checkbox
														id={method.id}
														checked={
															selectedMethods.find((m) => m.id === method.id)?.enabled || false
														}
														onCheckedChange={() => handleMethodToggle(method.id)}
													/>
													<label
														htmlFor={method.id}
														className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
													>
														{method.label}
													</label>
												</div>

												{method.id === "uncrop" && isUncropEnabled && (
													<div className="ml-6">
														<RadioGroup
															value={processingOptions.uncrop?.aspectRatio}
															onValueChange={(value: string) =>
																handleAspectRatioChange(value as "1:1" | "1:2" | "2:1")
															}
														>
															{ASPECT_RATIOS.map((ratio) => (
																<div key={ratio.id} className="flex items-center space-x-2">
																	<RadioGroupItem value={ratio.id} id={ratio.id} />
																	<label htmlFor={ratio.id}>{ratio.label}</label>
																</div>
															))}
														</RadioGroup>
													</div>
												)}

												{method.id === "upscale" && isUpscaleEnabled && (
													<div className="ml-6 space-y-4">
														<div className="flex flex-col">
															<label htmlFor="width" className="text-sm mb-1">
																Width (px)
															</label>
															<input
																type="number"
																id="width"
																min={1}
																value={processingOptions.upscale?.width || ""}
																onChange={(e) =>
																	handleDimensionChange("width", Number(e.target.value))
																}
																className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
															/>
														</div>
														<div className="flex flex-col">
															<label htmlFor="height" className="text-sm mb-1">
																Height (px)
															</label>
															<input
																type="number"
																id="height"
																min={1}
																value={processingOptions.upscale?.height || ""}
																onChange={(e) =>
																	handleDimensionChange("height", Number(e.target.value))
																}
																className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
															/>
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								</div>

								{uploadStatus.error && (
									<div className="flex flex-col items-center gap-4 mb-4">
										<p className="text-red-500 dark:text-red-400">{uploadStatus.error}</p>
										<button
											onClick={() => router.push("/")}
											className="text-purple-500 hover:text-purple-600"
										>
											처음으로 돌아가기
										</button>
									</div>
								)}
							</div>

							<div className="flex gap-4">
								<button
									onClick={handleCancel}
									className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
									disabled={uploadStatus.stage !== "idle"}
								>
									Cancel
								</button>
								<button
									onClick={handleProcess}
									disabled={
										uploadStatus.stage !== "idle" ||
										(!isUncropEnabled && !isUpscaleEnabled)
									}
									className="px-4 py-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg flex items-center disabled:opacity-50"
								>
									{uploadStatus.stage === "getting-url" ? (
										<>
											<Loader2 className="w-5 h-5 mr-2 animate-spin" />
											Getting ready...
										</>
									) : (
										"Start Processing"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
