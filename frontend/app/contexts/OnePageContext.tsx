'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Group, Event } from '../types/group';
import { createOrGetPrivateConversation } from '../../services/message';

export type CentralViewType = 'feed' | 'group' | 'event' | 'chat' | 'group-editor' | 'event-editor' | 'group-presentation' | 'event-presentation' | 'profile';

export interface SelectedGroup extends Group {
  // Ajout de propriétés spécifiques si nécessaire
}

export interface SelectedEvent extends Event {
  // Ajout de propriétés spécifiques si nécessaire
}

export interface SelectedProfile {
  username: string;
  userId: number;
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
  
  // Profil sélectionné
  selectedProfile: SelectedProfile | null;
  setSelectedProfile: (profile: SelectedProfile | null) => void;
  
  // Chat dans panneau central
  selectedChatContact: ChatContact | null;
  setSelectedChatContact: (contact: ChatContact | null) => void;
  
  // Chat drawer (gardé pour compatibilité mais deprecated)
  isChatDrawerOpen: boolean;
  openChatDrawer: (contact: ChatContact) => void;
  closeChatDrawer: () => void;
  
  // SlideDrawer states
  isSlideDrawerOpen: boolean;
  slideDrawerContent: 'private-chat' | 'event-details' | null;
  slideDrawerDirection: 'left' | 'right';
  slideDrawerProps: any;
  openSlideDrawer: (content: 'private-chat' | 'event-details', direction: 'left' | 'right', props?: any) => void;
  closeSlideDrawer: () => void;
  
  // Navigation helpers
  navigateToGroup: (group: SelectedGroup) => void;
  navigateToEvent: (event: SelectedEvent) => void;
  navigateToFeed: () => void;
  navigateToChat: (contact: ChatContact) => void;
  navigateToProfile: (profile: SelectedProfile) => void;
  
  // Navigation vers les éditeurs et présentations
  navigateToGroupEditor: () => void;
  navigateToEventEditor: () => void;
  navigateToGroupPresentation: (group: SelectedGroup) => void;
  navigateToEventPresentation: (event: SelectedEvent) => void;
  
  // Callback pour recharger les conversations du ChatPanel
  onConversationCreated: ((contact: ChatContact) => void) | null;
  setOnConversationCreated: (callback: ((contact: ChatContact) => void) | null) => void;
}

const OnePageContext = createContext<OnePageContextType | undefined>(undefined);

export function OnePageProvider({ children }: { children: React.ReactNode }) {
  const [centralView, setCentralView] = useState<CentralViewType>('feed');
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<SelectedProfile | null>(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [selectedChatContact, setSelectedChatContact] = useState<ChatContact | null>(null);
  const [onConversationCreated, setOnConversationCreated] = useState<((contact: ChatContact) => void) | null>(null);
  
  // SlideDrawer states
  const [isSlideDrawerOpen, setIsSlideDrawerOpen] = useState(false);
  const [slideDrawerContent, setSlideDrawerContent] = useState<'private-chat' | 'event-details' | null>(null);
  const [slideDrawerDirection, setSlideDrawerDirection] = useState<'left' | 'right'>('left');
  const [slideDrawerProps, setSlideDrawerProps] = useState<any>(null);

  const openChatDrawer = useCallback((contact: ChatContact) => {
    setSelectedChatContact(contact);
    setIsChatDrawerOpen(true);
  }, []);

  const closeChatDrawer = useCallback(() => {
    setIsChatDrawerOpen(false);
    setSelectedChatContact(null);
  }, []);

  // SlideDrawer methods
  const openSlideDrawer = useCallback((
    content: 'private-chat' | 'event-details', 
    direction: 'left' | 'right', 
    props?: any
  ) => {
    setSlideDrawerContent(content);
    setSlideDrawerDirection(direction);
    setSlideDrawerProps(props || null);
    setIsSlideDrawerOpen(true);
  }, []);

  const closeSlideDrawer = useCallback(() => {
    setIsSlideDrawerOpen(false);
    setSlideDrawerContent(null);
    setSlideDrawerProps(null);
  }, []);

  const navigateToGroup = useCallback((group: SelectedGroup) => {
    setSelectedGroup(group);
    setSelectedEvent(null);
    setCentralView('group-presentation');  // Utiliser la nouvelle vue unifiée
  }, []);

  const navigateToEvent = useCallback((event: SelectedEvent) => {
    setSelectedEvent(event);
    setSelectedGroup(null);
    setCentralView('event-presentation');  // Utiliser la nouvelle vue unifiée
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

      // Ouvrir le SlideDrawer au lieu du panneau central
      openSlideDrawer('private-chat', 'left', { contact });
      
      // Notifier le ChatPanel qu'une nouvelle conversation a été créée
      if (onConversationCreated && isNewConversation) {
        onConversationCreated(contact);
      }
    } catch (error) {
      console.error('Error navigating to chat:', error);
      // Même en cas d'erreur, ouvrir le SlideDrawer
      openSlideDrawer('private-chat', 'left', { contact });
    }
  }, [openSlideDrawer, onConversationCreated]);

  const navigateToProfile = useCallback((profile: SelectedProfile) => {
    setSelectedProfile(profile);
    setSelectedGroup(null);
    setSelectedEvent(null);
    setSelectedChatContact(null);
    setCentralView('profile');
  }, []);

  const navigateToGroupEditor = useCallback(() => {
    setSelectedGroup(null);
    setSelectedEvent(null);
    setSelectedChatContact(null);
    setCentralView('group-editor');
  }, []);

  const navigateToEventEditor = useCallback(() => {
    setSelectedGroup(null);
    setSelectedEvent(null);
    setSelectedChatContact(null);
    setCentralView('event-editor');
  }, []);

  const navigateToGroupPresentation = useCallback((group: SelectedGroup) => {
    setSelectedGroup(group);
    setSelectedEvent(null);
    setSelectedChatContact(null);
    setCentralView('group-presentation');
  }, []);

  const navigateToEventPresentation = useCallback((event: SelectedEvent) => {
    setSelectedEvent(event);
    setSelectedGroup(null);
    setSelectedChatContact(null);
    setCentralView('event-presentation');
  }, []);

  const value: OnePageContextType = {
    centralView,
    setCentralView,
    selectedGroup,
    setSelectedGroup,
    selectedEvent,
    setSelectedEvent,
    selectedProfile,
    setSelectedProfile,
    selectedChatContact,
    setSelectedChatContact,
    isChatDrawerOpen,
    openChatDrawer,
    closeChatDrawer,
    // SlideDrawer
    isSlideDrawerOpen,
    slideDrawerContent,
    slideDrawerDirection,
    slideDrawerProps,
    openSlideDrawer,
    closeSlideDrawer,
    // Navigation
    navigateToGroup,
    navigateToEvent,
    navigateToFeed,
    navigateToChat,
    navigateToProfile,
    navigateToGroupEditor,
    navigateToEventEditor,
    navigateToGroupPresentation,
    navigateToEventPresentation,
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