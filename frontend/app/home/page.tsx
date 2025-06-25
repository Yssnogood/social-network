'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getPosts, createPost, Post, LikePost } from "../../services/post";
import { formatRelativeTime } from "../../services/utils";
import { useCookies } from "next-client-cookies";
import { CldUploadButton } from "next-cloudinary";


const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
console.log(cloudPresetName)

export default function Home() {
    const cookies = useCookies()
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [postPrivacy, setPostPrivacy] = useState(0);
    const [postContent, setPostContent] = useState('');
    const [imageURL, setPostImage] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        setPostPrivacy(0);
        setPostContent('');
        setPostImage('');
    };

    const handleSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // In a real app, you'd upload the image first and get a URL
            let imageUrl;
            if (imageURL != '') {
                // This would be replaced with actual image upload logic
                imageUrl = imageURL;
            }

            const newPost = await createPost({
                content: postContent,
                privacy: postPrivacy,
                imageUrl
            },cookies.get("jwt"));

            // Add the new post to the top of the list
            setPosts([newPost, ...posts]);
            handleCloseModal();
        } catch (error) {
            console.error("Failed to create post:", error);
            // Here you would show an error notification to the user
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/home" className="font-bold text-lg text-white">
                        Social Network
                    </Link>
                    <nav className="flex gap-4 items-center">
                    <Link
                        href="/contact"
                        className="text-sm text-white hover:text-blue-200"
                    >
                        <button
                            className="text-sm text-white hover:text-blue-200 cursor-pointer flex items-center"
                            aria-label="Messages"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </button>
                        
                    </Link>                        
                        <button
                            className="text-sm text-white hover:text-blue-200 cursor-pointer flex items-center"
                            aria-label="Notifications"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </button>

                        <Link
                            href="/logout"
                            className="text-sm text-white hover:text-blue-200"
                        >
                            Logout
                        </Link>

                        <Link
                            href={`/profile/${cookies.get("user")}`}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-blue-100"
                        >
                            <Image
                                src="/social-placeholder.png"
                                alt="Profile"
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Create Post Button - Fixed to middle-left */}
            <button
                onClick={handleOpenModal}
                className="fixed left-5 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors z-40"
                aria-label="Create post"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            <div className="pt-16 px-4 flex justify-center">
                {/* Main Content Area - Posts more centered */}
                <div className="w-full max-w-xl mx-auto">
                    {/* Loading state */}
                    {isLoading && (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                            <p className="mt-2 text-gray-400">Loading posts...</p>
                        </div>
                    )}

                    {/* No posts state */}
                    {!isLoading && posts.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No posts yet. Be the first to post!</p>
                        </div>
                    )}

                    {/* Posts list */}
                    {posts.map((post) => (
                        <div id={String(post.id)} key={post.id} className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"><img className="rounded-full" src={post.userAvatar} alt={`${post.userName}'s Avatar`} /></div>
                                <div>
                                    <div className="font-semibold text-white">{post.userName}</div>
                                    <div className="text-xs text-gray-400">
                                        {formatRelativeTime(post.createdAt)}
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
                                <Link 
                                    href={`/post/${post.id}/comments`}
                                    className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    {post.comments} Comment{post.comments !== 1 ? 's' : ''}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Post Modal */}
            {isCreatePostModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Create a Post</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitPost}>
                            <div className="mb-4">
                                <label htmlFor="postPrivacy" className="block text-sm font-medium text-gray-300 mb-1">Privacy</label>
                                <select 
                                    name="postPrivacy" 
                                    id="postPrivacy" 
                                    value={postPrivacy} 
                                    onChange={(e) => setPostPrivacy(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                >
                                    <option value="0">🌍 Public</option>
                                    <option value="1">🙎‍♂️ Friends</option>
                                    <option value="2">🔒 Private</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="postContent" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                                <textarea
                                    id="postContent"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <CldUploadButton options={{ sources: ['local', 'url'], }} uploadPreset={cloudPresetName} onSuccess={(result) => {
                                    if (result.info && typeof result.info != "string") {
                                        setPostImage(result.info.secure_url)
                                    }
                                }}>
                                    <span>Upload Image</span>
                                </CldUploadButton>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-400 hover:text-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700"
                                >
                                    Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
