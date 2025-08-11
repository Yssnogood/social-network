// Invitation service - API calls for invitation-related operations

const API_BASE_URL = "http://localhost:8090/api";

export interface Invitation {
    id: number;
    group_id: number;
    group_title: string;
    inviter_id: number;
    inviter_name: string;
    invitee_id: number;
    pending: boolean;
    created_at: string;
}

export interface InvitationResponse {
    action: 'accept' | 'decline';
}

// Get all invitations received by a user
export async function getUserReceivedInvitations(userId: number): Promise<Invitation[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/invitations/received`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch received invitations: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching received invitations:', error);
        return [];
    }
}

// Get all invitations sent by a user
export async function getUserSentInvitations(userId: number): Promise<Invitation[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/invitations/sent`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sent invitations: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching sent invitations:', error);
        return [];
    }
}

// Respond to an invitation (accept or decline)
export async function respondToInvitation(invitationId: number, action: 'accept' | 'decline'): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/respond`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ action })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to respond to invitation: ${errorText}`);
        }
    } catch (error) {
        console.error(`Error ${action}ing invitation:`, error);
        throw error;
    }
}

// Cancel an invitation (for the sender)
export async function cancelInvitation(invitationId: number): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/cancel`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to cancel invitation: ${errorText}`);
        }
    } catch (error) {
        console.error('Error canceling invitation:', error);
        throw error;
    }
}

// Convenience functions for accept/decline
export async function acceptInvitation(invitationId: number): Promise<void> {
    return respondToInvitation(invitationId, 'accept');
}

export async function declineInvitation(invitationId: number): Promise<void> {
    return respondToInvitation(invitationId, 'decline');
}