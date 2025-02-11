import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
	images: {
		minimumCacheTTL: 60,
		domains: ["freesize.vercel.app"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "freesize.vercel.app",
				pathname: "/api/image/proxy/**",
			},
		],
	},
};

export default nextConfig;
