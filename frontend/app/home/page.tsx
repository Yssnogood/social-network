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
import CreateGroupModal from "../components/GroupModal";
import ClientOnly from "../components/ClientOnly";

// Composants traditionnels du merge
import Header from "../components/Header";
import CreatePostButton from "../components/CreatePostButton";
import CreateGroupButton from "../components/CreateGroupButton";
import GroupsList from "../components/GroupsList";
import PostsList from "../components/PostsList";

interface HomeProps {
    useOnePageLayout?: boolean; // Toggle entre les deux modes
}

export default function Home({ useOnePageLayout = true }: HomeProps) {
    const cookies = useCookies();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [groups, setGroups] = useState([]);

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

    // Charger les groupes
    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await fetch("http://localhost:8080/api/groups", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${cookies.get("jwt")}`,
                    },
                });
                if (!response.ok) throw new Error("Erreur lors de la récupération des groupes");
                const allGroups = await response.json();
                setGroups(allGroups);
            } catch (error) {
                console.error("Erreur de chargement des groupes:", error);
            }
        }

        fetchGroups();
    }, [cookies]);

    // Handlers
    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const handleOpenPostModal = () => {
        setIsCreatePostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsCreatePostModalOpen(false);
    };

    const handleOpenGroupModal = () => {
        setIsCreateGroupModalOpen(true);
    };

    const handleCloseGroupModal = () => {
        setIsCreateGroupModalOpen(false);
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

    const handleSubmitGroup = async (groupData: { title: string; description: string }) => {
        try {
            const response = await fetch('http://localhost:8080/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies.get("jwt")}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: groupData.title,
                    description: groupData.description
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create group: ${errorText}`);
            }

            const data = await response.json();
            console.log('Group created successfully:', data);

            // Recharger la liste des groupes
            const updatedGroupsResponse = await fetch("http://localhost:8080/api/groups", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${cookies.get("jwt")}`,
                },
            });
            
            if (updatedGroupsResponse.ok) {
                const updatedGroups = await updatedGroupsResponse.json();
                setGroups(updatedGroups);
            }

            alert('Groupe créé avec succès !');
            handleCloseGroupModal();
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Erreur lors de la création du groupe');
        }
    };

    // Mode One Page Layout (nouveau système)
    if (useOnePageLayout) {
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

                    {/* Modal pour créer un groupe */}
                    <CreateGroupModal
                        isOpen={isCreateGroupModalOpen}
                        onClose={handleCloseGroupModal}
                        onSubmit={handleSubmitGroup}
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

                    {/* Bouton pour basculer vers le mode traditionnel */}
                    <button
                        onClick={() => window.location.href = '/home?legacy=true'}
                        className="fixed top-20 left-4 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm z-40 transition-colors"
                        title="Mode traditionnel"
                    >
                        Mode Classic
                    </button>
                </OnePageProvider>
            </ClientOnly>
        );
    }

    // Mode Traditionnel (système du merge)
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
            <Header
                username={cookies.get("user")}
                notifications={notifications}
                showNotifications={showNotifications}
                onToggleNotifications={handleToggleNotifications}
            />

            <CreatePostButton onClick={handleOpenPostModal} />

            <CreateGroupButton onClick={handleOpenGroupModal} />

            <GroupsList groups={groups} />

            <div className="dark:bg-background pt-16 px-4 flex justify-center">
                <div className="w-full max-w-xl mx-auto">
                    <PostsList
                        posts={posts}
                        isLoading={isLoading}
                        jwt={cookies.get("jwt")}
                        onlineUser={cookies.get("user")}
                    />
                </div>
            </div>

            {/* Modals */}
            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={handleClosePostModal}
                onSubmit={handleSubmitPost}
            />

            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={handleCloseGroupModal}
                onSubmit={handleSubmitGroup}
            />

            {/* Bouton pour basculer vers le mode one page */}
            <button
                onClick={() => window.location.href = '/home'}
                className="fixed top-20 left-4 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm z-40 transition-colors"
                title="Mode One Page"
            >
                Mode One Page
            </button>
        </ClientOnly>
    );
}