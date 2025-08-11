// Hook WebSocket contextuel - utilise le bon WebSocket selon le contexte
import { useEffect, useState } from 'react';
import { DiscussionContext, ContextualMessage, GroupMessage, EventMessage } from '../types/group';
import { useGroupWebSocket } from './useGroupWebSocket';
import { useEventWebSocket } from './useEventWebSocket';

interface UseContextualWebSocketProps {
    context: DiscussionContext;
    setMessages: (messages: ContextualMessage[] | ((prev: ContextualMessage[]) => ContextualMessage[])) => void;
}

/**
 * Hook unifié qui gère WebSocket selon le contexte (groupe vs événement)
 */
export const useContextualWebSocket = ({ context, setMessages }: UseContextualWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);

    // Hook pour les messages de groupe
    useGroupWebSocket(
        context.type === 'group' ? context.id.toString() : '', 
        context.type === 'group' ? (msgs) => setMessages(msgs as ContextualMessage[]) : () => {}
    );

    // Hook pour les messages d'événement  
    useEventWebSocket(
        context.type === 'event' ? context.id.toString() : '',
        context.type === 'event' ? (msgs) => setMessages(msgs as ContextualMessage[]) : () => {}
    );

    useEffect(() => {
        // Simuler l'état de connexion selon le contexte
        setIsConnected(true);
        
        return () => {
            setIsConnected(false);
        };
    }, [context.type, context.id]);

    return {
        isConnected,
        context
    };
};

/**
 * Hook utilitaire pour transformer les messages selon le contexte
 */
export const useMessageTransform = (context: DiscussionContext) => {
    const transformMessage = (message: any): ContextualMessage => {
        if (context.type === 'group') {
            // Assurer que c'est un GroupMessage
            return {
                id: message.id,
                group_id: message.group_id || context.id,
                user_id: message.user_id,
                username: message.username,
                content: message.content,
                created_at: message.created_at,
                updated_at: message.updated_at
            } as GroupMessage;
        } else {
            // Assurer que c'est un EventMessage
            return {
                id: message.id,
                event_id: message.event_id || context.id,
                user_id: message.user_id,
                username: message.username,
                content: message.content,
                created_at: message.created_at,
                updated_at: message.updated_at
            } as EventMessage;
        }
    };

    const transformMessages = (messages: any[]): ContextualMessage[] => {
        return messages.map(transformMessage);
    };

    return {
        transformMessage,
        transformMessages
    };
};