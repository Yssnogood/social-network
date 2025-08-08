'use client';

import { useState, useEffect } from 'react';
import CreationContentPanel from '../CreationContentPanel';
import type { EventCreationData } from '../CreationContentPanel';
import { User, Group } from '../../../types/group';
import { getCurrentUserClient } from '@/services/user';
import { createEvent, inviteUsersToGroup, inviteGroupsToGroup } from '@/services/group';

interface EventCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (eventId: number) => void;
    parentGroup: Group; // Groupe dans lequel créer l'événement
}

export default function EventCreationModal({
    isOpen,
    onClose,
    onSuccess,
    parentGroup
}: EventCreationModalProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // Mémoire tampon persistante pour les événements (même entre fermetures)
    const [creationData, setCreationData] = useState<EventCreationData>({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        imageUrl: undefined,
        isPrivate: false
    });
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger les données utilisateur
    useEffect(() => {
        if (isOpen) {
            loadCurrentUser();
            // Pré-remplir la date avec demain à 18h
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(18, 0, 0, 0);
            setCreationData(prev => ({
                ...prev,
                eventDate: tomorrow.toISOString()
            }));
        }
    }, [isOpen]);

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

    const handleClose = () => {
        // Reset du formulaire
        setCreationData({
            title: '',
            description: '',
            eventDate: '',
            location: '',
            imageUrl: undefined,
            isPrivate: false
        });
        setSelectedUserIds([]);
        setSelectedGroupIds([]);
        setError(null);
        setIsCreating(false);
        onClose();
    };

    const handleCreateWithInvitations = async (selectedGroupId?: number) => {
        if (!creationData.title.trim()) {
            setError('Le nom de l\'événement est requis');
            return;
        }

        if (!creationData.eventDate) {
            setError('La date de l\'événement est requise');
            return;
        }

        // Vérifier que la date est dans le futur
        const eventDate = new Date(creationData.eventDate);
        if (eventDate <= new Date()) {
            setError('La date de l\'événement doit être dans le futur');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // 1. Créer l'événement
            const finalGroupId = selectedGroupId || parentGroup.id;
            const newEvent = await createEvent({
                title: creationData.title,
                description: creationData.description,
                eventDate: creationData.eventDate,
                location: creationData.location,
                groupId: finalGroupId,
                imageUrl: creationData.imageUrl,
                invitedUsers: [] // On gère les invitations séparément
            });

            // 2. Envoyer les invitations si il y en a
            // Note: Les invitations pour événements peuvent être gérées différemment
            // Pour l'instant, on utilise les mêmes API que pour les groupes
            const invitationPromises = [];
            
            if (selectedUserIds.length > 0) {
                // TODO: Créer une API spécifique pour inviter à un événement
                console.log('Users to invite to event:', selectedUserIds);
            }
            
            if (selectedGroupIds.length > 0) {
                // TODO: Créer une API spécifique pour inviter des groupes à un événement
                console.log('Groups to invite to event:', selectedGroupIds);
            }
            
            if (invitationPromises.length > 0) {
                await Promise.all(invitationPromises);
            }

            // 3. Succès - fermer la modale et notifier
            handleClose();
            if (onSuccess) {
                onSuccess(newEvent.id);
            }

        } catch (error) {
            console.error('Error creating event:', error);
            setError(error instanceof Error ? error.message : 'Erreur lors de la création de l\'événement');
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose}></div>
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="bg-gray-900 rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header de la modale */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Créer un Événement</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Nouvel événement pour <span className="text-blue-400 font-medium">{parentGroup.title}</span>
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {/* Indicateur du nombre d'invitations */}
                            {(selectedUserIds.length > 0 || selectedGroupIds.length > 0) && (
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-gray-400">Participants:</span>
                                    {selectedUserIds.length > 0 && (
                                        <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs">
                                            {selectedUserIds.length} utilisateur{selectedUserIds.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {selectedGroupIds.length > 0 && (
                                        <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">
                                            {selectedGroupIds.length} groupe{selectedGroupIds.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {/* Bouton fermer */}
                            <button
                                onClick={handleClose}
                                disabled={isCreating}
                                className="text-gray-400 hover:text-white transition-colors p-2 disabled:opacity-50"
                                title="Fermer"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Contenu principal avec les 3 tiroirs */}
                    <div className="flex-1 min-h-0">
                        <CreationContentPanel
                            type="event"
                            currentUser={currentUser}
                            parentGroupId={parentGroup.id}
                            creationData={creationData}
                            onCreationDataChange={(data) => setCreationData(data as EventCreationData)}
                            selectedUserIds={selectedUserIds}
                            selectedGroupIds={selectedGroupIds}
                            onSelectedUsersChange={setSelectedUserIds}
                            onSelectedGroupsChange={setSelectedGroupIds}
                            onCreateWithInvitations={() => handleCreateWithInvitations()}
                            onCancel={handleClose}
                            isCreating={isCreating}
                            error={error}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}