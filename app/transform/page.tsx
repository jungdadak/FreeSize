"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { XCircle } from "lucide-react";
import { useTransform } from "@/hooks/useTransform";
import { TransformData, ProcessingOptions } from "@/types/transform";
import { Stepper } from "@/components/ui/Stepper";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { CompletedSection } from "@/components/ui/CompletedSection";
import { FailedSection } from "@/components/ui/FailedSection";

interface LogEntry {
	message: string;
	timestamp: string;
	type: "info" | "success" | "error";
}

export default function TransformPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [latestLog, setLatestLog] = useState<LogEntry | null>(null);
	const [parseError, setParseError] = useState<string | null>(null);
	const [transformData, setTransformData] = useState<TransformData | null>(null);

	// URL에서 데이터 파싱
	useEffect(() => {
		const encodedData = searchParams.get("data");
		if (encodedData) {
			try {
				const parsedData = JSON.parse(decodeURIComponent(encodedData));
				console.log("Parsed Transform Data:", parsedData);

				// 누락된 필드 확인
				const missingFields: string[] = [];
				if (typeof parsedData.presignedUrl !== "string")
					missingFields.push("presignedUrl");
				if (typeof parsedData.processingOptions !== "object") {
					missingFields.push("processingOptions");
				} else {
					const processingOptions: ProcessingOptions = parsedData.processingOptions;
					if (!processingOptions.upscale && !processingOptions.uncrop) {
						missingFields.push(
							"processingOptions.upscale or processingOptions.uncrop"
						);
					}
					if (
						processingOptions.uncrop &&
						typeof processingOptions.uncrop.aspectRatio !== "string"
					) {
						missingFields.push("processingOptions.uncrop.aspectRatio");
					}
				}
				if (typeof parsedData.originalFileName !== "string")
					missingFields.push("originalFileName");

				if (missingFields.length === 0) {
					setTransformData(parsedData as TransformData);
				} else {
					throw new Error(`필수 필드가 누락되었습니다: ${missingFields.join(", ")}`);
				}
			} catch (error) {
				console.error("변환 데이터 파싱 실패:", error);
				setParseError(
					error instanceof Error
						? error.message
						: "변환 데이터가 손상되었거나 올바르지 않습니다."
				);
			}
		}
	}, [searchParams]);

	const logHandler = useCallback(
		(message: string, type: LogEntry["type"] = "info") => {
			const newLog: LogEntry = {
				message,
				timestamp: new Date().toLocaleTimeString(),
				type,
			};
			setLatestLog(newLog);
		},
		[]
	);

	const { status, handleRetry } = useTransform(transformData, logHandler);

	useEffect(() => {
		console.log(
			"useEffect - transformData:",
			transformData,
			"parseError:",
			parseError
		);

		if (parseError) {
			router.push("/");
		}
	}, [parseError, router]);

	// 변환 데이터가 없거나 파싱에 실패한 경우 사용자에게 오류 메시지 표시
	if (parseError) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center py-12 px-4">
				<div className="max-w-md w-full">
					<div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-8 text-center">
						<XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
						<p className="text-red-500 mb-6 text-lg">{parseError}</p>
						<button
							onClick={() => router.push("/")}
							className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							홈으로 돌아가기
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!transformData) return null;

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-8">
					<div className="flex flex-col items-center">
						{/* Stepper */}
						<Stepper currentStage={status.stage} />

						{/* Status Message */}
						{latestLog &&
							status.stage !== "completed" &&
							status.stage !== "failed" && <StatusMessage log={latestLog} />}

						{/* Completed Section */}
						{status.stage === "completed" && (
							<CompletedSection
								resultUrl={status.resultUrl}
								onDownloadError={() =>
									logHandler("결과 URL이 존재하지 않습니다.", "error")
								}
							/>
						)}

						{/* Failed Section */}
						{status.stage === "failed" && (
							<FailedSection
								errorMessage={status.error || "알 수 없는 오류가 발생했습니다."}
								onRetry={handleRetry}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
