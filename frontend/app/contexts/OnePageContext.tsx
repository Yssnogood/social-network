'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Group, Event } from '../types/group';
import { createOrGetPrivateConversation } from '../../services/message';

export type CentralViewType = 'feed' | 'group' | 'event' | 'chat';

export interface SelectedGroup extends Group {
  // Ajout de propriétés spécifiques si nécessaire
}

export interface SelectedEvent extends Event {
  // Ajout de propriétés spécifiques si nécessaire
}

export interface ChatContact {
  id: number;
  username: string;
  avatar_path: string;
  isOnline?: boolean;
  conversationId?: number;
}

interface OnePageContextType {
  // Vue centrale
  centralView: CentralViewType;
  setCentralView: (view: CentralViewType) => void;
  
  // Groupe sélectionné
  selectedGroup: SelectedGroup | null;
  setSelectedGroup: (group: SelectedGroup | null) => void;
  
  // Événement sélectionné
  selectedEvent: SelectedEvent | null;
  setSelectedEvent: (event: SelectedEvent | null) => void;
  
  // Chat dans panneau central
  selectedChatContact: ChatContact | null;
  setSelectedChatContact: (contact: ChatContact | null) => void;
  
  // Chat drawer (gardé pour compatibilité mais deprecated)
  isChatDrawerOpen: boolean;
  openChatDrawer: (contact: ChatContact) => void;
  closeChatDrawer: () => void;
  
  // Navigation helpers
  navigateToGroup: (group: SelectedGroup) => void;
  navigateToEvent: (event: SelectedEvent) => void;
  navigateToFeed: () => void;
  navigateToChat: (contact: ChatContact) => void;
  
  // Callback pour recharger les conversations du ChatPanel
  onConversationCreated: ((contact: ChatContact) => void) | null;
  setOnConversationCreated: (callback: ((contact: ChatContact) => void) | null) => void;
}

const OnePageContext = createContext<OnePageContextType | undefined>(undefined);

export function OnePageProvider({ children }: { children: React.ReactNode }) {
  const [centralView, setCentralView] = useState<CentralViewType>('feed');
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [selectedChatContact, setSelectedChatContact] = useState<ChatContact | null>(null);
  const [onConversationCreated, setOnConversationCreated] = useState<((contact: ChatContact) => void) | null>(null);

  const openChatDrawer = useCallback((contact: ChatContact) => {
    setSelectedChatContact(contact);
    setIsChatDrawerOpen(true);
  }, []);

  const closeChatDrawer = useCallback(() => {
    setIsChatDrawerOpen(false);
    setSelectedChatContact(null);
  }, []);

  const navigateToGroup = useCallback((group: SelectedGroup) => {
    setSelectedGroup(group);
    setSelectedEvent(null);
    setCentralView('group');
  }, []);

  const navigateToEvent = useCallback((event: SelectedEvent) => {
    setSelectedEvent(event);
    setSelectedGroup(null);
    setCentralView('event');
  }, []);

  const navigateToFeed = useCallback(() => {
    setSelectedGroup(null);
    setSelectedEvent(null);
    setSelectedChatContact(null);
    setCentralView('feed');
  }, []);

  const navigateToChat = useCallback(async (contact: ChatContact) => {
    try {
      let isNewConversation = false;
      
      // Si pas de conversationId, créer/récupérer la conversation
      if (!contact.conversationId) {
        console.log(`Creating conversation with user ${contact.id}`);
        const conversation = await createOrGetPrivateConversation(contact.id);
        contact.conversationId = conversation.id;
        console.log(`Conversation created/retrieved with ID: ${conversation.id}`);
        isNewConversation = true;
      }

      setSelectedChatContact(contact);
      setSelectedGroup(null);
      setSelectedEvent(null);
      setCentralView('chat');
      
      // Notifier le ChatPanel qu'une nouvelle conversation a été créée
      if (onConversationCreated && isNewConversation) {
        // Si c'était une nouvelle conversation, passer le contact
        onConversationCreated(contact);
      }
    } catch (error) {
      console.error('Error navigating to chat:', error);
      // Même en cas d'erreur, on peut essayer d'ouvrir le chat sans conversationId
      // L'utilisateur verra un message d'erreur approprié
      setSelectedChatContact(contact);
      setSelectedGroup(null);
      setSelectedEvent(null);
      setCentralView('chat');
    }
  }, []);

  const value: OnePageContextType = {
    centralView,
    setCentralView,
    selectedGroup,
    setSelectedGroup,
    selectedEvent,
    setSelectedEvent,
    selectedChatContact,
    setSelectedChatContact,
    isChatDrawerOpen,
    openChatDrawer,
    closeChatDrawer,
    navigateToGroup,
    navigateToEvent,
    navigateToFeed,
    navigateToChat,
    onConversationCreated,
    setOnConversationCreated
  };

  return (
    <OnePageContext.Provider value={value}>
      {children}
    </OnePageContext.Provider>
  );
}

export function useOnePage() {
  const context = useContext(OnePageContext);
  if (context === undefined) {
    throw new Error('useOnePage must be used within a OnePageProvider');
  }
  return context;
}