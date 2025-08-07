'use client';

import { useState } from 'react';
import PostsList from '../groupComponent/PostsList';
import MessagesList from '../groupComponent/MessagesList';
import EventsList from '../groupComponent/EventsList';
import MessageInput from '../groupComponent/MessageInput';
import { GroupPost, GroupComment, GroupMessage, Event, User } from '../../types/group';
import { useDrawerProportions } from '../../hooks/useDrawerProportions';
import type { DrawerType } from '../../hooks/useDrawerProportions';
import '../../styles/drawer-animations.css';

interface ContentPanelProps {
    type: 'group' | 'event';
    groupId: number;
    currentUser: User | null;
    
    // Data props
    posts: GroupPost[];
    messages: GroupMessage[];
    events: Event[];
    
    // Posts props
    isLoadingPosts?: boolean;
    commentsByPost?: Record<number, GroupComment[]>;
    showCommentsForPost?: Record<number, boolean>;
    newCommentByPost?: Record<number, string>;
    loadingComments?: Record<number, boolean>;
    
    // Callbacks
    onCreatePost?: (content: string) => Promise<void>;
    onToggleComments?: (postId: number) => Promise<void>;
    onCommentChange?: (postId: number, value: string) => void;
    onCreateComment?: (postId: number, userId: number, username: string) => Promise<void>;
    onSendMessage?: (content: string) => Promise<void>;
    onEventResponse?: (eventId: number, status: string) => Promise<void>;
    onDeleteEvent?: (eventId: number) => Promise<void>;
}

export default function ContentPanel({
    type,
    groupId,
    currentUser,
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
    onDeleteEvent
}: ContentPanelProps) {
    const {
        drawerConfig,
        toggleDrawer,
        getDrawerStyle,
        isDrawerClosed,
        swapWithLarge,
        getConfigStats,
        getOpenDrawersCount
    } = useDrawerProportions();
    
    const [messageInput, setMessageInput] = useState('');

    const handleMessageSend = async (content: string) => {
        if (onSendMessage) {
            await onSendMessage(content);
            setMessageInput('');
        }
    };

    const getDrawerTitle = (drawer: DrawerType) => {
        switch (drawer) {
            case 'posts': return type === 'event' ? 'Posts de l\'événement' : 'Posts du groupe';
            case 'messages': return type === 'event' ? 'Chat événement' : 'Chat du groupe';
            case 'events': return type === 'event' ? 'Sous-événements' : 'Événements du groupe';
        }
    };

    // Composant barre verticale pour tiroir fermé avec nom pivoté
    const ClosedDrawerBar = ({ drawer, count }: { drawer: DrawerType, count: number }) => {
        const title = getDrawerTitle(drawer);
        
        return (
            <button
                onClick={() => toggleDrawer(drawer)}
                className="h-full bg-gray-800 hover:bg-gray-700 border-r border-gray-700 flex flex-col items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{ width: '40px' }}
                title={`Ouvrir ${title}`}
                aria-label={`Ouvrir le panneau ${title}`}
            >
                {/* Texte pivoté verticalement */}
                <div 
                    className="text-gray-300 text-xs font-medium whitespace-nowrap"
                    style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)'
                    }}
                >
                    {title}
                </div>
                
                {/* Compteur en bas */}
                <div className="text-xs text-gray-500 mt-2">
                    {count}
                </div>
            </button>
        );
    };

    // Composant de header cliquable selon les recherches UX + nouvelles règles strictes
    const DrawerHeader = ({ drawer, count }: { drawer: DrawerType, count: number }) => {
        const isClosed = isDrawerClosed(drawer);
        const percentage = drawerConfig[drawer];
        const { largestDrawer, openCount } = getConfigStats();
        const isLargest = largestDrawer.drawer === drawer;
        const canClose = openCount > 1; // Ne peut fermer que s'il y a plus d'1 tiroir ouvert
        const title = getDrawerTitle(drawer);
        
        return (
            <button
                onClick={() => toggleDrawer(drawer)}
                disabled={!canClose && !isClosed} // Empêche de fermer le dernier tiroir
                className={`w-full flex items-center justify-between p-4 transition-colors duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    !canClose && !isClosed 
                        ? 'bg-gray-700 cursor-not-allowed opacity-75' 
                        : 'bg-gray-800 hover:bg-gray-700 focus:bg-gray-700'
                }`}
                aria-expanded={!isClosed}
                aria-controls={`drawer-content-${drawer}`}
                title={
                    !canClose && !isClosed 
                        ? `${title} (impossible de fermer le dernier tiroir)` 
                        : isClosed 
                        ? `Ouvrir ${title}` 
                        : `Fermer ${title}`
                }
            >
                <div className="flex items-center gap-3">
                    {/* Icône état (▶/▼) */}
                    <span className="text-gray-400 text-sm transition-transform duration-200">
                        {isClosed ? '▶' : '▼'}
                    </span>
                    
                    {/* Titre avec indication de pourcentage pour debug */}
                    <h3 className="font-semibold text-white text-sm">
                        {title}
                        <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                    </h3>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Bouton swap (visible si pas le plus grand et pas fermé et plusieurs ouverts) */}
                    {!isClosed && !isLargest && openCount > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                swapWithLarge(drawer);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            title={`Donner le focus à ${title}`}
                            aria-label={`Agrandir le panneau ${title}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    )}
                    
                    {/* Compteur */}
                    <div className="text-xs text-gray-500 min-w-[2rem] text-right">
                        {count}
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="h-full bg-gray-900 flex flex-col">
            {/* Container de tous les tiroirs (ouverts ET fermés) - GARANTIT 100% largeur */}
            <div className="flex-1 flex">
                {/* Posts Drawer - TOUJOURS RENDU */}
                <div 
                    className="drawer-transition border-r border-gray-700 relative flex flex-col"
                    style={getDrawerStyle('posts')}
                >
                    {isDrawerClosed('posts') ? (
                        <ClosedDrawerBar drawer="posts" count={posts?.length || 0} />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="posts" count={posts?.length || 0} />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <PostsList
                                    posts={posts}
                                    isLoading={isLoadingPosts}
                                    commentsByPost={commentsByPost}
                                    showCommentsForPost={showCommentsForPost}
                                    newCommentByPost={newCommentByPost}
                                    loadingComments={loadingComments}
                                    onCreatePost={onCreatePost || (async () => {})}
                                    onToggleComments={onToggleComments || (async () => {})}
                                    onCommentChange={onCommentChange || (() => {})}
                                    onCreateComment={onCreateComment || (async () => {})}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Messages Drawer - TOUJOURS RENDU */}
                <div 
                    className="drawer-transition border-r border-gray-700 relative flex flex-col"
                    style={getDrawerStyle('messages')}
                >
                    {isDrawerClosed('messages') ? (
                        <ClosedDrawerBar drawer="messages" count={messages?.length || 0} />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="messages" count={messages?.length || 0} />
                            </div>
                            
                            {/* Messages scrollables */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <MessagesList messages={messages} />
                            </div>

                            {/* Input de message fixe en bas */}
                            <div className="flex-shrink-0 p-4 border-t border-gray-700">
                                <MessageInput
                                    value={messageInput}
                                    onChange={setMessageInput}
                                    onSend={handleMessageSend}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Events Drawer - TOUJOURS RENDU */}
                <div 
                    className="drawer-transition relative flex flex-col"
                    style={getDrawerStyle('events')}
                >
                    {isDrawerClosed('events') ? (
                        <ClosedDrawerBar drawer="events" count={events?.length || 0} />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="events" count={events?.length || 0} />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <EventsList
                                    events={events}
                                    currentUser={currentUser}
                                    onEventResponse={onEventResponse || (async () => {})}
                                    onDeleteEvent={onDeleteEvent || (async () => {})}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}