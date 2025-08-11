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
 * 🎯 SOLUTION CONFORME AUX RÈGLES REACT HOOKS
 */
export const useContextualWebSocket = ({ context, setMessages }: UseContextualWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);

    // Créer les callbacks qui seront utilisés selon le contexte
    const onGroupMessages = (msgs: GroupMessage[]) => {
        if (context.type === 'group') {
            console.log(`🔌 WebSocket GROUPE reçu ${msgs.length} messages pour groupe ${context.id}`);
            setMessages(msgs as ContextualMessage[]);
        }
    };
    
    const onEventMessages = (msgs: EventMessage[]) => {
        if (context.type === 'event') {
            console.log(`🔌 WebSocket ÉVÉNEMENT reçu ${msgs.length} messages pour événement ${context.id}`);
            setMessages(msgs as ContextualMessage[]);
        }
    };

    // 🎯 TOUJOURS appeler les hooks, mais ne traiter que le bon selon le contexte
    useGroupWebSocket(
        context.type === 'group' ? context.id.toString() : '', 
        onGroupMessages
    );

    useEventWebSocket(
        context.type === 'event' ? context.id.toString() : '',
        onEventMessages
    );

    useEffect(() => {
        console.log(`🎯 WebSocket contextuel activé pour ${context.type} ID:${context.id}`);
        setIsConnected(true);
        
        return () => {
            console.log(`🎯 WebSocket contextuel déconnecté pour ${context.type} ID:${context.id}`);
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
    const transformMessage = (message: GroupMessage | EventMessage): ContextualMessage => {
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

    const transformMessages = (messages: (GroupMessage | EventMessage)[]): ContextualMessage[] => {
        return messages.map(transformMessage);
    };

    return {
        transformMessage,
        transformMessages
    };
};