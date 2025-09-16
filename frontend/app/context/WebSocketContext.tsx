import React, { createContext, useContext, ReactNode } from 'react';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';
import { Notification } from '../components/Header';

interface WebSocketContextType {
    sendMessage: (message: any) => void;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
    children: ReactNode;
    onNewNotification: (notification: Notification) => void;
    onNewMessage?: (message: any) => void;
    token?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
    children,
    onNewNotification,
    onNewMessage,
    token
}) => {
    const { sendMessage, isConnected } = useNotificationWebSocket(
        onNewNotification,
        onNewMessage,
        token
    );

    return (
        <WebSocketContext.Provider value={{ sendMessage, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
