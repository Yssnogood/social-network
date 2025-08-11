'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  sendMessage, 
  formatMessageTime,
  formatMessageDate,
  Message,
  SendMessageRequest 
} from '../../../services/message';
import { fetchMessages } from '../../../services/contact';
import { getCurrentUserId } from '../../../services/auth';

interface PrivateChatContentProps {
  contact: {
    id: number;
    username: string;
    avatar_path: string;
    isOnline?: boolean;
    conversationId?: number;
  };
}

export default function PrivateChatContent({ contact }: PrivateChatContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

  // WebSocket pour temps réel
  useEffect(() => {
    if (!currentUserId || !contact.id) return;

    const ws = new WebSocket("ws://localhost:8090/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connection opened for private chat");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // Filtrer les messages pour cette conversation seulement
        if (msg.sender_id === contact.id || msg.receiver_id === contact.id) {
          setMessages((prev) => {
            // Éviter les doublons
            if (prev.some(existingMsg => existingMsg.id === msg.id)) {
              return prev;
            }
            return [...prev, msg];
          });
        }
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    ws.onerror = (event) => {
      console.error("❌ WebSocket error:", event);
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket closed:", event);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [currentUserId, contact.id]);

  // Charger les messages de la conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!contact.conversationId) {
        console.warn('No conversation ID provided for contact:', contact.username);
        return;
      }

      try {
        setIsLoading(true);
        const messagesData = await fetchMessages(contact.conversationId);
        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [contact.conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !contact.conversationId) return;

    const tempId = Date.now();
    const messageContent = newMessage.trim();
    
    try {
      // Message temporaire pour feedback instantané
      const tempMessage: Message = {
        id: tempId,
        conversation_id: contact.conversationId,
        sender_id: Number(currentUserId || 1),
        receiver_id: contact.id,
        content: messageContent,
        created_at: new Date().toISOString()
      };

      // Ajouter immédiatement à l'affichage
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Envoyer via WebSocket si disponible
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const wsMessage = {
          type: "message_send",
          sender_id: Number(currentUserId),
          receiver_id: contact.id,
          content: messageContent,
        };
        wsRef.current.send(JSON.stringify(wsMessage));
      }

      // Envoyer aussi via API pour persistance
      const messageData: SendMessageRequest = {
        conversation_id: contact.conversationId,
        sender_id: currentUserId || 1,
        receiver_id: contact.id,
        content: messageContent
      };

      const sentMessage = await sendMessage(messageData);
      
      // Remplacer le message temporaire par le vrai message du serveur
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? sentMessage : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // En cas d'erreur, supprimer le message temporaire
      setMessages(prev => 
        prev.filter(msg => msg.id !== tempId)
      );
      // Remettre le texte dans l'input
      setNewMessage(messageContent);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Contact Info Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center">
          <div className="relative mr-3">
            <Image 
              src={contact.avatar_path || '/defaultPP.webp'} 
              alt={contact.username} 
              width={40} 
              height={40} 
              className="rounded-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/defaultPP.webp';
              }}
            />
            {contact.isOnline && (
              <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-gray-900"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-white">{contact.username}</h3>
            <p className="text-xs text-gray-400">
              {contact.isOnline ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>
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
              const isCurrentUser = Number(message.sender_id) === Number(currentUserId);
              const showDateSeparator = index === 0 || 
                formatMessageDate(messages[index - 1].created_at) !== formatMessageDate(message.created_at);

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
              placeholder={`Écrivez un message à ${contact.username}...`}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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