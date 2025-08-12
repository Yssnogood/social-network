'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  sendMessage, 
  Message,
  SendMessageRequest 
} from '../../../services/message';
import { fetchMessages } from '../../../services/contact';
import { getCurrentUserId } from '../../../services/auth';
import UnifiedMessagePanel, { type UnifiedMessage, type HeaderConfig, type HeightConfig } from '../unified/UnifiedMessagePanel';

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
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

  // Fonction compatible avec UnifiedMessagePanel
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !contact.conversationId) return;

    const tempId = Date.now();
    
    try {
      // Message temporaire pour feedback instantané
      const tempMessage: Message = {
        id: tempId,
        conversation_id: contact.conversationId,
        sender_id: Number(currentUserId || 1),
        receiver_id: contact.id,
        content: content,
        created_at: new Date().toISOString()
      };

      // Ajouter immédiatement à l'affichage
      setMessages(prev => [...prev, tempMessage]);

      // Envoyer via WebSocket si disponible
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const wsMessage = {
          type: "message_send",
          sender_id: Number(currentUserId),
          receiver_id: contact.id,
          content: content,
        };
        wsRef.current.send(JSON.stringify(wsMessage));
      }

      // Envoyer aussi via API pour persistance
      const messageData: SendMessageRequest = {
        conversation_id: contact.conversationId,
        sender_id: currentUserId || 1,
        receiver_id: contact.id,
        content: content
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
      throw error; // Re-throw pour que UnifiedMessagePanel gère l'erreur
    }
  };

  return (
    <UnifiedMessagePanel
      messages={(messages || []).map((msg): UnifiedMessage => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        conversation_id: msg.conversation_id
      }))}
      onSendMessage={handleSendMessage}
      placeholder={`Écrivez un message à ${contact.username}...`}
      headerConfig={{
        type: 'contact',
        contact: {
          id: contact.id,
          username: contact.username,
          avatar_path: contact.avatar_path,
          isOnline: contact.isOnline
        },
        showOnlineStatus: true
      }}
      heightConfig={{
        mode: 'flexible'
      }}
      isLoading={isLoading}
      className=""
    />
  );
}