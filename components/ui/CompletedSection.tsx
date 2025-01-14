import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const DownloadIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-4 w-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
		/>
	</svg>
);

interface CompletedSectionProps {
	resultUrl?: string;
	onDownloadError: () => void;
}

export const CompletedSection: React.FC<CompletedSectionProps> = ({
	resultUrl,
	onDownloadError,
}) => {
	const router = useRouter();

	const handleDownload = () => {
		if (resultUrl) {
			const link = document.createElement("a");
			link.href = resultUrl;
			link.download = "result-image.png";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			onDownloadError();
		}
	};

	return (
		<div className="text-center space-y-4">
			<CheckCircle
				className="w-12 h-12 text-green-600 mx-auto"
				aria-hidden="true"
			/>
			<div className="space-y-4">
				<button
					onClick={handleDownload}
					className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
					aria-label="결과 다운로드"
				>
					<DownloadIcon />
					<span>결과 다운로드</span>
				</button>
				<button
					onClick={() => router.push("/")}
					className="block w-full px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
				>
					홈으로 돌아가기
				</button>
			</div>
		</div>
	);
};
