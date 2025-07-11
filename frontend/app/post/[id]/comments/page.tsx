"use client";

import { useState, useEffect, use } from "react";
import { useCookies } from "next-client-cookies";
import { getSpecificPost, Post } from "../../../../services/post";
import { getComments, createComment, Comment } from "../../../../services/comment";
import { createNotification } from "@/services/notifications";

// Nouveaux composants extraits
import SimpleHeader from "../../../components/SimpleHeader";
import PostDetail from "../../../components/PostDetail";
import CommentForm from "../../../components/CommentForm";
import CommentsList from "../../../components/CommentsList";
import BackButton from "../../../components/BackButton";
import LoadingSpinner from "../../../components/LoadingSpinner";
import NotFoundMessage from "../../../components/NotFoundMessage";

export default function CommentsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const cookies = useCookies();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const param = use(params);
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

    const handleSubmitComment = async (commentContent: string) => {
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
            <SimpleHeader />

            <main className="container mx-auto px-4 pt-16 pb-8">
                <div className="max-w-2xl mx-auto">
                    <BackButton href="/home" text="Back to Feed" />

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : post ? (
                        <div>
                            <PostDetail
                                post={post}
                                commentsCount={comments.length}
                                jwt={cookies.get("jwt")}
                            />

                            <CommentForm onSubmit={handleSubmitComment} />

                            <CommentsList comments={comments} />
                        </div>
                    ) : (
                        <NotFoundMessage message="Post not found" />
                    )}
                </div>
            </main>
        </div>
    );
}