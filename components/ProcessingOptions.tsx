import * as React from "react";
import { Tabs } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";
import { FileItem } from "@/store/fileStore";
import { PROCESSING_METHODS, ASPECT_RATIOS } from "@/lib/constants";

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
	const handleTabChange = (value: string) => {
		onMethodToggle(index, value);
	};

	return (
		<div className="lg:w-1/2 space-y-6">
			<div className="rounded-xl p-6" style={{ backgroundColor: "#141414" }}>
				<h3 className="text-lg font-semibold mb-4">처리 옵션</h3>

				<Tabs
					value={fileItem.processingOption?.method || "uncrop"}
					onValueChange={handleTabChange}
					defaultValue="uncrop"
					className="w-full"
				>
					<div className="flex space-x-2 mb-4">
						{PROCESSING_METHODS.map((method) => (
							<button
								key={method.id}
								onClick={() => handleTabChange(method.id)}
								className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200 
                  ${
																			fileItem.processingOption?.method === method.id
																				? "bg-indigo-600 text-white"
																				: "hover:bg-[#2e2e2e] text-gray-300"
																		}
                `}
								style={{
									backgroundColor:
										fileItem.processingOption?.method === method.id ? "" : "#1e1e1e",
								}}
							>
								{method.label}
							</button>
						))}
					</div>

					<div className="rounded-lg p-4" style={{ backgroundColor: "#1e1e1e" }}>
						{fileItem.processingOption?.method === "uncrop" && (
							<div className="space-y-2">
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
											<label
												htmlFor={`${ratio.id}-${index}`}
												className="text-sm text-gray-300"
											>
												{ratio.label}
											</label>
										</div>
									))}
								</RadioGroup>
							</div>
						)}

						{fileItem.processingOption?.method === "upscale" && (
							<div className="space-y-2">
								<RadioGroup
									value={fileItem.processingOption.factor}
									onValueChange={(value: string) =>
										onUpscaleFactorChange(index, value as "x1" | "x2" | "x4")
									}
									className="space-y-2"
								>
									{[
										{ label: "x1 Sharper", value: "x1", size: "600×600" },
										{ label: "x2", value: "x2", size: "1200×1200" },
										{ label: "x4", value: "x4", size: "Maximum" },
									].map((option) => {
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
													className="text-sm flex items-center space-x-2 text-gray-300"
												>
													<span>{option.label}</span>
													<span className={exceedsMax ? "text-yellow-500" : "text-blue-400"}>
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
												<div
													className="justify-center gap-4 p-3 rounded-lg mt-3 flex items-center text-sm text-yellow-500"
													style={{ backgroundColor: "#2e2e2e" }}
												>
													<AlertTriangle className="w-5 h-5 shrink-0" />
													<p className="text-start">
														최대 허용 해상도{" "}
														<span className="text-cyan-400">
															{MAX_WIDTH}×{MAX_HEIGHT}
														</span>
														를 초과하여{" "}
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

						{fileItem.processingOption?.method === "square" && (
							<div>
								<p className="text-sm text-gray-400">
									Square 옵션은 아직 구현되지 않았습니다.
								</p>
							</div>
						)}
					</div>
				</Tabs>
			</div>
		</div>
	);
}
