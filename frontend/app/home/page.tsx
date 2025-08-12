'use client';

import { useState, useEffect } from "react";
import { getPosts, createPost, Post } from "../../services/post";
import { useCookies } from "next-client-cookies";
import { getCurrentUser, getCurrentUserId } from "../../services/auth";
import { usePresence } from "../hooks/usePresence";
import { createNotification, fetchNotifications } from "../../services/notifications";

// Composants pour le système unifié
import { OnePageProvider } from "../contexts/OnePageContext";
import OnePageLayout from "../components/OnePageLayout";
import ClientOnly from "../components/ClientOnly";

export default function Home(): JSX.Element {
    const cookies = useCookies();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Établir la connexion de présence automatiquement
    usePresence();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Charger les notifications et utilisateur actuel
    useEffect(() => {
        const getNotifAndUser = async () => {
            try {
                const userId = await getCurrentUserId();
                if (!userId) {
                    console.log('User not logged in');
                    return;
                }

                // Charger les notifications
                const fetchedNotifications = await fetchNotifications(null, userId.toString());
                if (Array.isArray(fetchedNotifications)) {
                    setNotifications(fetchedNotifications);
                }

                // Charger l'utilisateur actuel
                const user = await getCurrentUser();
                setCurrentUser(user);
            } catch (error) {
                console.error("Failed to fetch notifications or user:", error);
            }
        };

        getNotifAndUser();
    }, [cookies]);

    // Charger les posts
    useEffect(() => {
        async function loadPosts() {
            console.log("Loading posts...");
            try {
                const fetchedPosts = await getPosts();
                console.log("Fetched posts:", fetchedPosts);
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadPosts();
    }, [cookies]);

    // Handlers
    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Handler pour créer un post avec le nouveau système
    const handleCreatePost = async (postData: any) => {
        try {
            const newPost = await createPost(postData);

            createNotification({
                userId: parseInt(newPost.userId),
                type: 'post_created',
                content: `New post created by ${newPost.userName}`,
                referenceId: newPost.id,
                referenceType: 'post'
            });
            
            setPosts([newPost, ...posts]);
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
                    username={currentUser?.username}
                    notifications={notifications}
                    showNotifications={showNotifications}
                    onToggleNotifications={handleToggleNotifications}
                    posts={posts}
                    isLoading={isLoading}
                    onCreatePost={handleCreatePost}
                    currentUser={currentUser}
                />
            </OnePageProvider>
        </ClientOnly>
    );
}