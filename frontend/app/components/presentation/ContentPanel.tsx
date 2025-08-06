'use client';

import { useState } from 'react';
import PostsList from '../groupComponent/PostsList';
import MessagesList from '../groupComponent/MessagesList';
import EventsList from '../groupComponent/EventsList';
import MessageInput from '../groupComponent/MessageInput';
import { GroupPost, GroupComment, GroupMessage, Event, User } from '../../types/group';
import { useDrawerProportions } from '../../hooks/useDrawerProportions';
import ProportionControls from './ProportionControls';
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
        getDrawerWidth,
        isDrawerClosed,
        swapProportions,
        resetToEqual,
        maximizeDrawer
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

    return (
        <div className="h-full bg-gray-900 flex flex-col">
            {/* Contrôles de proportions */}
            <div className="flex-shrink-0 p-2 border-b border-gray-700 proportion-controls-enter">
                <ProportionControls
                    drawerConfig={drawerConfig}
                    onSwapProportions={swapProportions}
                    onResetToEqual={resetToEqual}
                    onMaximizeDrawer={maximizeDrawer}
                />
            </div>

            {/* Drawers container */}
            <div className="flex-1 flex">
                {/* Posts Drawer */}
            <div className={`${getDrawerWidth(drawerConfig.posts)} drawer-transition border-r border-gray-700 relative`}>
                {isDrawerClosed('posts') ? (
                    /* Tab vertical pour drawer fermé */
                    <div 
                        className="h-full w-12 bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => toggleDrawer('posts')}
                    >
                        <div className="drawer-tab-vertical whitespace-nowrap text-sm font-medium text-gray-300">
                            Posts
                        </div>
                    </div>
                ) : (
                    /* Contenu du drawer Posts */
                    <div className="h-full flex flex-col">
                        {/* Header du drawer */}
                        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 drawer-header">
                            <h3 className="font-semibold text-white text-sm">{getDrawerTitle('posts')}</h3>
                            <div className="flex items-center gap-2">
                                {/* Bouton de redimensionnement */}
                                {drawerConfig.posts !== '3/3' && (
                                    <button
                                        onClick={() => toggleDrawer('posts')}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                        title="Agrandir"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4m-4 0l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                        </svg>
                                    </button>
                                )}
                                <div className="text-xs text-gray-500">{posts.length}</div>
                            </div>
                        </div>
                        
                        {/* Contenu scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 drawer-content-fade-in">
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
                    </div>
                )}
            </div>

            {/* Messages Drawer */}
            <div className={`${getDrawerWidth(drawerConfig.messages)} drawer-transition border-r border-gray-700 relative`}>
                {isDrawerClosed('messages') ? (
                    /* Tab vertical pour drawer fermé */
                    <div 
                        className="h-full w-12 bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => toggleDrawer('messages')}
                    >
                        <div className="drawer-tab-vertical whitespace-nowrap text-sm font-medium text-gray-300">
                            Messages
                        </div>
                    </div>
                ) : (
                    /* Contenu du drawer Messages */
                    <div className="h-full flex flex-col">
                        {/* Header du drawer */}
                        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 drawer-header">
                            <h3 className="font-semibold text-white text-sm">{getDrawerTitle('messages')}</h3>
                            <div className="flex items-center gap-2">
                                {drawerConfig.messages !== '3/3' && (
                                    <button
                                        onClick={() => toggleDrawer('messages')}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                        title="Agrandir"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4m-4 0l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                        </svg>
                                    </button>
                                )}
                                <div className="text-xs text-gray-500">{messages.length}</div>
                            </div>
                        </div>
                        
                        {/* Messages scrollables */}
                        <div className="flex-1 overflow-y-auto p-4 drawer-content-fade-in">
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
                    </div>
                )}
            </div>

            {/* Events Drawer */}
            <div className={`${getDrawerWidth(drawerConfig.events)} drawer-transition relative`}>
                {isDrawerClosed('events') ? (
                    /* Tab vertical pour drawer fermé */
                    <div 
                        className="h-full w-12 bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => toggleDrawer('events')}
                    >
                        <div className="drawer-tab-vertical whitespace-nowrap text-sm font-medium text-gray-300">
                            {type === 'event' ? 'Sous-événements' : 'Événements'}
                        </div>
                    </div>
                ) : (
                    /* Contenu du drawer Events */
                    <div className="h-full flex flex-col">
                        {/* Header du drawer */}
                        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 drawer-header">
                            <h3 className="font-semibold text-white text-sm">{getDrawerTitle('events')}</h3>
                            <div className="flex items-center gap-2">
                                {drawerConfig.events !== '3/3' && (
                                    <button
                                        onClick={() => toggleDrawer('events')}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                        title="Agrandir"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4m-4 0l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                        </svg>
                                    </button>
                                )}
                                <div className="text-xs text-gray-500">{events.length}</div>
                            </div>
                        </div>
                        
                        {/* Contenu scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 drawer-content-fade-in">
                            <EventsList
                                events={events}
                                currentUser={currentUser}
                                onEventResponse={onEventResponse || (async () => {})}
                                onDeleteEvent={onDeleteEvent || (async () => {})}
                            />
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}