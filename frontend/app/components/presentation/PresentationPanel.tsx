'use client';

import { useState, useEffect } from 'react';
import { useOnePage } from '../../contexts/OnePageContext';
import ShowcasePanel from './ShowcasePanel';
import ContentPanel from './ContentPanel';
import { Group, Event, GroupPost, GroupComment, GroupMessage, User } from '../../types/group';
import { getCurrentUserClient } from '@/services/user';
import { getGroupPosts, getGroupMessages, getGroupEvents } from '@/services/group';

interface PresentationPanelProps {
    type: 'group' | 'event';
    selectedItem: Group | Event;
}

export default function PresentationPanel({ type, selectedItem }: PresentationPanelProps) {
    const { navigateToFeed } = useOnePage();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // Data states
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    
    // Loading states
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    
    // Posts interaction states
    const [commentsByPost, setCommentsByPost] = useState<Record<number, GroupComment[]>>({});
    const [showCommentsForPost, setShowCommentsForPost] = useState<Record<number, boolean>>({});
    const [newCommentByPost, setNewCommentByPost] = useState<Record<number, string>>({});
    const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
    
    // Error states
    const [error, setError] = useState<string | null>(null);

    // Get the groupId - for groups it's the selectedItem.id, for events it's the group_id
    const groupId = type === 'group' ? selectedItem.id : (selectedItem as Event).group_id;

    useEffect(() => {
        initializeData();
    }, [selectedItem, type]);

    const initializeData = async () => {
        try {
            setError(null);
            
            // Load current user data
            const userData = await getCurrentUserClient();
            // Map UserProfile to simpler User type expected by components
            const user: User = {
                id: userData.id,
                username: userData.username
            };
            setCurrentUser(user);
            
            // Load all data in parallel
            await Promise.all([
                loadPosts(),
                loadMessages(),
                loadEvents()
            ]);
            
        } catch (error) {
            console.error('Error initializing presentation data:', error);
            setError('Erreur lors du chargement des données');
        }
    };

    const loadPosts = async () => {
        try {
            setIsLoadingPosts(true);
            const groupPosts = await getGroupPosts(groupId);
            setPosts(groupPosts);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setIsLoadingPosts(false);
        }
    };

    const loadMessages = async () => {
        try {
            setIsLoadingMessages(true);
            const groupMessages = await getGroupMessages(groupId);
            setMessages(groupMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const loadEvents = async () => {
        try {
            setIsLoadingEvents(true);
            if (type === 'group') {
                // Pour un groupe, charger tous ses événements
                const groupEvents = await getGroupEvents(groupId);
                setEvents(groupEvents);
            } else {
                // Pour un événement, charger les sous-événements (placeholder for now)
                setEvents([]);
            }
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    // Handler placeholders - these would connect to real API calls
    const handleCreatePost = async (content: string) => {
        try {
            // TODO: Implement post creation API call
            console.log('Creating post:', content);
            await loadPosts(); // Refresh posts
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleToggleComments = async (postId: number) => {
        try {
            setShowCommentsForPost(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));
            
            // Load comments if not already loaded
            if (!commentsByPost[postId]) {
                setLoadingComments(prev => ({ ...prev, [postId]: true }));
                // TODO: Load actual comments from API
                // const comments = await getPostComments(postId);
                // setCommentsByPost(prev => ({ ...prev, [postId]: comments }));
                setLoadingComments(prev => ({ ...prev, [postId]: false }));
            }
        } catch (error) {
            console.error('Error toggling comments:', error);
        }
    };

    const handleCommentChange = (postId: number, value: string) => {
        setNewCommentByPost(prev => ({
            ...prev,
            [postId]: value
        }));
    };

    const handleCreateComment = async (postId: number, userId: number, username: string) => {
        try {
            const content = newCommentByPost[postId];
            if (!content?.trim()) return;

            // TODO: Implement comment creation API call
            console.log('Creating comment:', { postId, userId, username, content });
            
            // Clear the comment input
            setNewCommentByPost(prev => ({
                ...prev,
                [postId]: ''
            }));
            
            // TODO: Refresh comments or add optimistically
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };

    const handleSendMessage = async (content: string) => {
        try {
            // TODO: Implement message sending API call
            console.log('Sending message:', content);
            await loadMessages(); // Refresh messages
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleEventResponse = async (eventId: number, status: string) => {
        try {
            // TODO: Implement event response API call
            console.log('Event response:', { eventId, status });
            await loadEvents(); // Refresh events
        } catch (error) {
            console.error('Error responding to event:', error);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        try {
            // TODO: Implement event deletion API call
            console.log('Deleting event:', eventId);
            await loadEvents(); // Refresh events
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="text-red-400 text-lg mb-4">
                        {error}
                    </div>
                    <button
                        onClick={navigateToFeed}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retour au feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex bg-gray-900">
            {/* Panneau gauche - Showcase */}
            <div className="w-1/3 border-r border-gray-700">
                <ShowcasePanel 
                    type={type}
                    selectedItem={selectedItem}
                />
            </div>
            
            {/* Panneau droit - Content avec 3 drawers */}
            <div className="w-2/3">
                <ContentPanel
                    type={type}
                    groupId={groupId}
                    currentUser={currentUser}
                    
                    // Data
                    posts={posts}
                    messages={messages}
                    events={events}
                    
                    // Posts props
                    isLoadingPosts={isLoadingPosts}
                    commentsByPost={commentsByPost}
                    showCommentsForPost={showCommentsForPost}
                    newCommentByPost={newCommentByPost}
                    loadingComments={loadingComments}
                    
                    // Callbacks
                    onCreatePost={handleCreatePost}
                    onToggleComments={handleToggleComments}
                    onCommentChange={handleCommentChange}
                    onCreateComment={handleCreateComment}
                    onSendMessage={handleSendMessage}
                    onEventResponse={handleEventResponse}
                    onDeleteEvent={handleDeleteEvent}
                />
            </div>
        </div>
    );
}