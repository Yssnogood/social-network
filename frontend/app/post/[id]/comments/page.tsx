"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCookies } from "next-client-cookies";
import { getSpecificPost, Post } from "../../../../services/post";
import { formatRelativeTime } from "../../../../services/utils";
import { getComments, createComment, Comment } from "../../../../services/comment";

export default function CommentsPage({ params }: { params: { id: string } }) {
    const cookies = useCookies();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [commentContent, setCommentContent] = useState('');
    const postId = parseInt(params.id);

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

            // Also update the comment count on the post
            if (post) {
                setPost({
                    ...post,
                    comments: post.comments + 1
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <header className="fixed top-0 left-0 right-0 h-12 bg-gray-900 shadow-sm z-50 flex items-center px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/home" className="font-bold text-lg text-white">
                        Social Network
                    </Link>
                    <nav className="flex gap-4 items-center">
                        <Link href="/home" className="text-sm text-white hover:text-gray-300">
                            Back to Feed
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="pt-16 px-4 flex justify-center">
                <div className="w-full max-w-xl mx-auto">
                    {isLoading ? (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                            <p className="mt-2 text-gray-400">Loading...</p>
                        </div>
                    ) : post ? (
                        <div>
                            {/* Original Post */}
                            <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
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
                                    <button className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        {post.likes} Like{post.likes !== 1 ? 's' : ''}
                                    </button>
                                    <span className="text-gray-400 text-sm flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
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
                                comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                                        <div className="flex items-center mb-2">
                                            <div className="w-8 h-8 bg-gray-700 rounded-full mr-2"></div>
                                            <div>
                                                <div className="font-semibold text-white">{comment.userName}</div>
                                                <div className="text-xs text-gray-400">
                                                    {formatRelativeTime(new Date(comment.createdAt))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 pl-10">
                                            {comment.content}
                                        </div>
                                        {comment.imageUrl && (
                                            <div className="mt-2 pl-10">
                                                <img
                                                    src={comment.imageUrl}
                                                    alt="Comment image"
                                                    className="max-h-60 rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">
                            Post not found or you don't have permission to view it.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}