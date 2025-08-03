'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useOnePage } from '../contexts/OnePageContext';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_username: string;
  created_at: string;
}

interface ChatViewProps {
  contact: {
    id: number;
    username: string;
    avatar_path: string;
    isOnline?: boolean;
  };
}

export default function ChatView({ contact }: ChatViewProps) {
  const { navigateToFeed } = useOnePage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // TODO: Load messages from API
  useEffect(() => {
    // Simuler le chargement des messages
    setIsLoading(true);
    
    // Simuler des messages pour le développement
    const mockMessages: Message[] = [
      {
        id: 1,
        content: 'Salut ! Comment ça va ?',
        sender_id: contact.id,
        sender_username: contact.username,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        content: 'Ça va bien, merci ! Et toi ?',
        sender_id: 1, // Current user
        sender_username: 'Moi',
        created_at: new Date(Date.now() - 3000000).toISOString()
      },
      {
        id: 3,
        content: 'Super ! Tu as vu le dernier post sur les mangas ?',
        sender_id: contact.id,
        sender_username: contact.username,
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    setTimeout(() => {
      setMessages(mockMessages);
      setIsLoading(false);
    }, 500);
  }, [contact.id, contact.username]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // TODO: Send message via API
    const message: Message = {
      id: Date.now(),
      content: newMessage,
      sender_id: 1, // Current user ID
      sender_username: 'Moi',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={navigateToFeed}
            className="mr-3 p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Retour au feed"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400 hover:text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative mr-3">
            <Image 
              src={contact.avatar_path || '/defaultPP.webp'} 
              alt={contact.username} 
              width={40} 
              height={40} 
              className="rounded-full object-cover" 
            />
            {contact.isOnline && (
              <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-gray-800"></div>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-white">{contact.username}</h2>
            <p className="text-sm text-gray-400">
              {contact.isOnline ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Options du chat */}
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400 hover:text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
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
            <p className="text-sm">Commencez votre conversation avec {contact.username}</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = message.sender_id === 1; // TODO: Use real current user ID
              const showDateSeparator = index === 0 || 
                formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center mb-4">
                      <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`max-w-xs lg:max-w-md ${
                      isCurrentUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-100'
                    } rounded-lg px-4 py-2`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {formatTime(message.created_at)}
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
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Écrivez un message à ${contact.username}...`}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Attach button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-600 rounded"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-400 hover:text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}