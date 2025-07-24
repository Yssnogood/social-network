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
		<div className="bg-gray-50 p-4 rounded-lg">
			<h3 className="font-semibold mb-2">Créer un post</h3>
			<textarea
				value={newPost}
				onChange={(e) => setNewPost(e.target.value)}
				placeholder="Écrivez votre post..."
				className="w-full p-2 border rounded-md resize-none"
				rows={3}
			/>
			<button
				onClick={handleCreate}
				disabled={!newPost.trim()}
				className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
			>
				Publier
			</button>
		</div>
	);
}