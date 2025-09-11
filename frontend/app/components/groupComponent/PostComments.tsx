"use client";

import { GroupComment } from "../../types/group";

interface PostCommentsProps {
	comments: GroupComment[];
	newComment: string;
	onCommentChange: (value: string) => void;
	onCreateComment: () => Promise<void>;
}

export default function PostComments({
	comments,
	newComment,
	onCommentChange,
	onCreateComment
}: PostCommentsProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("fr-FR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="mt-4 border-t border-zinc-700 pt-4">
			{/* Liste des commentaires */}
			<div className="space-y-3 mb-4">
				{comments && comments.length > 0 ? (
					comments.map((comment) => (
						<div key={comment.id} className="bg-zinc-900 p-3 rounded-md border border-zinc-700">
							<div className="flex items-center gap-2 mb-1">
								<span className="font-medium text-sm text-blue-400">
									{comment.username}
								</span>
								<span className="text-xs text-zinc-400">
									{formatDate(comment.created_at)}
								</span>
							</div>
							<p className="text-zinc-200 text-sm">{comment.content}</p>
						</div>
					))
				) : (
					<p className="text-zinc-400 text-sm text-center py-4">
						Aucun commentaire pour le moment.
					</p>
				)}
			</div>

			{/* Formulaire d'ajout de commentaire */}
			<div className="bg-zinc-900 p-3 rounded-md border border-zinc-700">
				<textarea
					value={newComment}
					onChange={(e) => onCommentChange(e.target.value)}
					placeholder="Ajouter un commentaire..."
					className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md resize-none text-sm text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					rows={2}
				/>
				<div className="flex justify-end mt-2">
					<button
						onClick={onCreateComment}
						disabled={!newComment?.trim()}
						className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed"
					>
						Commenter
					</button>
				</div>
			</div>
		</div>
	);
}