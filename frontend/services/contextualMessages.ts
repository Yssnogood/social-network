// Service contextuel pour les messages - distingue groupe vs événement
import { GroupMessage, EventMessage, ContextualMessage, DiscussionContext } from '../app/types/group';
import { getGroupMessages, sendGroupMessage } from './group';

const API_BASE_URL = "http://localhost:8090/api";

/**
 * Service unifié pour les messages contextuels
 * Gère automatiquement groupe vs événement vs sous-événement
 */
export class ContextualMessageService {
    /**
     * Charge les messages selon le contexte
     */
    static async getMessages(context: DiscussionContext): Promise<ContextualMessage[]> {
        try {
            switch (context.type) {
                case 'group':
                    // Messages spécifiques au groupe
                    return await getGroupMessages(context.id) as GroupMessage[];
                    
                case 'event':
                    // Messages spécifiques à cet événement (principal ou sous-événement)
                    return await getEventMessages(context.id) as EventMessage[];
                    
                default:
                    throw new Error(`Type de contexte non supporté : ${context.type}`);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des messages contextuels:', error);
            return [];
        }
    }

    /**
     * Envoie un message selon le contexte
     */
    static async sendMessage(context: DiscussionContext, content: string): Promise<ContextualMessage | null> {
        try {
            switch (context.type) {
                case 'group':
                    // Envoie vers la discussion du groupe
                    return await sendGroupMessage(context.id, content) as GroupMessage;
                    
                case 'event':
                    // Envoie vers la discussion spécifique de l'événement
                    return await sendEventMessage(context.id, content) as EventMessage;
                    
                default:
                    throw new Error(`Type de contexte non supporté : ${context.type}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message contextuel:', error);
            throw error;
        }
    }

    /**
     * Détermine le contexte selon le type et l'item sélectionné
     */
    static getDiscussionContext(type: 'group' | 'event', selectedItem: any): DiscussionContext {
        if (type === 'group') {
            return {
                type: 'group',
                id: selectedItem.id
            };
        } else {
            // Pour un événement, on veut la discussion DE CET ÉVÉNEMENT
            // pas celle du groupe parent !
            return {
                type: 'event', 
                id: selectedItem.id, // ID de l'événement
                parentId: selectedItem.group_id // ID du groupe parent pour référence
            };
        }
    }

    /**
     * Convertit un message vers l'interface unifiée
     */
    static toUniversalMessage(message: ContextualMessage, contextType: 'group' | 'event'): any {
        if (contextType === 'group') {
            const groupMsg = message as GroupMessage;
            return {
                ...groupMsg,
                context_type: 'group' as const,
                context_id: groupMsg.group_id
            };
        } else {
            const eventMsg = message as EventMessage;
            return {
                ...eventMsg,
                context_type: 'event' as const,
                context_id: eventMsg.event_id
            };
        }
    }
}

/**
 * API spécifique aux messages d'événement
 */
async function getEventMessages(eventId: number): Promise<EventMessage[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/messages`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch event messages: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching event messages:', error);
        return [];
    }
}

async function sendEventMessage(eventId: number, content: string): Promise<EventMessage> {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`Failed to send event message: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending event message:', error);
        throw error;
    }
}