import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";
import { FileItem } from "@/store/fileStore";
import { PROCESSING_METHODS, ASPECT_RATIOS } from "@/lib/constants";

// 최대 해상도 상수
const MAX_WIDTH = 2048;
const MAX_HEIGHT = 2048;

interface ProcessingOptionsProps {
	fileItem: FileItem;
	index: number;
	onMethodToggle: (index: number, methodId: string) => void;
	onAspectRatioChange: (index: number, ratio: "1:1" | "1:2" | "2:1") => void;
	onUpscaleFactorChange: (index: number, factor: "x1" | "x2" | "x4") => void;
}

export default function ProcessingOptions({
	fileItem,
	index,
	onMethodToggle,
	onAspectRatioChange,
	onUpscaleFactorChange,
}: ProcessingOptionsProps) {
	return (
		<div className="lg:w-1/2 space-y-6">
			<div className="bg-gray-100 border border-gray-200 dark:bg-gray-900/50 dark:border-none dark:backdrop-blur-sm rounded-xl p-6">
				<h3 className="text-lg font-semibold mb-4">처리 옵션</h3>
				<div className="space-y-6">
					{PROCESSING_METHODS.map((method) => (
						<div key={method.id} className="space-y-3">
							<div className="flex items-center space-x-3">
								<Checkbox
									id={`${method.id}-${index}`}
									checked={fileItem.processingOption?.method === method.id}
									onCheckedChange={() => onMethodToggle(index, method.id)}
									className="data-[state=checked]:bg-indigo-600"
								/>
								<label
									htmlFor={`${method.id}-${index}`}
									className="text-sm font-medium"
								>
									{method.label}
								</label>
							</div>

							{/* uncrop 옵션 */}
							{method.id === "uncrop" &&
								fileItem.processingOption?.method === "uncrop" && (
									<div className="ml-8 p-4 rounded-lg shadow-sm bg-gray-200 dark:bg-gray-800/80">
										<RadioGroup
											value={fileItem.processingOption.aspectRatio}
											onValueChange={(value: string) =>
												onAspectRatioChange(index, value as "1:1" | "1:2" | "2:1")
											}
											className="space-y-2"
										>
											{ASPECT_RATIOS.map((ratio) => (
												<div key={ratio.id} className="flex items-center space-x-3">
													<RadioGroupItem
														value={ratio.id}
														id={`${ratio.id}-${index}`}
														className="border-indigo-600 text-indigo-600"
													/>
													<label htmlFor={`${ratio.id}-${index}`} className="text-sm">
														{ratio.label}
													</label>
												</div>
											))}
										</RadioGroup>
									</div>
								)}

							{/* upscale 옵션 */}
							{method.id === "upscale" &&
								fileItem.processingOption?.method === "upscale" && (
									<div className="ml-8 p-4 rounded-lg shadow-sm bg-gray-200 dark:bg-gray-800/80">
										<RadioGroup
											value={fileItem.processingOption.factor}
											onValueChange={(value: string) =>
												onUpscaleFactorChange(index, value as "x1" | "x2" | "x4")
											}
											className="space-y-2"
										>
											{[
												{ label: "x1 Sharper", value: "x1" },
												{ label: "x2", value: "x2" },
												{ label: "x4", value: "x4" },
											].map((option) => {
												// 예상 해상도 계산
												const expectedWidth = fileItem.dimensions
													? fileItem.dimensions.width *
													  (option.value === "x2" ? 2 : option.value === "x4" ? 4 : 1)
													: 0;
												const expectedHeight = fileItem.dimensions
													? fileItem.dimensions.height *
													  (option.value === "x2" ? 2 : option.value === "x4" ? 4 : 1)
													: 0;

												const exceedsMax =
													(option.value === "x2" || option.value === "x4") &&
													(expectedWidth > MAX_WIDTH || expectedHeight > MAX_HEIGHT);

												return (
													<div key={option.value} className="flex items-center space-x-3">
														<RadioGroupItem
															value={option.value}
															id={`upscale-${option.value}-${index}`}
															className="border-indigo-600 text-indigo-600"
														/>
														<label
															htmlFor={`upscale-${option.value}-${index}`}
															className="text-sm flex items-center space-x-2"
														>
															<span>{option.label}</span>
															<span
																className={exceedsMax ? "text-yellow-500" : "text-blue-500"}
															>
																{exceedsMax ? "Maximum" : `${expectedWidth}×${expectedHeight}`}
															</span>
														</label>
													</div>
												);
											})}
										</RadioGroup>

										{fileItem.processingOption.factor &&
											["x2", "x4"].includes(fileItem.processingOption.factor) &&
											fileItem.dimensions &&
											(() => {
												const factor = fileItem.processingOption.factor;
												const expectedWidth =
													fileItem.dimensions.width * (factor === "x2" ? 2 : 4);
												const expectedHeight =
													fileItem.dimensions.height * (factor === "x2" ? 2 : 4);
												const exceeds =
													expectedWidth > MAX_WIDTH || expectedHeight > MAX_HEIGHT;

												if (exceeds) {
													const scale = Math.min(
														MAX_WIDTH / expectedWidth,
														MAX_HEIGHT / expectedHeight
													);
													const adjustedWidth = Math.floor(expectedWidth * scale);
													const adjustedHeight = Math.floor(expectedHeight * scale);

													return (
														<div className="justify-center gap-10 border p-2 rounded border-yellow-200 mt-2 flex items-center text-sm text-yellow-500">
															<AlertTriangle className="w-7 h-7 mr-1" />
															<p className="text-start">
																최대 허용 해상도{" "}
																<span className="text-cyan-500">
																	{MAX_WIDTH}×{MAX_HEIGHT}
																</span>
																를 초과하여 <br />
																<span className="text-indigo-400">
																	{adjustedWidth}×{adjustedHeight}
																</span>
																로 조정됩니다.
															</p>
														</div>
													);
												}
												return null;
											})()}
									</div>
								)}
							{/* square 옵션 */}
							{method.id === "square" &&
								fileItem.processingOption?.method === "square" && (
									<div className="ml-8 p-4 rounded-lg bg-gray-200 dark:bg-gray-800/80">
										<p className="text-sm">Square 옵션은 아직 구현되지 않았습니다.</p>
									</div>
								)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
