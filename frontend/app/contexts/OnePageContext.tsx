'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Group, Event } from '../types/group';

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
}

const OnePageContext = createContext<OnePageContextType | undefined>(undefined);

export function OnePageProvider({ children }: { children: React.ReactNode }) {
  const [centralView, setCentralView] = useState<CentralViewType>('feed');
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [selectedChatContact, setSelectedChatContact] = useState<ChatContact | null>(null);

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

  const navigateToChat = useCallback((contact: ChatContact) => {
    setSelectedChatContact(contact);
    setSelectedGroup(null);
    setSelectedEvent(null);
    setCentralView('chat');
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
    navigateToChat
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