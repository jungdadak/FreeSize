// RootLayout.tsx
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Import Swiper's CSS
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://freesize.vercel.app"),
	title: {
		default: "AI Image Processing Tools for LORA Training",
		template: "%s | FreeSizeAI",
	},
	description:
		"Free AI-powered image processing tools optimized for LORA model training dataset preparation",
	openGraph: {
		siteName: "FreeSizeAI",
		type: "website",
	},
};
export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const themeFromCookie = (await cookies()).get("theme");
	const theme = themeFromCookie?.value || "dark";

	return (
		<html lang="en" className={theme === "dark" ? "dark" : ""}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased 
        bg-white dark:bg-[#141414] text-gray-900 dark:text-gray-100
        transition-colors duration-200`}
			>
				<Providers>
					<div className="flex flex-col min-h-screen">
						<Navbar />
						<main className="flex-grow lg:pt-16 pb-16">
							{" "}
							{/* Navbar의 높이만큼 padding-top 추가 */}
							<div className="container mx-auto">
								{children} <SpeedInsights />
							</div>
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
