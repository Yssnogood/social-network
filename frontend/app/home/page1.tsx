'use client';

import { useState, useEffect } from "react";
import { getPosts, createPost, Post } from "../../services/post";
import { useCookies } from "next-client-cookies";
import { getUserIdFromToken } from "../../services/user";
import { createNotification, fetchNotifications } from "../../services/notifications";

// Composants pour le système one page
import { OnePageProvider } from "../contexts/OnePageContext";
import OnePageLayout from "../components/OnePageLayout";
import CreatePostModal from "../components/CreatePostModal";
import ClientOnly from "../components/ClientOnly";

export default function Home() {
    const cookies = useCookies();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    // Charger les notifications
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

    // Charger les posts
    useEffect(() => {
        async function loadPosts() {
            try {
                const fetchedPosts = await getPosts(cookies.get("jwt"));
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadPosts();
    }, [cookies]);

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const handleOpenPostModal = () => {
        setIsCreatePostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsCreatePostModalOpen(false);
    };

    const handleSubmitPost = async (postData: { content: string; privacy: number; viewers: number[], imageUrl?: string }) => {
        try {
            const newPost = await createPost(postData, cookies.get("jwt"));

            createNotification({
                userId: parseInt(newPost.userId),
                type: 'post_created',
                content: `New post created by ${newPost.userName}`,
                referenceId: newPost.id,
                referenceType: 'post'
            });
            
            setPosts([newPost, ...posts]);
            handleClosePostModal();
        } catch (error) {
            console.error("Failed to create post:", error);
        }
    };

    return (
        <ClientOnly 
            fallback={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-400">Chargement...</p>
                    </div>
                </div>
            }
        >
            <OnePageProvider>
                <OnePageLayout
                    username={cookies.get("user")}
                    notifications={notifications}
                    showNotifications={showNotifications}
                    onToggleNotifications={handleToggleNotifications}
                    posts={posts}
                    isLoading={isLoading}
                    jwt={cookies.get("jwt") || ""}
                />

                {/* Modal pour créer un post */}
                <CreatePostModal
                    isOpen={isCreatePostModalOpen}
                    onClose={handleClosePostModal}
                    onSubmit={handleSubmitPost}
                />

                {/* Bouton flottant pour créer un post */}
                <button
                    onClick={handleOpenPostModal}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-30 transition-colors"
                    title="Créer un post"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </OnePageProvider>
        </ClientOnly>
    );
}