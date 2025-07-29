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
		<div className="mt-4 border-t pt-4">
			{/* Liste des commentaires */}
			<div className="space-y-3 mb-4">
				{comments && comments.length > 0 ? (
					comments.map((comment) => (
						<div key={comment.id} className="bg-gray-50 p-3 rounded-md">
							<div className="flex items-center gap-2 mb-1">
								<span className="font-medium text-sm text-blue-600">
									{comment.username}
								</span>
								<span className="text-xs text-gray-500">
									{formatDate(comment.created_at)}
								</span>
							</div>
							<p className="text-gray-800 text-sm">{comment.content}</p>
						</div>
					))
				) : (
					<p className="text-gray-500 text-sm text-center py-4">
						Aucun commentaire pour le moment.
					</p>
				)}
			</div>

			{/* Formulaire d'ajout de commentaire */}
			<div className="bg-gray-50 p-3 rounded-md">
				<textarea
					value={newComment}
					onChange={(e) => onCommentChange(e.target.value)}
					placeholder="Ajouter un commentaire..."
					className="w-full p-2 border rounded-md resize-none text-sm"
					rows={2}
				/>
				<div className="flex justify-end mt-2">
					<button
						onClick={onCreateComment}
						disabled={!newComment?.trim()}
						className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
					>
						Commenter
					</button>
				</div>
			</div>
		</div>
	);
}