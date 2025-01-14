import React from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface LogEntry {
	message: string;
	timestamp: string;
	type: "info" | "success" | "error";
}

interface StatusMessageProps {
	log: LogEntry;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ log }) => {
	const iconColor =
		log.type === "info"
			? "text-blue-500"
			: log.type === "success"
			? "text-green-500"
			: "text-red-500";

	const Icon =
		log.type === "info"
			? Loader2
			: log.type === "success"
			? CheckCircle
			: XCircle;

	return (
		<div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
			<Icon
				className={`w-5 h-5 ${iconColor} ${
					log.type === "info" ? "animate-spin" : ""
				}`}
				aria-hidden="true"
			/>
			<span>{log.message}</span>
		</div>
	);
};
