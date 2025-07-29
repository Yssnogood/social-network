"use client";

interface TabNavigationProps {
	showPosts: boolean;
	onTogglePosts: () => Promise<void>;
}

export default function TabNavigation({ showPosts, onTogglePosts }: TabNavigationProps) {
	return (
		<div className="flex gap-4 mb-4 border-b">
			<button
				onClick={() => !showPosts || onTogglePosts()}
				className={`pb-2 px-4 font-medium ${!showPosts
					? "text-blue-600 border-b-2 border-blue-600"
					: "text-gray-500 hover:text-gray-700"
				}`}
			>
				Messages
			</button>
			<button
				onClick={onTogglePosts}
				className={`pb-2 px-4 font-medium ${showPosts
					? "text-blue-600 border-b-2 border-blue-600"
					: "text-gray-500 hover:text-gray-700"
				}`}
			>
				Posts
			</button>
		</div>
	);
}