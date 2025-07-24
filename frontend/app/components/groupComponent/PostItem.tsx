"use client";

import { GroupPost, GroupComment } from "../../types/group";
import PostComments from "./PostComments";

interface PostItemProps {
	post: GroupPost;
	comments: GroupComment[];
	showComments: boolean;
	loadingComments: boolean;
	newComment: string;
	onToggleComments: () => Promise<void>;
	onCommentChange: (value: string) => void;
	onCreateComment: () => Promise<void>;
}

export default function PostItem({
	post,
	comments,
	showComments,
	loadingComments,
	newComment,
	onToggleComments,
	onCommentChange,
	onCreateComment
}: PostItemProps) {
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
		<div className="bg-white border rounded-lg p-4 shadow-sm">
			{/* En-tête du post */}
			<div className="flex justify-between items-start mb-3">
				<div className="flex items-center gap-2">
					<span className="font-medium text-blue-600">{post.username}</span>
					<span className="text-sm text-gray-500">
						{formatDate(post.created_at)}
					</span>
				</div>
				{post.comments_count > 0 && (
					<span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
						{post.comments_count} commentaire{post.comments_count > 1 ? "s" : ""}
					</span>
				)}
			</div>

			{/* Contenu du post */}
			<div className="text-gray-800 whitespace-pre-wrap mb-3">
				{post.content}
			</div>

			{/* Image du post */}
			{post.image_path && (
				<div className="mb-3">
					<img
						src={post.image_path}
						alt="Post image"
						className="max-w-full h-auto rounded-md"
					/>
				</div>
			)}

			{/* Actions du post */}
			<div className="flex items-center gap-4 pt-2 border-t">
				<button
					onClick={onToggleComments}
					className="text-sm text-blue-600 hover:text-blue-800 font-medium"
					disabled={loadingComments}
				>
					{loadingComments
						? "Chargement..."
						: showComments
							? "Masquer les commentaires"
							: `Voir les commentaires${post.comments_count > 0 ? ` (${post.comments_count})` : ""}`
					}
				</button>
			</div>

			{/* Section des commentaires */}
			{showComments && (
				<PostComments
					comments={comments}
					newComment={newComment}
					onCommentChange={onCommentChange}
					onCreateComment={onCreateComment}
				/>
			)}
		</div>
	);
}