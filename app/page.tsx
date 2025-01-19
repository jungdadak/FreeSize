import { Metadata } from "next";
import HomeBots from "@/components/homeBots";
import Getstarted from "@/components/Btn/Getstarted-home";

export const dynamic = "force-static";

export const metadata: Metadata = {
	title: "Free AI Image Enhancement Tools | Upscale, Uncrop & Square Images",
	description:
		"Free AI-powered image enhancement tools. Upscale images without quality loss, uncrop images using AI generation, and convert to perfect squares. Improve your images with advanced AI technology.",
	keywords:
		"AI image upscaling, image uncropping, square image converter, free AI image tools, image enhancement, AI image generation, image processing",
	openGraph: {
		title: "Free AI Image Enhancement Tools | Upscale, Uncrop & Square Images",
		description:
			"Transform your images with AI: Upscale resolution, uncrop using AI generation, and convert to perfect squares - all for free.",
		type: "website",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "AI Image Enhancement Tools",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Free AI Image Enhancement Tools",
		description:
			"Upscale, uncrop, and square your images with AI technology - completely free.",
	},
	alternates: {
		canonical: "https://your-domain.com",
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: "AI Image Enhancement Tools",
	description:
		"Free AI-powered image enhancement tools for upscaling, uncropping, and squaring images.",
	applicationCategory: "AI Image Processing",
	operatingSystem: "Any",
	offers: {
		"@type": "Offer",
		price: "0",
		priceCurrency: "USD",
	},
	featureList: [
		"AI image upscaling",
		"AI-powered image uncropping",
		"Automatic square image conversion",
	],
};

export default function Home() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className="h-full bg-gray-100 dark:bg-[#141414] transition-colors duration-500">
				<main className="flex flex-col items-center justify-center text-center md:px-4 md:py-20 mt-16">
					<h1 className="font-extrabold text-5xl md:text-7xl lg:text-8xl text-gray-900 dark:text-white transition-colors duration-500">
						Enhance Images with AI
					</h1>
					<h2 className="mt-4 font-semibold text-4xl md:text-6xl lg:text-7xl text-gray-700 dark:text-gray-300 transition-colors duration-500">
						<span className="text-2xl md:text-4xl lg:text-5xl">for</span>{" "}
						<span className="text-5xl md:text-7xl lg:text-8xl text-blue-500 dark:text-teal-400">
							Free
						</span>
					</h2>
					<p className="mt-6 text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl">
						Upscale resolution, uncrop with AI generation, and perfect square
						conversions. Transform your images with advanced AI technology -
						completely free!
					</p>
					<Getstarted targetId="homebots" />
					<div className="mt-32" id="homebots">
						<HomeBots />
					</div>
				</main>
			</div>
		</>
	);
}
