/**
 * Service pour la gestion de création de groupes et événements
 * Utilise les API endpoints existants
 */

interface CreateGroupData {
    title: string;
    description: string;
    imageUrl?: string;
    invitedUsers?: number[];
}

interface CreateEventData {
    title: string;
    description: string;
    eventDate: string;
    location?: string;
    groupId: number;
    imageUrl?: string;
    invitedUsers?: number[];
}

interface Group {
    id: number;
    title: string;
    description: string;
    creatorName: string;
    created_at: string;
    updated_at: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    event_date: string;
    group_id: number;
    creator_id: number;
    created_at: string;
    updated_at: string;
}

/**
 * Créer un nouveau groupe
 */
export async function createGroup(data: CreateGroupData): Promise<Group> {
    try {
        const response = await fetch('http://localhost:8090/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                title: data.title,
                description: data.description,
                // Note: L'API actuelle ne gère pas encore imageUrl et invitedUsers
                // Ces champs seront ajoutés dans une version future de l'API
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create group: ${errorText}`);
        }

        const createdGroup = await response.json();

        // TODO: Gérer les invitations après la création du groupe
        if (data.invitedUsers && data.invitedUsers.length > 0) {
            await sendGroupInvitations(createdGroup.id, data.invitedUsers);
        }

        return createdGroup;
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
}

/**
 * Créer un nouvel événement dans un groupe
 */
export async function createEvent(data: CreateEventData): Promise<Event> {
    try {
        const formattedEvent = {
            title: data.title,
            description: data.description,
            event_date: new Date(data.eventDate).toISOString(),
            // Note: L'API actuelle ne gère pas encore location, imageUrl et invitedUsers
            // Ces champs seront ajoutés dans une version future de l'API
        };

        const response = await fetch(`http://localhost:8090/api/groups/${data.groupId}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formattedEvent)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create event: ${errorText}`);
        }

        const createdEvent = await response.json();

        // TODO: Gérer les invitations spécifiques à l'événement
        if (data.invitedUsers && data.invitedUsers.length > 0) {
            // Pour l'instant, on utilise les invitations de groupe
            // Dans le futur, on pourra avoir des invitations spécifiques aux événements
            await sendGroupInvitations(data.groupId, data.invitedUsers);
        }

        return createdEvent;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
}

/**
 * Récupérer tous les groupes de l'utilisateur
 * Utile pour la sélection de groupe lors de la création d'événement
 */
export async function getUserGroups(): Promise<Group[]> {
    try {
        const response = await fetch('http://localhost:8090/api/groups', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user groups');
        }

        const groups = await response.json();
        return groups || [];
    } catch (error) {
        console.error('Error fetching user groups:', error);
        return [];
    }
}

/**
 * Envoyer des invitations de groupe à des utilisateurs
 * Utilise l'endpoint existant d'invitation
 */
async function sendGroupInvitations(groupId: number, userIds: number[]): Promise<void> {
    try {
        // Envoyer les invitations une par une (limitation API actuelle)
        const invitationPromises = userIds.map(userId =>
            fetch(`http://localhost:8090/api/groups/${groupId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ user_id: userId })
            })
        );

        const results = await Promise.allSettled(invitationPromises);
        
        // Vérifier les échecs d'invitation
        const failures = results.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
            console.warn(`${failures.length} invitations failed to send`);
            // Ne pas faire échouer toute l'opération pour quelques invitations ratées
        }

    } catch (error) {
        console.error('Error sending group invitations:', error);
        // Les invitations sont optionnelles, ne pas faire échouer la création
    }
}

/**
 * Vérifier si l'utilisateur a les permissions pour créer un événement dans un groupe
 */
export async function canCreateEventInGroup(groupId: number): Promise<boolean> {
    try {
        const response = await fetch(`http://localhost:8090/api/groups/${groupId}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            return false;
        }

        // L'utilisateur peut créer un événement s'il peut accéder au groupe
        // (membre du groupe ou créateur)
        return true;
    } catch (error) {
        console.error('Error checking group permissions:', error);
        return false;
    }
}

/**
 * Formater les données depuis EditorPanel vers les services
 */
export function formatEditorDataForGroup(formData: any): CreateGroupData {
    return {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        invitedUsers: formData.invitedUsers
    };
}

export function formatEditorDataForEvent(formData: any, groupId: number): CreateEventData {
    return {
        title: formData.title.trim(),
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        location: formData.location?.trim(),
        groupId,
        imageUrl: formData.imageUrl,
        invitedUsers: formData.invitedUsers
    };
}