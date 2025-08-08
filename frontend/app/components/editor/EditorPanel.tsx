'use client';

import { useState, useEffect } from 'react';
import { useOnePage } from '../../contexts/OnePageContext';
import CreationContentPanel from '../creation/CreationContentPanel';
import type { GroupCreationData, EventCreationData } from '../creation/CreationContentPanel';
import { User } from '../../types/group';
import { getCurrentUserClient } from '@/services/user';
import { createGroup, createEvent, inviteUsersToGroup, inviteGroupsToGroup } from '@/services/group';
import { useEditorSubmit } from '../../hooks/useEditorSubmit';

interface EditorPanelProps {
    type: 'group' | 'event';
    onCancel: () => void;
    onSuccess?: (createdItem: any) => void;
}

export default function EditorPanel({ type, onCancel, onSuccess }: EditorPanelProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // Mémoire tampon séparée pour chaque type
    const [groupBuffer, setGroupBuffer] = useState<GroupCreationData>({
        title: '',
        description: '',
        imageUrl: undefined,
        isPrivate: false,
        parentGroupId: undefined
    });
    
    const [eventBuffer, setEventBuffer] = useState<EventCreationData>({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        imageUrl: undefined,
        isPrivate: false
    });
    
    // Données de création actives basées sur le type
    const creationData = type === 'group' ? groupBuffer : eventBuffer;
    
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Utiliser le hook pour obtenir les groupes disponibles (pour les événements)
    const { 
        availableGroups, 
        selectedGroupId, 
        setSelectedGroupId,
        isLoadingGroups 
    } = useEditorSubmit({ type, onSuccess: () => {} });

    // Charger l'utilisateur actuel
    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const userData = await getCurrentUserClient();
                const user: User = {
                    id: userData.id,
                    username: userData.username
                };
                setCurrentUser(user);
            } catch (error) {
                console.error('Error loading current user:', error);
                setError('Erreur lors du chargement des données utilisateur');
            }
        };

        loadCurrentUser();
    }, []);

    // Pré-remplir la date pour les événements (une seule fois)
    useEffect(() => {
        if (type === 'event' && eventBuffer.eventDate === '') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(18, 0, 0, 0);
            setEventBuffer(prev => ({
                ...prev,
                eventDate: tomorrow.toISOString()
            }));
        }
    }, [type, eventBuffer.eventDate]);
    
    // Fonction pour mettre à jour les données selon le type
    const handleCreationDataChange = (data: GroupCreationData | EventCreationData) => {
        if (type === 'group') {
            setGroupBuffer(data as GroupCreationData);
        } else {
            setEventBuffer(data as EventCreationData);
        }
    };

    const handleCreateWithInvitations = async (creationSelectedGroupId?: number) => {
        if (!creationData.title.trim()) {
            setError('Le nom est requis');
            return;
        }

        // Variable pour stocker l'ID du groupe (définie en dehors du bloc if)
        let finalGroupId: number | undefined;

        if (type === 'event') {
            if (!(creationData as EventCreationData).eventDate) {
                setError('La date de l\'événement est requise');
                return;
            }

            const eventDate = new Date((creationData as EventCreationData).eventDate);
            if (eventDate <= new Date()) {
                setError('La date de l\'événement doit être dans le futur');
                return;
            }

            // Utiliser le groupe sélectionné depuis CreationContentPanel ou du hook comme fallback
            finalGroupId = creationSelectedGroupId || selectedGroupId;
            if (!finalGroupId) {
                setError('Veuillez sélectionner un groupe pour l\'événement');
                return;
            }
        }

        setIsCreating(true);
        setError(null);

        try {
            let newItem;
            
            if (type === 'group') {
                // Créer le groupe
                newItem = await createGroup({
                    title: creationData.title,
                    description: creationData.description,
                    imageUrl: creationData.imageUrl,
                    invitedUsers: []
                });
            } else {
                // Créer l'événement
                const eventData = creationData as EventCreationData;
                newItem = await createEvent({
                    title: eventData.title,
                    description: eventData.description,
                    eventDate: eventData.eventDate,
                    location: eventData.location,
                    groupId: finalGroupId!, // finalGroupId est garanti d'être défini ici
                    imageUrl: eventData.imageUrl,
                    invitedUsers: []
                });
            }

            // Envoyer les invitations
            if (type === 'group') {
                const invitationPromises = [];
                
                if (selectedUserIds.length > 0) {
                    invitationPromises.push(inviteUsersToGroup(newItem.id, selectedUserIds));
                }
                
                if (selectedGroupIds.length > 0) {
                    invitationPromises.push(inviteGroupsToGroup(newItem.id, selectedGroupIds));
                }
                
                if (invitationPromises.length > 0) {
                    await Promise.all(invitationPromises);
                }
            }

            // Succès
            if (onSuccess) {
                onSuccess(newItem);
            }
            onCancel(); // Fermer le panel
        } catch (error) {
            console.error(`Error creating ${type}:`, error);
            setError(error instanceof Error ? error.message : `Erreur lors de la création ${type === 'group' ? 'du groupe' : 'de l\'événement'}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <div className="h-full bg-gray-900">
            <CreationContentPanel
                type={type}
                currentUser={currentUser}
                parentGroupId={type === 'event' ? selectedGroupId || undefined : undefined}
                creationData={creationData}
                onCreationDataChange={handleCreationDataChange}
                selectedUserIds={selectedUserIds}
                selectedGroupIds={selectedGroupIds}
                onSelectedUsersChange={setSelectedUserIds}
                onSelectedGroupsChange={setSelectedGroupIds}
                onCreateWithInvitations={handleCreateWithInvitations}
                onCancel={handleCancel}
                isCreating={isCreating}
                error={error}
            />
        </div>
    );
}