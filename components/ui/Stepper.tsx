import React from "react";
import { CheckCircle, Upload, Activity, XCircle } from "lucide-react";
import { ProcessStatus } from "@/types/transform";

const STAGES: Record<
	ProcessStatus["stage"],
	{
		progress: number;
		message: string;
		completeMessage: string;
		icon: React.ReactNode;
		color: string;
	}
> = {
	uploading: {
		progress: 33,
		message: "이미지 업로드 중...",
		completeMessage: "업로드 완료!",
		icon: <Upload className="w-6 h-6" />,
		color: "bg-blue-500",
	},
	processing: {
		progress: 66,
		message: "AI 모델이 이미지를 처리하고 있습니다...",
		completeMessage: "처리 완료!",
		icon: <Activity className="w-6 h-6" />,
		color: "bg-yellow-500",
	},
	completed: {
		progress: 100,
		message: "처리가 완료되었습니다!",
		completeMessage: "모든 과정 완료!",
		icon: <CheckCircle className="w-6 h-6" />,
		color: "bg-green-500",
	},
	failed: {
		progress: 0,
		message: "처리 중 오류가 발생했습니다.",
		completeMessage: "실패",
		icon: <XCircle className="w-6 h-6" />,
		color: "bg-red-500",
	},
};

interface StepperProps {
	currentStage: ProcessStatus["stage"];
}

export const Stepper: React.FC<StepperProps> = ({ currentStage }) => {
	const stageKeys: ProcessStatus["stage"][] = [
		"uploading",
		"processing",
		"completed",
	];
	const currentStageIndex = stageKeys.indexOf(currentStage);

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				{stageKeys.map((stage, index) => {
					const isCompleted = index < currentStageIndex;
					const isCurrent = index === currentStageIndex;

					return (
						<div key={stage} className="flex-1">
							<div className="flex flex-col items-center">
								<div
									className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white
                  ${
																			isCompleted
																				? "bg-green-500"
																				: isCurrent
																				? STAGES[stage].color
																				: "bg-gray-300"
																		}`}
								>
									{isCompleted ? (
										<CheckCircle className="w-6 h-6" />
									) : (
										STAGES[stage].icon
									)}
								</div>

								<div className="mt-2 flex flex-col items-center">
									<span className="text-sm">
										{isCompleted ? STAGES[stage].completeMessage : STAGES[stage].message}
									</span>
									{isCompleted && (
										<CheckCircle className="w-4 h-4 text-green-500 mt-1" />
									)}
								</div>

								{index < stageKeys.length - 1 && (
									<div className="absolute w-full h-1 top-5 left-1/2">
										<div
											className={`h-1 ${
												isCompleted
													? "bg-green-500"
													: isCurrent
													? STAGES[stage].color
													: "bg-gray-300"
											}`}
										></div>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
