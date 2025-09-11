"use client";

import { useState, useEffect, use } from "react";
import { useCookies } from "next-client-cookies";
import { getSpecificPost, Post } from "../../../../services/post";
import { getComments, createComment, Comment } from "../../../../services/comment";
import { createNotification, fetchNotifications } from "@/services/notifications";
import { getUserIdFromToken } from "../../../../services/user";

// Component imports
import Header, { Notification } from "../../../components/Header";
import PostDetail from "../../../components/PostDetail";
import CommentForm from "../../../components/CommentForm";
import CommentsList from "../../../components/CommentsList";
import BackButton from "../../../components/BackButton";
import LoadingSpinner from "../../../components/LoadingSpinner";
import NotFoundMessage from "../../../components/NotFoundMessage";

export default function CommentsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const cookies = useCookies();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const param = use(params);
    const postId = parseInt(param.id);

    // Load logged-in user ID
    useEffect(() => {
        const loadUserId = async () => {
            const token = cookies.get("jwt");
            if (token) {
                const id = await getUserIdFromToken(token);
                if (id) setCurrentUserId(parseInt(id));
            }
        };

        loadUserId();
    }, [cookies]);

    // Load notifications
    useEffect(() => {
        const getNotif = async () => {
            const token = cookies.get("jwt");
            const userId = await getUserIdFromToken(token);
            if (!token || !userId) return;

            try {
                const fetchedNotifications = await fetchNotifications(token, userId);
                if (Array.isArray(fetchedNotifications)) {
                    setNotifications(fetchedNotifications);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        getNotif();
    }, [cookies]);

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Load post and comments
    useEffect(() => {
        async function loadPostAndComments() {
            try {
                const token = cookies.get("jwt");

                const foundPost = await getSpecificPost(postId, token);
                if (foundPost) {
                    setPost(foundPost);
                    const postComments = await getComments(postId, token);
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

    // Handle new comment submission
    const handleSubmitComment = async (commentContent: string) => {
        const token = cookies.get("jwt");
        const username = cookies.get("user");

        const newComment = await createComment(
            {
                postId,
                content: commentContent,
            },
            token
        );

        if (newComment) {
            const commentWithUsername = {
                ...newComment,
                userName: username || newComment.userName || "You",
            };

            setComments([commentWithUsername, ...comments]);

            if (post?.userName !== username) {
                try {
                    if (!post) return;
                    await createNotification({
                        userId: parseInt(post.userId),
                        type: "comment",
                        content: `${username || "You"} commented on your post`,
                        referenceId: post.id,
                        referenceType: "post",
                    });
                } catch (error) {
                    console.error("Failed to create notification:", error);
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header
                username={cookies.get("user")}
                notifications={notifications}
                showNotifications={showNotifications}
                onToggleNotifications={handleToggleNotifications}
            />

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

                            <CommentsList comments={comments} currentUserId={currentUserId} />
                        </div>
                    ) : (
                        <NotFoundMessage message="Post not found" />
                    )}
                </div>
            </main>
        </div>
    );
}
