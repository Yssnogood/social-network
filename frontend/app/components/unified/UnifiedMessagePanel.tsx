'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatMessageTime, formatMessageDate } from '../../../services/message';
import { getCurrentUserId } from '../../../services/auth';

// Type unifié pour tous les contextes de messages
export interface UnifiedMessage {
  id: number;
  content: string;
  created_at: string;
  // Champs utilisateur (gère les différences sender_id/user_id)
  user_id?: number;        // Pour groups/events
  sender_id?: number;      // Pour messages privés  
  username?: string;       // Pour groups/events (optionnel pour privé)
  // Champs contexte
  conversation_id?: number; // Pour messages privés
  event_id?: number;       // Pour events
  group_id?: number;       // Pour groups
  receiver_id?: number;    // Pour messages privés uniquement
}

// Configuration du header contextuel
export interface HeaderConfig {
  type: 'contact' | 'simple' | 'none';
  contact?: {
    id: number;
    username: string;
    avatar_path: string;
    isOnline?: boolean;
  };
  title?: string;
  showOnlineStatus?: boolean;
}

// Configuration de la hauteur responsive
export interface HeightConfig {
  mode: 'fixed' | 'flexible' | 'viewport-relative';
  fixedHeight?: string; // ex: "h-96"
  viewportRatio?: string; // ex: "h-1/2"
}

interface UnifiedMessagePanelProps {
  messages: UnifiedMessage[];
  onSendMessage: (content: string) => Promise<void>;
  placeholder?: string;
  headerConfig?: HeaderConfig;
  heightConfig?: HeightConfig;
  isLoading?: boolean;
  className?: string;
}

export default function UnifiedMessagePanel({
  messages,
  onSendMessage,
  placeholder = "Écrivez un message...",
  headerConfig = { type: 'simple', title: 'Messages' },
  heightConfig = { mode: 'flexible' },
  isLoading = false,
  className = ""
}: UnifiedMessagePanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Récupérer l'ID de l'utilisateur actuel
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await getCurrentUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error getting current user ID:', error);
        setCurrentUserId(null);
      }
    };

    fetchUserId();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    
    try {
      setIsSending(true);
      await onSendMessage(messageContent);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Trier les messages par date (chronologique)
  const sortedMessages = messages ? [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) : [];

  // Fonction unifiée pour identifier si le message appartient à l'utilisateur actuel
  const isCurrentUserMessage = (message: UnifiedMessage): boolean => {
    if (!currentUserId) return false;
    // Gère les deux conventions : sender_id (privé) ou user_id (groups/events)
    const messageUserId = message.sender_id || message.user_id;
    return Number(messageUserId) === Number(currentUserId);
  };

  // Générer les classes CSS pour la hauteur responsive
  const getHeightClasses = (): string => {
    switch (heightConfig.mode) {
      case 'fixed':
        return heightConfig.fixedHeight || 'h-96';
      case 'viewport-relative':
        return heightConfig.viewportRatio || 'h-1/2';
      case 'flexible':
      default:
        return 'h-full';
    }
  };

  return (
    <div className={`${getHeightClasses()} flex flex-col bg-gray-800 ${className}`}>
      {/* Header contextuel */}
      {headerConfig.type !== 'none' && (
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          {headerConfig.type === 'contact' && headerConfig.contact ? (
            // Header pour chat privé (comme PrivateChatContent)
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {headerConfig.contact.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                {headerConfig.showOnlineStatus && headerConfig.contact.isOnline && (
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-gray-900"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">{headerConfig.contact.username}</h3>
                {headerConfig.showOnlineStatus && (
                  <p className="text-xs text-gray-400">
                    {headerConfig.contact.isOnline ? 'En ligne' : 'Hors ligne'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Header simple pour groups/events
            <h3 className="text-lg font-semibold text-white">{headerConfig.title}</h3>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg mb-2">Aucun message</p>
            <p className="text-sm">Commencez la conversation !</p>
          </div>
        ) : (
          <>
            {sortedMessages.map((message, index) => {
              const isCurrentUser = isCurrentUserMessage(message);
              const showDateSeparator = index === 0 || 
                formatMessageDate(sortedMessages[index - 1].created_at) !== formatMessageDate(message.created_at);

              // Déterminer le nom d'affichage de l'utilisateur
              const displayUsername = message.username || 
                (headerConfig.type === 'contact' ? headerConfig.contact?.username : 'Utilisateur');

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center mb-4">
                      <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                        {formatMessageDate(message.created_at)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`max-w-xs lg:max-w-md ${
                      isCurrentUser 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-gray-600 text-white mr-auto'
                    } rounded-lg px-4 py-2`}>
                      {/* Nom de l'utilisateur (sauf pour l'utilisateur actuel ou chat privé) */}
                      {!isCurrentUser && headerConfig.type !== 'contact' && displayUsername && (
                        <p className="text-xs text-gray-300 mb-1 font-medium">
                          {displayUsername}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-200' : 'text-gray-300'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={placeholder}
              disabled={isSending}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}