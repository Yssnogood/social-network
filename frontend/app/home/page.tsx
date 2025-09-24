'use client';
import { createNotification } from "../../services/notifications";
import { useState, useEffect } from "react";
import { getPosts, createPost, Post } from "../../services/post";
import { useCookies } from "next-client-cookies";

// Nouveaux composants extraits
import AppLayout from "../components/AppLayout";
import CreatePostModal from "../components/CreatePostModal";
import PostsList from "../components/PostsList";
import CreateGroupModal from "../components/GroupModal";

export default function Home() {
    const cookies = useCookies();
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

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

    const handleSubmitPost = async (postData: { content: string; privacy: number; viewers: number[], imageUrl?: string }) => {
        try {
            const newPost = await createPost(postData, cookies.get("jwt"));
			
            if(newPost.privacy === 0 || newPost.privacy === 1){
                createNotification({
                    userId: parseInt(newPost.userId),
                    type: 'post_created',
                    content: `New post created by ${newPost.userName.username}`,
                    referenceId: newPost.id,
                    referenceType: 'post'
                })
            }


            setPosts([newPost, ...posts]);
            handleCloseModal();
        } catch (error) {
            console.error("Failed to create post:", error);
        }
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

    return (
        <AppLayout>
            <div className="min-h-screen bg-zinc-950">
                <div className="container mx-auto px-4 py-6">
                    {/* Sticky Create Post Section */}
                    <div className="sticky top-20 z-40 bg-zinc-950/95 backdrop-blur mb-4">
                        <div className="max-w-xl mx-auto">
                            <div 
                                onClick={handleOpenModal}
                                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {cookies.get("user")?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-zinc-400">
                                        What's on your mind, {cookies.get("user")}?
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts Feed */}
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
        </AppLayout>
    );
}