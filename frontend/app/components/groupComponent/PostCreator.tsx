"use client";

import { useState } from "react";

interface PostCreatorProps {
	onCreatePost: (content: string) => Promise<void>;
}

export default function PostCreator({ onCreatePost }: PostCreatorProps) {
	const [newPost, setNewPost] = useState("");

	const handleCreate = async () => {
		if (!newPost.trim()) return;

		await onCreatePost(newPost);
		setNewPost("");
	};

	return (
		<div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg">
			<h3 className="font-semibold mb-4 text-white">Créer un post</h3>
			<textarea
				value={newPost}
				onChange={(e) => setNewPost(e.target.value)}
				placeholder="Écrivez votre post..."
				className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
				rows={3}
			/>
			<button
				onClick={handleCreate}
				disabled={!newPost.trim()}
				className="mt-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed font-medium transition-colors"
			>
				Publier
			</button>
		</div>
	);
}