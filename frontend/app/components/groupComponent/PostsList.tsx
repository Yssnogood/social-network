"use client";

import { GroupPost, GroupComment } from "../../types/group";
import PostItem from "./PostItem";
import PostCreator from "./PostCreator";

interface PostsListProps {
	posts: GroupPost[];
	isLoading: boolean;
	commentsByPost: Record<number, GroupComment[]>;
	showCommentsForPost: Record<number, boolean>;
	newCommentByPost: Record<number, string>;
	loadingComments: Record<number, boolean>;
	onCreatePost: (content: string) => Promise<void>;
	onToggleComments: (postId: number) => Promise<void>;
	onCommentChange: (postId: number, value: string) => void;
	onCreateComment: (postId: number, userId: number, username: string) => Promise<void>;
}

export default function PostsList({
	posts,
	isLoading,
	commentsByPost,
	showCommentsForPost,
	newCommentByPost,
	loadingComments,
	onCreatePost,
	onToggleComments,
	onCommentChange,
	onCreateComment
}: PostsListProps) {
	return (
		<div className="space-y-4">
			<PostCreator onCreatePost={onCreatePost} />

			<div className="space-y-4">
				<h3 className="font-semibold text-white">Posts du groupe</h3>

				{isLoading && (
					<div className="text-center py-4">
						<p className="text-zinc-400">Chargement des posts...</p>
					</div>
				)}

				{!isLoading && Array.isArray(posts) && posts.length === 0 && (
					<div className="text-center py-8 text-zinc-400">
						<p>Aucun post dans ce groupe pour le moment.</p>
						<p className="text-sm">Soyez le premier à publier quelque chose !</p>
					</div>
				)}

				{posts.map((post) => (
					<PostItem
						key={post.id}
						post={post}
						comments={commentsByPost[post.id] || []}
						showComments={showCommentsForPost[post.id] || false}
						loadingComments={loadingComments[post.id] || false}
						newComment={newCommentByPost[post.id] || ""}
						onToggleComments={() => onToggleComments(post.id)}
						onCommentChange={(value) => onCommentChange(post.id, value)}
						onCreateComment={() => onCreateComment(post.id, post.user_id, post.username)}
					/>
				))}
			</div>
		</div>
	);
}