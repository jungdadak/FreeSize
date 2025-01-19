"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Card, CardContent } from "@/components/ui/card";
import { FileItem } from "@/store/fileStore";
import { useFileProcessing } from "@/hooks/useFileProcessing";

import ImagePreview from "@/components/ImagePreview";
import ProcessingOptions from "@/components/ProcessingOptions";
import Header from "@/components/PreviewHeader";
import ActionButtons from "@/components/ActionButtons";
import SwiperNavigation from "@/components/Swiper/SwiperNavigation";

import "swiper/css";
import "swiper/css/pagination";

export default function PreviewPage() {
	const {
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
	} = useFileProcessing();

	return (
		<div className="min-h-screen py-12 transition-colors duration-300 bg-white text-gray-900 dark:bg-[#141414]">
			<Header totalFiles={totalFiles} totalSize={totalSize} />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<Card className="border-0 bg-white text-gray-900 dark:bg-[#141414] dark:text-gray-100 dark:backdrop-blur-sm">
					<CardContent className="p-0">
						<Swiper
							modules={[Pagination]}
							pagination={{ clickable: true }}
							spaceBetween={40}
							slidesPerView={1}
						>
							{files.map((fileItem: FileItem, index: number) => (
								<SwiperSlide key={index} className="p-4">
									<div className="flex flex-col lg:flex-row gap-8">
										<ImagePreview
											fileItem={fileItem}
											index={index}
											onRemove={handleRemoveFile}
										/>
										<ProcessingOptions
											fileItem={fileItem}
											index={index}
											onMethodToggle={handleMethodToggle}
											onAspectRatioChange={handleAspectRatioChange}
											onUpscaleFactorChange={handleUpscaleFactorChange}
										/>
									</div>
								</SwiperSlide>
							))}
							<SwiperNavigation totalFiles={totalFiles} />
						</Swiper>

						<ActionButtons
							onCancel={handleCancel}
							onProcess={handleProcess}
							isUploading={isUploading}
							stage={stage}
							uploadStatus={uploadStatus}
							hasValidOptions={files.every((file) => file.processingOption !== null)}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
