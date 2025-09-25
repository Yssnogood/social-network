"use client";
import React, { createContext, useContext, ReactNode, useState,useCallback, useEffect, useRef } from 'react';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';
import { Notification } from '../components/Header';
import { useCookies } from 'next-client-cookies';

interface WebSocketContextType {
    sendMessage: (message: any) => void;

    isConnected: boolean;

    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;

    messages: any[];
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;

    selectedContact: any;
    setSelectedContact: React.Dispatch<React.SetStateAction<any>>;

    updateNeeded: boolean;
    setUpdateNeeded: React.Dispatch<React.SetStateAction<boolean>>;

    ws: React.RefObject<WebSocket | null>;
    clearUserData: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
    children
}) => {
    const cookies = useCookies();
    const [messages,setMessages] = useState<any[]>([]);
    const [updateNeeded,setUpdateNeeded] = useState<boolean>(true);
    const [notifications,setNotifications] = useState<Notification[]>([]);
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const token = cookies.get("jwt");
    const selectedContactRef = useRef(selectedContact);

    useEffect(() => {
        selectedContactRef.current = selectedContact;
    }, [selectedContact]);

    const onNewNotification = useCallback((notification: Notification) => {
  setNotifications(prev => [notification, ...prev]);
}, []);

    const onNewMessage = useCallback((message: any) => {
  const contact = selectedContactRef.current;
  if (contact && (message.sender_id === contact.id || message.receiver_id === contact.id)) {
    setMessages(prev => [...prev, message]);
  }
  setUpdateNeeded(prev => !prev)
}, []);

    const { sendMessage, isConnected, ws, disconnect } = useNotificationWebSocket(
        onNewNotification,
        onNewMessage,
        token
    );
    const clearUserData = useCallback(() => {
        setNotifications([]);
        setMessages([]);
        setSelectedContact(null);
        setUpdateNeeded(true);
        disconnect();
    }, [disconnect]);

    return (
        <WebSocketContext.Provider value={{ sendMessage, isConnected,ws,notifications,setMessages,setNotifications,messages,selectedContact,setSelectedContact, updateNeeded, setUpdateNeeded,clearUserData
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};



export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context.ws;
};

export const useMessages = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return ({messages: context.messages,setMessages:context.setMessages,ws:context.ws, updateNeeded: context.updateNeeded, setUpdateNeeded: context.setUpdateNeeded});
}

export const useNotifications = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return ({notifications: context.notifications,setNotifications:context.setNotifications});
}

export const useContact = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return ({selectedContact: context.selectedContact,setSelectedContact:context.setSelectedContact});
}

export const useWebSocketClear = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketClear must be used within a WebSocketProvider');
    }
    return context.clearUserData;
}

