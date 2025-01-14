import React from "react";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCw } from "lucide-react";

interface FailedSectionProps {
	errorMessage: string;
	onRetry: () => void;
}

export const FailedSection: React.FC<FailedSectionProps> = ({
	errorMessage,
	onRetry,
}) => {
	const router = useRouter();

	return (
		<div className="text-center space-y-4">
			<XCircle className="w-12 h-12 text-red-600 mx-auto" aria-hidden="true" />
			<p className="text-red-600">{errorMessage}</p>
			<div className="space-y-3">
				<button
					onClick={onRetry}
					className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 mx-auto"
					aria-label="변환 다시 시도"
				>
					<RefreshCw className="w-4 h-4" aria-hidden="true" />
					<span>다시 시도</span>
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
