'use client';
import Notifications from "../components/NotificationPanel";
import { createNotification, fetchNotifications } from "../../services/notifications";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getPosts, createPost, Post } from "../../services/post";
import { useCookies } from "next-client-cookies";
import CreateGroupModal from "../components/GroupModal";
import { getUserIdFromToken } from "../../services/user";

// Nouveaux composants extraits
import Header from "../components/Header";
import CreatePostButton from "../components/CreatePostButton";
import CreateGroupButton from "../components/CreateGroupButton";
import GroupsList from "../components/GroupsList";
import CreatePostModal from "../components/CreatePostModal";
import PostsList from "../components/PostsList";

export default function Home() {
    const cookies = useCookies();
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

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
    }, []);

    const handleOpenModal = () => {
        setIsCreatePostModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreatePostModalOpen(false);
    };

    const handleSubmitPost = async (postData: { content: string; privacy: number; imageUrl?: string }) => {
        try {
            const newPost = await createPost(postData, cookies.get("jwt"));

            createNotification({
                userId: parseInt(newPost.userId),
                type: 'post_created',
                content: `New post created by ${newPost.userName}`,
                referenceId: newPost.id,
                referenceType: 'post'
            })
            setPosts([newPost, ...posts]);
            handleCloseModal();
        } catch (error) {
            console.error("Failed to create post:", error);
        }
    };

    const handleOpenGroupModal = () => {
        setIsCreateGroupModalOpen(true);
    };

    const handleCloseGroupModal = () => {
        setIsCreateGroupModalOpen(false);
    }

    const handleSubmitGroup = async (groupData: { title: string; description: string }) => {
        try {
            const response = await fetch('http://localhost:8080/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies.get("jwt")}`
                },
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

            alert('Groupe créé avec succès !');

            handleCloseGroupModal();
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Erreur lors de la création du groupe');
        }
    }

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
    }, []);

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <>
            <Header
                username={cookies.get("user")}
                notifications={notifications}
                showNotifications={showNotifications}
                onToggleNotifications={handleToggleNotifications}
            />

            <CreatePostButton onClick={handleOpenModal} />

            <CreateGroupButton onClick={handleOpenGroupModal} />

            <GroupsList groups={groups} />

            <div className="pt-16 px-4 flex justify-center">
                <div className="w-full max-w-xl mx-auto">
                    <PostsList
                        posts={posts}
                        isLoading={isLoading}
                        jwt={cookies.get("jwt")}
                    />
                </div>
            </div>

            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitPost}
            />

            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={handleCloseGroupModal}
                onSubmit={handleSubmitGroup}
            />
        </>
    );
}