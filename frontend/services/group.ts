// Group service - API calls for group-related operations

const API_BASE_URL = "http://localhost:8090/api";

export interface GroupPost {
    id: number;
    content: string;
    created_at: string;
    author_name: string;
    // Add other fields as needed
}

export interface GroupMessage {
    id: number;
    content: string;
    created_at: string;
    author_name: string;
    // Add other fields as needed
}

export interface GroupEvent {
    id: number;
    title: string;
    description: string;
    event_date: string;
    location?: string;
    group_id: number;
    // Add other fields as needed
}

export async function getGroupPosts(groupId: number): Promise<GroupPost[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/posts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch group posts: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching group posts:', error);
        // Return empty array as fallback
        return [];
    }
}

export async function getGroupMessages(groupId: number): Promise<GroupMessage[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/messages`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch group messages: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching group messages:', error);
        // Return empty array as fallback
        return [];
    }
}

export async function getGroupEvents(groupId: number): Promise<GroupEvent[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/events`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch group events: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching group events:', error);
        // Return empty array as fallback
        return [];
    }
}

// Placeholder functions for future implementation
export async function createGroupPost(groupId: number, content: string): Promise<GroupPost> {
    // TODO: Implement API call
    throw new Error('createGroupPost not implemented yet');
}

export async function sendGroupMessage(groupId: number, content: string): Promise<GroupMessage> {
    // TODO: Implement API call
    throw new Error('sendGroupMessage not implemented yet');
}

export async function respondToEvent(eventId: number, status: 'going' | 'maybe' | 'not_going'): Promise<void> {
    // TODO: Implement API call
    throw new Error('respondToEvent not implemented yet');
}

export async function deleteGroupEvent(eventId: number): Promise<void> {
    // TODO: Implement API call
    throw new Error('deleteGroupEvent not implemented yet');
}