'use client';

import { useEffect, useRef } from 'react';
import { getCurrentUserId } from '../../services/auth';

/**
 * Hook pour maintenir la présence de l'utilisateur via WebSocket
 * Établit une connexion automatique pour indiquer que l'utilisateur est en ligne
 */
export function usePresence() {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connectPresenceWebSocket = async () => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) {
                console.log('No user ID, skipping presence connection');
                return;
            }

            // Fermer la connexion existante si elle existe
            if (wsRef.current) {
                wsRef.current.close();
            }

            const wsUrl = `ws://localhost:8090/ws`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ Presence WebSocket connected');
                reconnectAttempts.current = 0;
                
                // Envoyer un message de présence
                ws.send(JSON.stringify({
                    type: 'presence',
                    sender_id: userId,
                    content: 'online'
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    if (message.type === 'notification') {
                        // Déclencher un événement personnalisé pour notifier les composants
                        const notificationEvent = new CustomEvent('new-notification', {
                            detail: {
                                id: message.notification_id,
                                user_id: userId, // Ajouter le user_id depuis le contexte local
                                type: message.notification_type,
                                content: message.content,
                                read: message.read,
                                reference_id: message.reference_id,
                                reference_type: message.reference_type,
                                created_at: message.timestamp
                            }
                        });
                        window.dispatchEvent(notificationEvent);
                    } else if (message.type === 'notification_removed') {
                        // Déclencher un événement personnalisé pour supprimer la notification
                        const removeNotificationEvent = new CustomEvent('remove-notification', {
                            detail: {
                                type: message.notification_type,
                                reference_id: message.reference_id,
                                reference_type: message.reference_type,
                                content: message.content
                            }
                        });
                        window.dispatchEvent(removeNotificationEvent);
                    } else {
                        // Autres messages de présence
                        console.log('Presence message received:', message);
                    }
                } catch (error) {
                    console.error('Error parsing presence message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('🔌 Presence WebSocket disconnected:', event.code, event.reason);
                wsRef.current = null;

                // Reconnexion automatique avec backoff exponentiel
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    console.log(`🔄 Reconnecting presence in ${delay}ms...`);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        connectPresenceWebSocket();
                    }, delay);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ Presence WebSocket error:', error);
            };

        } catch (error) {
            console.error('Error connecting presence WebSocket:', error);
        }
    };

    useEffect(() => {
        // Établir la connexion au montage
        connectPresenceWebSocket();

        // Nettoyage à la fermeture
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);

    // Gestion de la visibilité de la page pour maintenir la connexion
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !wsRef.current) {
                // Reconnexion quand la page redevient visible
                connectPresenceWebSocket();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
        reconnect: connectPresenceWebSocket
    };
}