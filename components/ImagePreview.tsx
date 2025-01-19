import Image from "next/image";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FileItem } from "@/store/fileStore";

interface ImagePreviewProps {
	fileItem: FileItem;
	index: number;
	onRemove: (index: number) => void;
}

export default function ImagePreview({
	fileItem,
	index,
	onRemove,
}: ImagePreviewProps) {
	const sizeMB = (fileItem.file.size / (1024 * 1024)).toFixed(2);

	return (
		<div className="relative lg:w-1/2">
			<div
				className={`
        group relative rounded-xl p-6 transition-all duration-300 hover:shadow-lg
        bg-[gray-100] border border-gray-200 shadow-xl rounded-2xl
        dark:bg-[#141414] dark:border-none dark:backdrop-blur-xl
      `}
			>
				{/* 상단 정보(파일 번호, 이름) */}
				<div
					className={`
          absolute top-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-lg
          bg-[gray-200/70]
          dark:bg-[#1a1a1a]/40
        `}
				>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="px-3 py-1 text-sm bg-none text-white">
							파일 {index + 1}
						</Badge>
						<h2 className="text-sm font-medium truncate">{fileItem.file.name}</h2>
					</div>
					<button
						onClick={() => onRemove(index)}
						className={`
              p-2 rounded-full text-white transition-all duration-200
              bg-[#1E1E1E]/40 hover:bg-[#1E1E1E]/60
            `}
						aria-label={`파일 ${fileItem.file.name} 제거`}
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="flex items-center justify-center w-full aspect-square">
					<Image
						src={fileItem.previewUrl}
						alt={`미리보기 ${index + 1}`}
						width={500}
						height={500}
						className="max-h-[500px] object-contain rounded-lg"
					/>
				</div>

				{/* 하단 정보(이미지 사이즈, 용량) */}
				<div className="absolute bottom-4 left-4 right-4 flex justify-between">
					<Badge
						variant="secondary"
						className={`
              bg-gray-200 text-gray-700 border border-gray-300
              dark:bg-[#1E1E1E]/40 dark:text-white
            `}
					>
						{fileItem.dimensions
							? `${fileItem.dimensions.width}×${fileItem.dimensions.height}`
							: "로딩 중..."}
					</Badge>
					<Badge
						variant="secondary"
						className={`
              bg-gray-200 text-gray-700 border border-gray-300
              dark:bg-[#1E1E1E]/40 dark:text-white
            `}
					>
						{sizeMB} MB
					</Badge>
				</div>
			</div>
		</div>
	);
}
