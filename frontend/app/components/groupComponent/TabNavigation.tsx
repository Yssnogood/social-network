"use client";

import { Card } from "@/components/ui/card";
import { MessageCircle, FileText } from "lucide-react";

interface TabNavigationProps {
	showPosts: boolean;
	onTogglePosts: () => Promise<void>;
}

export default function TabNavigation({ showPosts, onTogglePosts }: TabNavigationProps) {
	return (
		<Card className="border-zinc-800 bg-zinc-900 p-1">
			<div className="flex space-x-1">
				<button
					onClick={() => !showPosts || onTogglePosts()}
					className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-all ${!showPosts
						? "bg-blue-600 text-white shadow-sm"
						: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
					}`}
				>
					<MessageCircle size={18} />
					<span>Messages</span>
				</button>
				<button
					onClick={onTogglePosts}
					className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-all ${showPosts
						? "bg-blue-600 text-white shadow-sm"
						: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
					}`}
				>
					<FileText size={18} />
					<span>Posts</span>
				</button>
			</div>
		</Card>
	);
}