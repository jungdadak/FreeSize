export default function Home() {
	return (
		<div className="h-full bg-gray-100 dark:bg-black transition-colors duration-500">
			<main className="flex flex-col items-center justify-center text-center md:px-4 md:py-20">
				<h1 className="font-extrabold text-4xl md:text-6xl lg:text-7xl text-gray-900 dark:text-white transition-colors duration-500">
					Optimize Your Images
				</h1>
				<h2 className="mt-4 font-semibold text-3xl md:text-5xl lg:text-6xl text-gray-700 dark:text-gray-300 transition-colors duration-500">
					<span className="text-xl md:text-3xl lg:text-4xl">for</span>{" "}
					<span className="text-4xl md:text-6xl lg:text-7xl text-blue-500 dark:text-teal-400">
						Free
					</span>
				</h2>
				<p className="mt-6 text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl">
					Efficiently compress and optimize your images without losing quality.
					Enhance your website&apos;s performance today!
				</p>
				<button className="mt-8 px-6 py-3 bg-blue-500 dark:bg-teal-400 text-white dark:text-gray-800 font-semibold rounded-lg shadow-md hover:bg-blue-600 dark:hover:bg-teal-500 transition-colors duration-300">
					Get Started
				</button>
			</main>
		</div>
	);
}
