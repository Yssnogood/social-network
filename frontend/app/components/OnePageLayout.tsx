'use client';

import React from 'react';
import { useOnePage } from '../contexts/OnePageContext';
import Header from './Header';
import ChatPanel from './ChatPanel';
import UsersListPanel from './UsersListPanel';
import GroupsPanel from './GroupsPanel';
import EventsPanel from './EventsPanel';
import ChatDrawer from './ChatDrawer';
import PostsList from './PostsList';
import GroupView from './GroupView';
import EventView from './EventView';
import ChatView from './ChatView';

interface OnePageLayoutProps {
  children?: React.ReactNode;
  username?: string;
  notifications: any[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  // Props pour le feed
  posts: any[];
  isLoading: boolean;
  jwt: string;
  // Props pour le bouton de création de post
  onOpenPostModal?: () => void;
}

export default function OnePageLayout({
  username,
  notifications,
  showNotifications,
  onToggleNotifications,
  posts,
  isLoading,
  jwt,
  onOpenPostModal
}: OnePageLayoutProps) {
  const { centralView, selectedGroup, selectedEvent, selectedChatContact } = useOnePage();

  const renderCentralView = () => {
    switch (centralView) {
      case 'group':
        return selectedGroup ? (
          <GroupView groupId={selectedGroup.id} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Sélectionnez un groupe
          </div>
        );
      
      case 'event':
        return selectedEvent ? (
          <EventView event={selectedEvent} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Sélectionnez un événement
          </div>
        );
      
      case 'chat':
        return selectedChatContact ? (
          <ChatView contact={selectedChatContact} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Sélectionnez un contact pour démarrer une conversation
          </div>
        );
      
      default: // 'feed'
        return (
          <div className="h-full overflow-y-auto">
            {/* Bouton de création de post intégré dans le feed */}
            {onOpenPostModal && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <button
                  onClick={onOpenPostModal}
                  className="w-full p-4 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Qu'avez-vous en tête, {username}?</span>
                  </div>
                </button>
              </div>
            )}
            <PostsList
              posts={posts}
              isLoading={isLoading}
              jwt={jwt}
              onlineUser={username}
            />
          </div>
        );
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-900 text-white">
      <Header
        username={username}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={onToggleNotifications}
      />
      
      {/* Layout 5 colonnes - Responsive avec hauteur calculée */}
      <div className="flex h-[calc(100vh-3rem)] mt-12">
        {/* Colonne gauche - Chat et Users */}
        <div className="hidden lg:flex w-64 xl:w-80 bg-gray-800 border-r border-gray-700 flex-col">
          {/* Chat Panel - Moitié supérieure */}
          <div className="h-1/2 border-b border-gray-700 overflow-hidden">
            <ChatPanel />
          </div>
          
          {/* Users List Panel - Moitié inférieure */}
          <div className="h-1/2 overflow-hidden">
            <UsersListPanel />
          </div>
        </div>

        {/* Colonne centrale - Contenu dynamique */}
        <div className="flex-1 bg-gray-900 overflow-hidden">
          <div className="h-full p-2 sm:p-4">
            {renderCentralView()}
          </div>
        </div>

        {/* Colonne droite - Groupes et Événements */}
        <div className="hidden lg:flex w-64 xl:w-80 bg-gray-800 border-l border-gray-700 flex-col">
          {/* Groups Panel - Moitié supérieure */}
          <div className="h-1/2 border-b border-gray-700 overflow-hidden">
            <GroupsPanel />
          </div>
          
          {/* Events Panel - Moitié inférieure */}
          <div className="h-1/2 overflow-hidden">
            <EventsPanel />
          </div>
        </div>
      </div>

      {/* Navigation mobile - Affichée uniquement sur mobile/tablette */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 z-40">
        <div className="flex justify-around items-center">
          <button
            onClick={() => {/* TODO: Ouvrir panneau chat mobile */}}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs mt-1">Chat</span>
          </button>
          
          <button
            onClick={() => {/* TODO: Ouvrir panneau utilisateurs mobile */}}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-xs mt-1">Users</span>
          </button>
          
          <button
            onClick={() => {/* TODO: Ouvrir panneau groupes mobile */}}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs mt-1">Groupes</span>
          </button>
          
          <button
            onClick={() => {/* TODO: Ouvrir panneau événements mobile */}}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
            </svg>
            <span className="text-xs mt-1">Events</span>
          </button>
        </div>
      </div>

      {/* Chat Drawer */}
      <ChatDrawer />
    </div>
  );
}