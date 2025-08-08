"use client";

import { useState } from "react";

interface PostCreatorProps {
	onCreatePost: (content: string) => Promise<void>;
	compact?: boolean;
}

export default function PostCreator({ onCreatePost, compact = false }: PostCreatorProps) {
	const [newPost, setNewPost] = useState("");

	const handleCreate = async () => {
		if (!newPost.trim()) return;

		await onCreatePost(newPost);
		setNewPost("");
	};

	if (compact) {
		return (
			<div className="bg-gray-800/50 p-2 rounded border border-gray-600">
				<div className="flex gap-2">
					<textarea
						value={newPost}
						onChange={(e) => setNewPost(e.target.value)}
						placeholder="Nouveau post..."
						className="flex-1 bg-gray-700 text-white p-2 border border-gray-600 rounded text-sm resize-none"
						rows={1}
					/>
					<button
						onClick={handleCreate}
						disabled={!newPost.trim()}
						className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium"
					>
						➤
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
			<h3 className="font-semibold mb-2 text-white">Créer un post</h3>
			<textarea
				value={newPost}
				onChange={(e) => setNewPost(e.target.value)}
				placeholder="Écrivez votre post..."
				className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md resize-none"
				rows={3}
			/>
			<button
				onClick={handleCreate}
				disabled={!newPost.trim()}
				className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium"
			>
				Publier
			</button>
		</div>
	);
}