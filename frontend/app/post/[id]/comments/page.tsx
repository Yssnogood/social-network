"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useCookies } from "next-client-cookies";
import { getSpecificPost, Post } from "../../../../services/post";
import { formatRelativeTime } from "../../../../services/utils";
import { getComments, createComment, Comment } from "../../../../services/comment";
import { LikePost } from "../../../../services/post";
import { createNotification } from "@/services/notifications";

export default function CommentsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const cookies = useCookies();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [commentContent, setCommentContent] = useState('');
    const param = use(params)
    const postId = parseInt(param.id);

    useEffect(() => {
        async function loadPostAndComments() {
            try {
                // Fetch the specific post and its comments
                const foundPost = await getSpecificPost(postId, cookies.get("jwt"));

                if (foundPost) {
                    setPost(foundPost);

                    // Fetch comments for the post
                    const postComments = await getComments(postId, cookies.get("jwt"));
                    setComments(postComments.reverse());
                }
            } catch (error) {
                console.error("Failed to fetch post or comments:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadPostAndComments();
    }, [postId, cookies]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        // Get the current username from cookie
        const username = cookies.get("user");

        // Awaiting the async comment creation
        const newComment = await createComment({
            postId,
            content: commentContent
        }, cookies.get("jwt"));

        if (newComment) {
            // Add the new comment to the existing list
            const commentWithUsername = {
                ...newComment,
                userName: username || newComment.userName || "You"
            };
            
            setComments([commentWithUsername, ...comments]);
            setCommentContent('');

            // Don't create a notification if the comment is by the post owner
            if (post?.userName !== username) {
                try {
                    if (!post) return;
                    createNotification({
                        userId: parseInt(post.userId),
                        type: "comment",
                        content: `${username || "You"} commented on your post`,
                        // The referenceId is the post ID where the comment was made
                        referenceId: post.id,
                        referenceType: "post"
                    });
                } catch (error) {
                    console.error("Failed to create notification for comment:", error);
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/home" className="font-bold text-lg text-white">
                        Social Network
                    </Link>
                    <Link href="/logout" className="text-sm text-white hover:text-blue-200">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-16 pb-8">
                <div className="max-w-2xl mx-auto">
                    <Link
                        href="/home"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
                    >
                        ← Back to Feed
                    </Link>

                    {isLoading ? (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                            <p className="mt-2 text-gray-400">Loading...</p>
                        </div>
                    ) : post ? (
                        <div>
                            {/* Original Post */}
                            <div id={String(postId)} className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                                    <div>
                                        <div className="font-semibold text-white">{post.userName}</div>
                                        <div className="text-xs text-gray-400">
                                            {formatRelativeTime(new Date(post.createdAt))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3 text-gray-300">
                                    {post.content}
                                </div>
                                {post.imageUrl && (
                                    <div className="mb-3">
                                        <img
                                            src={post.imageUrl}
                                            alt="Post image"
                                            className="max-h-96 rounded-lg mx-auto"
                                        />
                                    </div>
                                )}
                                <div className="border-t border-gray-700 pt-3 mt-3 flex gap-4">
                                    <button className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-1" onClick={() => {
                                                                        LikePost(post.id,cookies.get("jwt"))
                                                                    }}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className={"h-5 w-5 like" + (post.liked ? " liked": "")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                                        </svg>
                                                                        <span id={`like ${post.id}`}>{post.likes}</span> Like{post.likes !== 1 ? 's' : ''}
                                                                    </button>
                                    <span className="text-gray-400 text-sm flex items-center gap-1">
                                        💬 {comments.length} Comment{comments.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Comment Form */}
                            <form onSubmit={handleSubmitComment} className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                                <div className="mb-2">
                                    <label htmlFor="commentContent" className="block text-sm font-medium text-gray-300 mb-1">
                                        Add a comment
                                    </label>
                                    <textarea
                                        id="commentContent"
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
                                    >
                                        Comment
                                    </button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
                            {comments.length === 0 ? (
                                <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">
                                    No comments yet. Be the first to comment!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                                            <div className="flex items-center mb-2">
                                                <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
                                                <div>
                                                    <div className="font-semibold text-white text-sm">{comment.userName}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {formatRelativeTime(new Date(comment.createdAt))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-gray-300">{comment.content}</div>
                                            {comment.imageUrl && (
                                                <div className="mt-2">
                                                    <img
                                                        src={comment.imageUrl}
                                                        alt="Comment image"
                                                        className="max-h-48 rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400">Post not found</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}