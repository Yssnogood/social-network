// Group service - API calls for group-related operations

import { GroupPost, GroupMessage, GroupComment, Event, GroupMember } from '../app/types/group';

const API_BASE_URL = "http://localhost:8090/api";

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
        // S'assurer que nous retournons toujours un tableau, même si l'API retourne null
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching group messages:', error);
        // Return empty array as fallback
        return [];
    }
}

export async function getGroupEvents(groupId: number): Promise<Event[]> {
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

// Implemented functions for group interactions
export async function createGroupPost(groupId: number, postData: { content: string, imageUrl?: string }): Promise<GroupPost> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ 
                content: postData.content,
                image_path: postData.imageUrl 
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create group post: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating group post:', error);
        throw error;
    }
}

export async function sendGroupMessage(groupId: number, content: string): Promise<GroupMessage> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`Failed to send group message: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending group message:', error);
        throw error;
    }
}

export async function respondToEvent(eventId: number, status: 'going' | 'not_going'): Promise<void> {
    try {
        // Note: API only supports 'going' and 'not_going', not 'maybe'
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/response`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error(`Failed to respond to event: ${response.status}`);
        }
    } catch (error) {
        console.error('Error responding to event:', error);
        throw error;
    }
}

export async function deleteGroupEvent(eventId: number): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to delete event: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}

export async function getGroupPostComments(groupId: number, postId: number): Promise<GroupComment[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/posts/${postId}/comments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch post comments: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching post comments:', error);
        // Return empty array as fallback
        return [];
    }
}

export async function createGroupPostComment(groupId: number, postId: number, content: string): Promise<GroupComment> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`Failed to create post comment: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating post comment:', error);
        throw error;
    }
}

export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch group members: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching group members:', error);
        // Return empty array as fallback
        return [];
    }
}

export async function getGroupsByUser(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/user/groups`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user groups: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user groups:', error);
        // Return empty array as fallback
        return [];
    }
}

export async function inviteUsersToGroup(groupId: number, userIds: number[]): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/invite/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ user_ids: userIds })
        });

        if (!response.ok) {
            throw new Error(`Failed to invite users: ${response.status}`);
        }
    } catch (error) {
        console.error('Error inviting users to group:', error);
        throw error;
    }
}

export async function inviteGroupsToGroup(groupId: number, groupIds: number[]): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/invite/groups`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ group_ids: groupIds })
        });

        if (!response.ok) {
            throw new Error(`Failed to invite groups: ${response.status}`);
        }
    } catch (error) {
        console.error('Error inviting groups to group:', error);
        throw error;
    }
}

// Fonction pour créer un groupe
export async function createGroup(groupData: { 
    title: string; 
    description: string; 
    imageUrl?: string; 
    invitedUsers: number[]; 
}): Promise<{ id: number; title: string; description: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                title: groupData.title,
                description: groupData.description
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create group: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
}

// Fonction pour créer un événement dans un groupe
export async function createEvent(eventData: {
    title: string;
    description: string;
    eventDate: string;
    location?: string;
    groupId: number;
    imageUrl?: string;
    invitedUsers: number[];
}): Promise<{ id: number; title: string; description: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${eventData.groupId}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                title: eventData.title,
                description: eventData.description,
                event_date: new Date(eventData.eventDate).toISOString()
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create event: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
}