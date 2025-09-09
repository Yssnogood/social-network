'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOnePage } from '../../contexts/OnePageContext';
import AdaptiveVerticalPanelSystem from './AdaptiveVerticalPanelSystem';
import { Group, Event, GroupPost, GroupComment, GroupMessage, EventMessage, ContextualMessage, User, GroupMember, DiscussionContext } from '../../types/group';
import { getCurrentUserClient } from '@/services/user';
import { ContextualMessageService } from '@/services/contextualMessages';
import { useContextualWebSocket } from '../../hooks/useContextualWebSocket';
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
    createEvent,
    getEventResponses
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
    const [messages, setMessages] = useState<ContextualMessage[]>([]);
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
    
    // Event response state for the current user
    const [currentUserStatus, setCurrentUserStatus] = useState<'going' | 'not_going' | 'maybe' | null>(null);

    // 🎯 NOUVELLE LOGIQUE CONTEXTUELLE - distingue groupe vs événement
    const discussionContext: DiscussionContext = ContextualMessageService.getDiscussionContext(type, selectedItem);
    
    console.log(`🎯 PresentationPanel: contexte = ${discussionContext.type} ID:${discussionContext.id}`, {
        type,
        selectedItem,
        discussionContext
    });
    
    // 🔌 WebSocket contextuel pour les messages temps réel
    useContextualWebSocket({ 
        context: discussionContext, 
        setMessages 
    });
    
    // Pour les posts et membres, on utilise toujours le groupe (même pour les événements)
    const groupId = type === 'group' ? selectedItem.id : (selectedItem as Event).group_id;

    useEffect(() => {
        initializeData();
    }, [selectedItem, type]);

    const initializeData = async () => {
        try {
            setError(null);
            
            // Load current user data first
            const userData = await getCurrentUserClient();
            // Map UserProfile to simpler User type expected by components
            const user: User = {
                id: userData.id,
                username: userData.username
            };
            setCurrentUser(user);
            
            // Load all other data in parallel
            await Promise.all([
                loadPosts(),
                loadMessages(),
                loadEvents(),
                loadMembers()
            ]);
            
            // Load current user's event status (depends on currentUser, so call after setCurrentUser)
            // We need to call this after setCurrentUser, but since useState is async, we pass the user directly
            await loadCurrentUserEventStatusWithUser(user);
            
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
            // 🎯 UTILISE LE SERVICE CONTEXTUEL - charge les bons messages selon le contexte !
            const contextualMessages = await ContextualMessageService.getMessages(discussionContext);
            // Assurer que nous avons toujours un tableau, pas null
            const safeMessages = Array.isArray(contextualMessages) ? contextualMessages : [];
            setMessages(safeMessages);
            
            console.log(`📨 Messages chargés pour ${discussionContext.type} ID:${discussionContext.id}`, {
                count: safeMessages.length,
                context: discussionContext
            });
        } catch (error) {
            console.error('Error loading contextual messages:', error);
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

    const loadCurrentUserEventStatusWithUser = async (user: User | null = currentUser) => {
        // Only load status if we're dealing with an event and have a current user
        if (type !== 'event' || !user) {
            setCurrentUserStatus(null);
            return;
        }
        
        try {
            const eventId = (selectedItem as Event).id;
            const responses = await getEventResponses(eventId);
            
            // Find current user's response
            const userResponse = responses.find(r => r.user_id === user.id);
            setCurrentUserStatus(userResponse?.status || null);
            
            console.log('🎯 Current user event status loaded:', {
                eventId,
                userId: user.id,
                status: userResponse?.status || 'no response'
            });
        } catch (error) {
            console.error('Error loading current user event status:', error);
            setCurrentUserStatus(null);
        }
    };

    const loadCurrentUserEventStatus = async () => {
        await loadCurrentUserEventStatusWithUser();
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
            // 🎯 UTILISE LE SERVICE CONTEXTUEL - envoie vers la bonne discussion !
            await ContextualMessageService.sendMessage(discussionContext, content);
            
            console.log(`📤 Message envoyé vers ${discussionContext.type} ID:${discussionContext.id}`, {
                content: content.substring(0, 50),
                context: discussionContext
            });
            
            // Les WebSocket se chargeront de mettre à jour les messages en temps réel
            // Plus besoin de loadMessages() ici
        } catch (error) {
            console.error('Error sending contextual message:', error);
            setError(`Erreur lors de l'envoi du message vers ${discussionContext.type === 'group' ? 'le groupe' : 'l\'événement'}`);
        }
    };

    const handleEventResponse = async (eventId: number, status: string) => {
        try {
            // Ensure status is valid for API
            if (status !== 'going' && status !== 'not_going' && status !== 'maybe') {
                console.warn('Invalid status, defaulting to not_going:', status);
                status = 'not_going';
            }
            
            const validStatus = status as 'going' | 'not_going' | 'maybe';
            await respondToEvent(eventId, validStatus);
            
            // Update current user's status immediately (optimistic update)
            setCurrentUserStatus(validStatus);
            
            // Refresh data after response
            await Promise.all([
                loadEvents(), // Refresh events after response
                loadCurrentUserEventStatus() // Refresh user's status to ensure consistency
            ]);
            
            console.log('🎯 Event response updated:', {
                eventId,
                status: validStatus,
                userId: currentUser?.id
            });
        } catch (error) {
            console.error('Error responding to event:', error);
            setError('Erreur lors de la réponse à l\'événement');
            // Reload status to revert optimistic update on error
            await loadCurrentUserEventStatus();
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
    const canInvite = Boolean(currentUser && (
        type === 'group' 
            ? (selectedItem as Group).creator_id === currentUser.id
            : (selectedItem as Event).creator_id === currentUser.id
    ));

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
                
                // Current user event status
                currentUserStatus={currentUserStatus}
                
                // Callback de changement de configuration
                onConfigChange={(config) => {
                    console.log('📊 Configuration verticale mise à jour:', config);
                    // TODO: Optionnel - sauvegarder les préférences utilisateur
                }}
            />
        </div>
    );
}