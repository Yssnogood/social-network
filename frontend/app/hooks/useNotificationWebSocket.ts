import { useEffect, useRef } from 'react';
import { Notification } from '../components/Header';

interface WebSocketMessage {
    type: string;
    data?: any;
    [key: string]: any;
}

export const useNotificationWebSocket = (
    onNewNotification: (notification: Notification) => void,
    onNewMessage?: (message: any) => void,
    token?: string
) => {
    const ws = useRef<WebSocket | null>(null);
    const shouldReconnect = useRef(true);

    useEffect(() => {
        if (!token) return;
        shouldReconnect.current = true;

        const connectWebSocket = () => {
            if (!shouldReconnect.current) return;
            ws.current = new WebSocket(`ws://localhost:8080/ws`);

            ws.current.onopen = () => {
                console.log("✅ Global WebSocket connected");
            };

            ws.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    console.log("📨 WebSocket message received:", message);
                    
                    // Traiter les notifications
                    if (message.type === "notification") {
                        onNewNotification(message.data);
                        console.log("🔔 New notification processed:", message.data);
                    }
                    // Traiter les messages de chat
                    else if (message.type === "message_received" && onNewMessage) {
                        onNewMessage(message);
                    }
                    // Autres types de messages (connexion, etc.)
                    else {
                        console.log("� Other WebSocket message:", message);
                    }
                } catch (err) {
                    console.error("❌ Error parsing WebSocket message:", err);
                }
            };

            ws.current.onerror = (err) => {
                console.error("❌ Global WebSocket error:", err);
            };

            ws.current.onclose = () => {
                console.log("🔌 Global WebSocket disconnected");
                // Reconnection automatique après 3 secondes seulement si pas fermé manuellement
                if (shouldReconnect.current) {
                    setTimeout(connectWebSocket, 3000);
                }
            };
        };

        connectWebSocket();

        return () => {
            shouldReconnect.current = false;
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [token, onNewNotification, onNewMessage]);

    // Méthode pour envoyer des messages
    const sendMessage = (message: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };

    const disconnect = () => {
        shouldReconnect.current = false;
        if (ws.current) {
            console.log("🔌 Closing WebSocket connection");
            ws.current.close();
            ws.current = null;
        }
    };

    return { sendMessage, isConnected: ws.current?.readyState === WebSocket.OPEN, ws, disconnect };
};
