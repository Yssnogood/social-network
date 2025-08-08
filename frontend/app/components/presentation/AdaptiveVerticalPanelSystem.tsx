'use client';

import React, { useMemo } from 'react';
import VerticalPanelSystem from './VerticalPanelSystem';
import PresentationContentPanel from './PresentationContentPanel';
import ContentPanel from './ContentPanel';
import { useVerticalPanelState } from '../../hooks/useVerticalDrawers';
import { Group, Event, GroupPost, GroupComment, GroupMessage, User, GroupMember } from '../../types/group';
import '../../styles/drawer-animations.css';

interface AdaptiveVerticalPanelSystemProps {
    // Informations de base
    type: 'group' | 'event';
    selectedItem: Group | Event;
    currentUser: User | null;
    
    // Données pour le panneau présentation
    members: GroupMember[];
    memberGroups?: Group[];
    canInvite?: boolean;
    onInviteUsers?: (userIds: number[]) => Promise<void>;
    onInviteGroups?: (groupIds: number[]) => Promise<void>;
    backgroundImage?: string;
    photoGallery?: string[];
    
    // Données pour le panneau communication
    posts: GroupPost[];
    messages: GroupMessage[];
    events: Event[];
    
    // Props pour les posts
    isLoadingPosts?: boolean;
    commentsByPost?: Record<number, GroupComment[]>;
    showCommentsForPost?: Record<number, boolean>;
    newCommentByPost?: Record<number, string>;
    loadingComments?: Record<number, boolean>;
    
    // Callbacks du panneau communication
    onCreatePost?: (content: string) => Promise<void>;
    onToggleComments?: (postId: number) => Promise<void>;
    onCommentChange?: (postId: number, value: string) => void;
    onCreateComment?: (postId: number, userId: number, username: string) => Promise<void>;
    onSendMessage?: (content: string) => Promise<void>;
    onEventResponse?: (eventId: number, status: string) => Promise<void>;
    onDeleteEvent?: (eventId: number) => Promise<void>;
    
    // Callbacks optionnels
    onConfigChange?: (config: any) => void;
}

/**
 * Composant AdaptiveVerticalPanelSystem - Intègre les panneaux existants avec le système vertical
 * 
 * Fonctionnalités:
 * - Intègre PresentationContentPanel dans le panneau présentation vertical
 * - Intègre ContentPanel dans le panneau communication vertical  
 * - Vignettes adaptatives selon l'espace vertical disponible
 * - Redimensionnement intelligent des sous-panneaux
 */
export default function AdaptiveVerticalPanelSystem({
    type,
    selectedItem,
    currentUser,
    members = [],
    memberGroups = [],
    canInvite = false,
    onInviteUsers,
    onInviteGroups,
    backgroundImage,
    photoGallery = [],
    posts = [],
    messages = [],
    events = [],
    isLoadingPosts = false,
    commentsByPost = {},
    showCommentsForPost = {},
    newCommentByPost = {},
    loadingComments = {},
    onCreatePost,
    onToggleComments,
    onCommentChange,
    onCreateComment,
    onSendMessage,
    onEventResponse,
    onDeleteEvent,
    onConfigChange
}: AdaptiveVerticalPanelSystemProps) {
    
    // État des panneaux verticaux pour adaptation
    const { 
        presentationInfo, 
        communicationInfo,
        config 
    } = useVerticalPanelState();
    
    // Calcul de l'ID du groupe (pour les groupes c'est selectedItem.id, pour les événements c'est group_id)
    const groupId = type === 'group' ? selectedItem.id : (selectedItem as Event).group_id;
    
    // Titre dynamique pour la présentation
    const presentationTitle = type === 'event' 
        ? `Événement: ${selectedItem.title}` 
        : `Groupe: ${selectedItem.title}`;
    
    /**
     * Configuration adaptative pour les sous-panneaux selon l'espace vertical
     */
    const adaptiveConfig = useMemo(() => {
        const presentationSize = presentationInfo.size;
        const communicationSize = communicationInfo.size;
        
        return {
            presentation: {
                // Plus d'espace = plus de détails dans les tiroirs
                showFullDetails: presentationSize === '3/3',
                isCompact: presentationSize === '1/3',
                isClosed: presentationSize === '0',
                availableHeight: presentationSize
            },
            communication: {
                // Plus d'espace = plus de détails dans les tiroirs
                showFullDetails: communicationSize === '3/3', 
                isCompact: communicationSize === '1/3',
                isClosed: communicationSize === '0',
                availableHeight: communicationSize
            }
        };
    }, [presentationInfo.size, communicationInfo.size]);
    
    /**
     * Panneau Présentation Adaptatif
     */
    const AdaptivePresentationPanel = () => {
        const config = adaptiveConfig.presentation;
        
        if (config.isClosed) {
            return null; // Le panneau fermé n'affiche rien
        }
        
        return (
            <div className={`h-full transition-all duration-300 ${
                config.isCompact ? 'presentation-compact vertical-content-compact' : 'vertical-content-full'
            }`}>
                <PresentationContentPanel
                    type={type}
                    selectedItem={selectedItem}
                    currentUser={currentUser}
                    members={members}
                    memberGroups={memberGroups}
                    canInvite={canInvite}
                    onInviteUsers={onInviteUsers}
                    onInviteGroups={onInviteGroups}
                    backgroundImage={backgroundImage}
                    photoGallery={photoGallery}
                />
                
                {/* Overlay d'adaptation avec animation fade-in si nécessaire */}
                {config.isCompact && (
                    <div className="absolute top-0 right-0 bg-blue-600/10 px-2 py-1 text-xs text-blue-400 rounded-bl 
                                   drawer-content-fade-in animate-pulse">
                        Mode compact
                    </div>
                )}
            </div>
        );
    };
    
    /**
     * Panneau Communication Adaptatif
     */
    const AdaptiveCommunicationPanel = () => {
        const config = adaptiveConfig.communication;
        
        if (config.isClosed) {
            return null; // Le panneau fermé n'affiche rien
        }
        
        return (
            <div className={`h-full transition-all duration-300 ${
                config.isCompact ? 'communication-compact vertical-content-compact' : 'vertical-content-full'
            }`}>
                <ContentPanel
                    type={type}
                    groupId={groupId}
                    currentUser={currentUser}
                    posts={posts}
                    messages={messages}
                    events={events}
                    isLoadingPosts={isLoadingPosts}
                    commentsByPost={commentsByPost}
                    showCommentsForPost={showCommentsForPost}
                    newCommentByPost={newCommentByPost}
                    loadingComments={loadingComments}
                    onCreatePost={onCreatePost}
                    onToggleComments={onToggleComments}
                    onCommentChange={onCommentChange}
                    onCreateComment={onCreateComment}
                    onSendMessage={onSendMessage}
                    onEventResponse={onEventResponse}
                    onDeleteEvent={onDeleteEvent}
                />
                
                {/* Overlay d'adaptation avec animation fade-in si nécessaire */}
                {config.isCompact && (
                    <div className="absolute top-0 right-0 bg-green-600/10 px-2 py-1 text-xs text-green-400 rounded-bl 
                                   drawer-content-fade-in animate-pulse">
                        Mode compact
                    </div>
                )}
            </div>
        );
    };
    
    return (
        <>
            {/* CSS pour les modes adaptatifs avec animations améliorées */}
            <style jsx>{`
                .presentation-compact .drawer-transition {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .presentation-compact .p-4 {
                    padding: 0.5rem;
                    transition: padding 0.3s ease;
                }
                
                .communication-compact .drawer-transition {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .communication-compact .p-4 {
                    padding: 0.5rem;
                    transition: padding 0.3s ease;
                }
                
                /* Styles pour mode compact - tiroirs plus petits avec animations */
                .presentation-compact .drawer-header {
                    padding: 0.5rem 1rem;
                    min-height: 2.5rem;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    border-left: 2px solid transparent;
                }
                
                .presentation-compact .drawer-header:hover {
                    border-left-color: rgba(59, 130, 246, 0.5);
                    transform: translateX(1px);
                }
                
                .communication-compact .drawer-header {
                    padding: 0.5rem 1rem;  
                    min-height: 2.5rem;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    border-left: 2px solid transparent;
                }
                
                .communication-compact .drawer-header:hover {
                    border-left-color: rgba(34, 197, 94, 0.5);
                    transform: translateX(1px);
                }
                
                /* Textes plus petits en mode compact avec transitions */
                .presentation-compact .text-sm {
                    font-size: 0.75rem;
                    transition: font-size 0.3s ease, opacity 0.3s ease;
                }
                
                .communication-compact .text-sm {
                    font-size: 0.75rem;
                    transition: font-size 0.3s ease, opacity 0.3s ease;
                }
                
                /* Animation pour les contenus qui apparaissent en mode compact */
                .presentation-compact > *:not(.absolute) {
                    animation: compact-slide-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .communication-compact > *:not(.absolute) {
                    animation: compact-slide-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                @keyframes compact-slide-in {
                    from {
                        opacity: 0.7;
                        transform: scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                /* Animation fluide pour les changements de mode */
                .vertical-content-compact {
                    animation: content-compact-enter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .vertical-content-full {
                    animation: content-full-enter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                @keyframes content-compact-enter {
                    from {
                        transform: scale(1.02);
                    }
                    to {
                        transform: scale(0.95);
                    }
                }
                
                @keyframes content-full-enter {
                    from {
                        transform: scale(0.98);
                    }
                    to {
                        transform: scale(1);
                    }
                }
            `}</style>
            
            <VerticalPanelSystem
                presentationTitle={presentationTitle}
                presentationBackgroundImage={backgroundImage}
                presentationContent={<AdaptivePresentationPanel />}
                communicationContent={<AdaptiveCommunicationPanel />}
                onConfigChange={(newConfig) => {
                    // Propagation du changement de configuration
                    if (onConfigChange) {
                        onConfigChange({
                            vertical: newConfig,
                            adaptive: adaptiveConfig
                        });
                    }
                }}
                className="adaptive-vertical-panels"
            />
            
            {/* DEBUG: Informations d'adaptation (développement uniquement) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute bottom-0 left-0 z-50 bg-black/80 text-white text-xs p-2 m-2 rounded max-w-sm">
                    <div className="font-semibold mb-1">🔧 Adaptation Config:</div>
                    <div>📊 Présentation: {presentationInfo.size} {adaptiveConfig.presentation.isCompact ? '(compact)' : ''}</div>
                    <div>💬 Communication: {communicationInfo.size} {adaptiveConfig.communication.isCompact ? '(compact)' : ''}</div>
                    <div className="text-gray-400 mt-1">
                        Membres: {members?.length || 0} | Posts: {posts?.length || 0} | Messages: {messages?.length || 0}
                    </div>
                </div>
            )}
        </>
    );
}