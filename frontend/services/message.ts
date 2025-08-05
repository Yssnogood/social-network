import { url } from "@/app/login/page";

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  group_id?: number;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: number;
  name: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationContact {
  id: number;
  username: string;
  avatar_path: string;
  isOnline?: boolean;
}

export interface ConversationResponse {
  contact: ConversationContact;
  messages: Message[];
  conversation: Conversation;
}

/**
 * Récupère toutes les conversations de l'utilisateur connecté
 */
export const fetchUserConversations = async (): Promise<ConversationResponse[]> => {
  try {
    const response = await fetch(url + "/messages/user/conversations", {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    return [];
  }
};

/**
 * Récupère les messages d'une conversation spécifique
 */
export const fetchConversationMessages = async (conversationId: number): Promise<Message[]> => {
  try {
    const response = await fetch(url + `/messages?conversation_id=${conversationId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return [];
  }
};

/**
 * Envoie un nouveau message
 */
export interface SendMessageRequest {
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  group_id?: number;
  content: string;
}

export const sendMessage = async (messageData: SendMessageRequest): Promise<Message> => {
  try {
    const response = await fetch(url + "/messages", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Marque un message comme lu
 */
export const markMessageAsRead = async (messageId: number): Promise<void> => {
  try {
    const response = await fetch(url + `/messages/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        id: messageId,
        read_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Crée ou récupère une conversation privée entre deux utilisateurs
 * Note: Cette fonction nécessiterait un endpoint backend dédié
 */
export const createOrGetPrivateConversation = async (recipientId: number): Promise<Conversation> => {
  // TODO: Implémenter l'endpoint backend pour créer/récupérer une conversation privée
  // Pour l'instant, on simule en retournant une nouvelle conversation
  console.log(`Creating conversation with recipient ${recipientId}`);
  return {
    id: Date.now(), // Simulation d'ID
    name: '',
    is_group: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Utilitaires pour la gestion des messages
 */

// Formate l'heure d'un message
export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Formate la date d'un message
export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Aujourd\'hui';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Hier';
  } else {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long' 
    });
  }
};

// Groupe les messages par date
export const groupMessagesByDate = (messages: Message[]): { [date: string]: Message[] } => {
  return messages.reduce((groups, message) => {
    const date = formatMessageDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as { [date: string]: Message[] });
};

// Récupère l'ID de l'utilisateur actuel depuis le JWT côté client
export const getCurrentUserId = (): number | null => {
  try {
    // DEBUG: Voir tous les cookies disponibles
    console.log('DEBUG - All cookies:', document.cookie);
    
    // Récupérer le cookie JWT côté client
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
    
    console.log('DEBUG - Found JWT cookie:', jwtCookie);
    
    if (!jwtCookie) {
      console.warn('JWT cookie not found');
      return null;
    }
    
    const token = jwtCookie.split('=')[1];
    console.log('DEBUG - Extracted token:', token);
    if (!token) {
      console.warn('JWT token is empty');
      return null;
    }
    
    // Décoder le JWT (partie payload seulement, pas de vérification de signature côté client)
    const base64Url = token.split('.')[1];
    console.log('DEBUG - Base64Url part:', base64Url);
    if (!base64Url) {
      console.warn('Invalid JWT format');
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    console.log('DEBUG - Decoded payload:', jsonPayload);
    
    const decoded = JSON.parse(jsonPayload) as { user_id?: number };
    console.log('DEBUG - Parsed decoded:', decoded);
    console.log('DEBUG - Final user_id:', decoded.user_id);
    return decoded.user_id || null;
  } catch (error) {
    console.error('Error decoding JWT for user ID:', error);
    return null;
  }
};