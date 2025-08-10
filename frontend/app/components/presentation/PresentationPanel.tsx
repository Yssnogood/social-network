'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOnePage } from '../../contexts/OnePageContext';
import AdaptiveVerticalPanelSystem from './AdaptiveVerticalPanelSystem';
import { Group, Event, GroupPost, GroupComment, GroupMessage, User, GroupMember } from '../../types/group';
import { getCurrentUserClient } from '@/services/user';
import { 
    getGroupPosts, 
    getGroupMessages, 
    getGroupEvents, 
    getGroupMembers,
    createGroupPost,
    sendGroupMessage,
    respondToEvent,
    deleteGroupEvent,
    getGroupPostComments,
    createGroupPostComment,
    inviteUsersToGroup,
    inviteGroupsToGroup,
    createEvent
} from '@/services/group';

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
    const [members, setMembers] = useState<GroupMember[]>([]);
    
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
                loadEvents(),
                loadMembers()
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

    const loadMembers = async () => {
        try {
            const groupMembers = await getGroupMembers(groupId);
            setMembers(groupMembers);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    };

    // Real API handlers connected to services
    const handleCreatePost = useCallback(async (postData: any) => {
        try {
            await createGroupPost(groupId, {
                content: postData.content,
                imageUrl: postData.imageUrl
            });
            await loadPosts(); // Refresh posts after creation
        } catch (error) {
            console.error('Error creating post:', error);
            setError('Erreur lors de la création du post');
        }
    }, [groupId, loadPosts]);

    const handleToggleComments = useCallback(async (postId: number) => {
        try {
            setShowCommentsForPost(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));
            
            // Load comments if not already loaded
            if (!commentsByPost[postId]) {
                setLoadingComments(prev => ({ ...prev, [postId]: true }));
                try {
                    const comments = await getGroupPostComments(groupId, postId);
                    setCommentsByPost(prev => ({ ...prev, [postId]: comments }));
                } catch (error) {
                    console.error('Error loading comments:', error);
                    setError('Erreur lors du chargement des commentaires');
                } finally {
                    setLoadingComments(prev => ({ ...prev, [postId]: false }));
                }
            }
        } catch (error) {
            console.error('Error toggling comments:', error);
        }
    }, [groupId, commentsByPost]);

    const handleCommentChange = useCallback((postId: number, value: string) => {
        setNewCommentByPost(prev => ({
            ...prev,
            [postId]: value
        }));
    }, []);

    const handleCreateComment = useCallback(async (postId: number, userId: number, username: string, providedContent?: string) => {
        try {
            // Use provided content (from form) or fallback to state
            const content = providedContent || newCommentByPost[postId];
            console.log('PresentationPanel.handleCreateComment:', {
                postId,
                userId,
                username,
                providedContent,
                fallbackContent: newCommentByPost[postId],
                finalContent: content
            });
            
            if (!content?.trim()) {
                console.log('No content to submit, aborting');
                return;
            }

            console.log('Creating group comment for group', groupId, 'post', postId, 'content:', content);
            const newComment = await createGroupPostComment(groupId, postId, content);
            console.log('Group comment created successfully:', newComment);
            
            // Clear the comment input FIRST
            setNewCommentByPost(prev => ({
                ...prev,
                [postId]: ''
            }));
            
            // Add new comment immediately to state (optimistic update)
            setCommentsByPost(prev => ({ 
                ...prev, 
                [postId]: [...(prev[postId] || []), newComment]
            }));
            
            // Update the posts array to increment comment count
            setPosts(prev => prev.map(post => 
                post.id === postId 
                    ? { ...post, comments_count: (post.comments_count || 0) + 1 }
                    : post
            ));
            
            // Refresh comments to ensure consistency (in background)
            try {
                const updatedComments = await getGroupPostComments(groupId, postId);
                setCommentsByPost(prev => ({ ...prev, [postId]: updatedComments }));
            } catch (refreshError) {
                console.warn('Could not refresh comments:', refreshError);
                // Keep optimistic update if refresh fails
            }
        } catch (error) {
            console.error('Error creating comment:', error);
            setError('Erreur lors de la création du commentaire');
        }
    }, [groupId, newCommentByPost]);

    const handleSendMessage = async (content: string) => {
        try {
            await sendGroupMessage(groupId, content);
            await loadMessages(); // Refresh messages after sending
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Erreur lors de l\'envoi du message');
        }
    };

    const handleEventResponse = async (eventId: number, status: string) => {
        try {
            // Ensure status is valid for API
            if (status !== 'going' && status !== 'not_going') {
                console.warn('Invalid status, defaulting to not_going:', status);
                status = 'not_going';
            }
            await respondToEvent(eventId, status as 'going' | 'not_going');
            await loadEvents(); // Refresh events after response
        } catch (error) {
            console.error('Error responding to event:', error);
            setError('Erreur lors de la réponse à l\'événement');
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        try {
            await deleteGroupEvent(eventId);
            await loadEvents(); // Refresh events after deletion
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Erreur lors de la suppression de l\'événement');
        }
    };

    const handleCreateEvent = async (title: string, description: string, eventDate: string) => {
        try {
            await createEvent({
                group_id: groupId,
                title,
                description,
                event_date: eventDate
            });
            await loadEvents(); // Refresh events after creation
        } catch (error) {
            console.error('Error creating event:', error);
            setError('Erreur lors de la création de l\'événement');
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

    // Handler pour les invitations d'utilisateurs
    const handleInviteUsers = async (userIds: number[]) => {
        try {
            await inviteUsersToGroup(groupId, userIds);
            // TODO: Rafraîchir la liste des membres après invitation
            console.log('Users invited successfully:', userIds);
        } catch (error) {
            console.error('Error inviting users:', error);
            setError('Erreur lors de l\'invitation des utilisateurs');
        }
    };

    // Handler pour les invitations de groupes  
    const handleInviteGroups = async (groupIds: number[]) => {
        try {
            await inviteGroupsToGroup(groupId, groupIds);
            // TODO: Rafraîchir la liste des groupes membres après invitation
            console.log('Groups invited successfully:', groupIds);
        } catch (error) {
            console.error('Error inviting groups:', error);
            setError('Erreur lors de l\'invitation des groupes');
        }
    };

    // Déterminer les permissions d'invitation
    const canInvite = currentUser && (
        type === 'group' 
            ? (selectedItem as Group).creator_id === currentUser.id
            : (selectedItem as Event).created_by === currentUser.id
    );

    return (
        <div className="h-full bg-gray-900">
            <AdaptiveVerticalPanelSystem
                key={`adaptive-vertical-${type}-${selectedItem.id}`} // Force remount pour reset config
                type={type}
                selectedItem={selectedItem}
                currentUser={currentUser}
                
                // Données présentation
                members={members}
                memberGroups={[]} // TODO: Charger les groupes membres
                canInvite={canInvite}
                onInviteUsers={handleInviteUsers}
                onInviteGroups={handleInviteGroups}
                backgroundImage={undefined} // TODO: Intégrer image de fond depuis les données
                photoGallery={[]} // TODO: Intégrer galerie photos
                
                // Données communication
                posts={posts}
                messages={messages}
                events={events}
                
                // Props posts
                isLoadingPosts={isLoadingPosts}
                commentsByPost={commentsByPost}
                showCommentsForPost={showCommentsForPost}
                newCommentByPost={newCommentByPost}
                loadingComments={loadingComments}
                
                // Callbacks communication
                onCreatePost={handleCreatePost}
                onToggleComments={handleToggleComments}
                onCommentChange={handleCommentChange}
                onCreateComment={handleCreateComment}
                onSendMessage={handleSendMessage}
                onEventResponse={handleEventResponse}
                onDeleteEvent={handleDeleteEvent}
                onCreateEvent={handleCreateEvent}
                
                // Callback de changement de configuration
                onConfigChange={(config) => {
                    console.log('📊 Configuration verticale mise à jour:', config);
                    // TODO: Optionnel - sauvegarder les préférences utilisateur
                }}
            />
        </div>
    );
}